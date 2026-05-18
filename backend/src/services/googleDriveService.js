const { google } = require('googleapis');
const { db } = require('../database/connection');
const { users } = require('../database/schema');
const { eq } = require('drizzle-orm');

class GoogleDriveService {
  async createDriveClientForUser(userId) {
    const userRows = await db.select().from(users).where(eq(users.id, userId));
    const user = userRows[0];

    if (!user?.googleRefreshToken) {
      throw new Error(
        'Google Drive belum terhubung. Login ulang dengan Google untuk menghubungkan.'
      );
    }

    if (!user.googleDriveFolderId) {
      throw new Error(
        'Google Drive folder belum di-set. Atur folder ID di halaman Settings.'
      );
    }

    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_OAUTH_CLIENT_ID,
      process.env.GOOGLE_OAUTH_CLIENT_SECRET
    );
    oAuth2Client.setCredentials({ refresh_token: user.googleRefreshToken });

    return {
      drive: google.drive({ version: 'v3', auth: oAuth2Client }),
      parentFolderId: user.googleDriveFolderId,
    };
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
    const { drive, parentFolderId } = await this.createDriveClientForUser(userId);

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
