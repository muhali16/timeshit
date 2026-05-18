const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const googleDriveService = require('./googleDriveService');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

class UploadService {
  constructor() {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  }

  async uploadToDrive(file, entryDate, fileIndex = 0, userId) {
    const result = await googleDriveService.uploadFile({
      readableStream: file.file,
      fileName: file.filename,
      mimeType: file.mimetype,
      entryDate,
      fileIndex,
      userId,
    });

    return {
      fileName: result.fileName,
      storedName: result.fileName,
      filePath: null,
      fileSize: result.size,
      fileType: result.mimeType,
      url: result.webViewLink,
      googleDriveFileId: result.fileId,
      googleDriveUrl: result.webViewLink,
      folderPath: result.folderPath,
      source: 'google_drive',
    };
  }

  async saveLocal(file, subDir = '') {
    const destDir = path.join(UPLOAD_DIR, subDir);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const ext = path.extname(file.filename);
    const baseName = path.basename(file.filename, ext);
    const safeName = `${Date.now()}-${baseName.replace(/[^a-zA-Z0-9]/g, '_')}${ext}`;
    const destPath = path.join(destDir, safeName);

    await pipeline(file.file, fs.createWriteStream(destPath));

    const stats = fs.statSync(destPath);

    return {
      fileName: file.filename,
      storedName: safeName,
      filePath: destPath,
      fileSize: stats.size,
      fileType: file.mimetype,
      url: `/uploads/${subDir ? subDir + '/' : ''}${safeName}`,
      googleDriveFileId: null,
      googleDriveUrl: null,
      folderPath: null,
      source: 'local',
    };
  }
}

module.exports = new UploadService();
