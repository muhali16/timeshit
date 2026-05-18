const { google } = require('googleapis');

function createOAuthClient(accessToken, refreshToken) {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET
  );

  oAuth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return oAuth2Client;
}

module.exports = { createOAuthClient };
