const { google } = require('googleapis');
const { db } = require('../database/connection');
const { users } = require('../database/schema');
const { eq } = require('drizzle-orm');

const ROOT_FOLDER_NAME = 'TimeShit';

class GoogleDriveService {
  async createDriveClientForUser(userId) {
    const userRows = await db.select().from(users).where(eq(users.id, userId));
    const user = userRows[0];

    if (!user?.googleRefreshToken) {
      throw new Error(
        'Google Drive belum terhubung. Login ulang dengan Google untuk menghubungkan.'
      );
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET
    );
    oAuth2Client.setCredentials({ refresh_token: user.googleRefreshToken });

    return { drive: google.drive({ version: 'v3', auth: oAuth2Client }), user };
  }

  // The `drive.file` OAuth scope only grants access to files this app created,
  // so the root folder must be app-created rather than pasted in by the user.
  // A stored ID can also go stale (folder trashed, or created under an older,
  // broader scope) — in that case fall through and make a fresh one.
  async getOrCreateRootFolder(drive, userId, storedId) {
    if (storedId && (await this.isUsableFolder(drive, storedId))) {
      return storedId;
    }

    const created = await drive.files.create({
      requestBody: {
        name: ROOT_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id',
    });

    await db
      .update(users)
      .set({ googleDriveFolderId: created.data.id, updatedAt: new Date() })
      .where(eq(users.id, userId));

    return created.data.id;
  }

  // ponytail: one extra files.get per upload; cache in-process if it ever shows up in latency
  async isUsableFolder(drive, folderId) {
    try {
      const { data } = await drive.files.get({ fileId: folderId, fields: 'trashed' });
      return !data.trashed;
    } catch (err) {
      if (err.code === 404 || err.code === 403) return false;
      throw err;
    }
  }

  getMonthlyFolderPath(dateStr) {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  formatEvidenceFileName(originalName, entryDate, fileIndex) {
    const ext = originalName.includes('.') ? originalName.slice(originalName.lastIndexOf('.')) : '';
    return `${entryDate}_evidence_${fileIndex + 1}${ext}`;
  }

  async uploadFile({ readableStream, fileName, mimeType, entryDate, fileIndex, userId }) {
    const { drive, user } = await this.createDriveClientForUser(userId);
    const parentFolderId = await this.getOrCreateRootFolder(
      drive,
      userId,
      user.googleDriveFolderId
    );

    const subFolderName = this.getMonthlyFolderPath(entryDate);
    let parentId;
    try {
      parentId = await this.resolveOrCreateFolder(drive, subFolderName, parentFolderId);
    } catch (err) {
      throw new Error(`Gagal membuat/resolving folder GDrive "${subFolderName}": ${err.message}`);
    }

    const formattedName = this.formatEvidenceFileName(fileName, entryDate, fileIndex);

    const fileMetadata = {
      name: formattedName,
      parents: [parentId],
    };

    const media = {
      mimeType: mimeType || 'application/octet-stream',
      body: readableStream,
    };

    let response;
    try {
      response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, name, mimeType, size, parents',
      });
    } catch (err) {
      throw new Error(`Gagal upload file "${formattedName}" ke Google Drive: ${err.message}`);
    }

    const fileId = response.data.id;

    try {
      await drive.permissions.create({
        fileId,
        requestBody: { role: 'reader', type: 'anyone' },
      });
    } catch (err) {
      throw new Error(`File berhasil upload tapi gagal di-share: ${err.message}. File ID: ${fileId}`);
    }

    return {
      fileId,
      fileName: response.data.name,
      mimeType: response.data.mimeType,
      size: response.data.size ? parseInt(response.data.size, 10) : null,
      webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
      webContentLink: `https://drive.google.com/uc?id=${fileId}&export=download`,
      folderPath: subFolderName,
    };
  }

  async deleteFile(userId, fileId) {
    if (!fileId) return { deleted: false, reason: 'no_file_id' };

    try {
      const { drive } = await this.createDriveClientForUser(userId);
      await drive.files.delete({ fileId });
      return { deleted: true };
    } catch (err) {
      if (err.code === 404) {
        return { deleted: false, reason: 'not_found' };
      }
      if (err.code === 403) {
        return { deleted: false, reason: 'forbidden' };
      }
      throw new Error(`Gagal menghapus file dari Google Drive: ${err.message}`);
    }
  }

  async resolveOrCreateFolder(drive, folderName, parentId) {
    const existing = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and name='${folderName}' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)',
    });

    if (existing.data.files && existing.data.files.length > 0) {
      return existing.data.files[0].id;
    }

    const created = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentId],
      },
      fields: 'id',
    });

    return created.data.id;
  }
}

module.exports = new GoogleDriveService();
