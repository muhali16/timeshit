require('dotenv').config();

const { google } = require('googleapis');

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REDIRECT_URI = 'http://localhost:3000/oauth/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set GOOGLE_DRIVE_CLIENT_ID dan GOOGLE_DRIVE_CLIENT_SECRET di .env terlebih dahulu.');
  console.error('Dapatkan credentials dari: https://console.cloud.google.com/apis/credentials');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/drive'],
  prompt: 'consent',
});

console.log('=== Google Drive OAuth 2.0 Token Generator ===\n');
console.log('1. Buka URL ini di browser:');
console.log(`\n${authUrl}\n`);
console.log('2. Login dengan akun Google Anda');
console.log('3. Setelah approve, Anda akan di-redirect ke URL yang mengandung ?code=...');
console.log('4. Copy parameter "code" dari URL tersebut');
console.log('5. Paste di sini:\n');

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Masukkan code: ', async (code) => {
  rl.close();

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('\n=== Token berhasil didapatkan! ===\n');
    console.log('Tambahkan baris berikut ke file .env:\n');
    console.log(`GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refresh_token}\n`);

    if (!tokens.refresh_token) {
      console.warn('PERHATIAN: Refresh token tidak ada. Coba lagi dengan menambahkan prompt=consent.');
    }
  } catch (err) {
    console.error('\nGagal mendapatkan token:', err.message);
  }

  process.exit(0);
});
