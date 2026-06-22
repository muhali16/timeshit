const { google } = require("googleapis");
const { db } = require("../database/connection");
const { users } = require("../database/schema");
const { eq } = require("drizzle-orm");

const OAUTH_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const OAUTH_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const OAUTH_REDIRECT_URI = process.env.GOOGLE_OAUTH_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.file",
];

function getOAuthClient() {
  return new google.auth.OAuth2(
    OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET,
    OAUTH_REDIRECT_URI,
  );
}

class AuthController {
  async googleRedirect(req, reply) {
    const oAuth2Client = getOAuthClient();
    const url = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: SCOPES,
    });
    return reply.redirect(url);
  }

  async googleCallback(req, reply) {
    const { code } = req.query;

    if (!code) {
      return reply.redirect(`${FRONTEND_URL}/login?error=no_code`);
    }

    try {
      const oAuth2Client = getOAuthClient();
      const { tokens } = await oAuth2Client.getToken(code);

      oAuth2Client.setCredentials(tokens);

      const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
      const { data: profile } = await oauth2.userinfo.get();

      const email = profile.email;
      const name = profile.name || email.split("@")[0];
      const avatar = profile.picture || null;
      const accessToken = tokens.access_token || null;
      const refreshToken = tokens.refresh_token || null;
      const tokenExpiry = tokens.expiry_date
        ? new Date(tokens.expiry_date)
        : null;

      let userRows = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (userRows.length > 0) {
        // User sudah terdaftar: cukup refresh token Google OAuth (dibutuhkan
        // agar upload ke Drive tetap jalan). JANGAN timpa name/avatar/settings
        // karena bisa saja sudah dikustomisasi user lewat halaman Settings.
        const updateData = {};
        if (accessToken) updateData.googleAccessToken = accessToken;
        if (refreshToken) updateData.googleRefreshToken = refreshToken;
        if (tokenExpiry) updateData.googleTokenExpiry = tokenExpiry;

        if (Object.keys(updateData).length > 0) {
          updateData.updatedAt = new Date();
          await db.update(users).set(updateData).where(eq(users.email, email));
          userRows = await db
            .select()
            .from(users)
            .where(eq(users.email, email));
        }
      } else {
        const [created] = await db
          .insert(users)
          .values({
            email,
            name,
            avatar,
            googleAccessToken: accessToken,
            googleRefreshToken: refreshToken,
            googleTokenExpiry: tokenExpiry,
          })
          .returning();
        userRows = [created];
      }

      const user = userRows[0];

      const jwtToken = await reply.server.jwt.sign(
        { userId: user.id, email: user.email },
        { expiresIn: "7d" },
      );

      reply.setCookie("token", jwtToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
      });

      return reply.redirect(`${FRONTEND_URL}/`);
    } catch (err) {
      req.log.error(err, "Google OAuth callback failed");
      return reply.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
  }

  async me(req, reply) {
    try {
      const userRows = await db
        .select()
        .from(users)
        .where(eq(users.id, req.userId));
      const user = userRows[0];

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: "User tidak ditemukan",
        });
      }

      return reply.send({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          timezone: user.timezone,
          googleDriveFolderId: user.googleDriveFolderId,
          hasGoogleToken: !!user.googleRefreshToken,
          notificationEnabled: user.notificationEnabled,
          defaultStartTime: user.defaultStartTime
            ? user.defaultStartTime.slice(0, 5)
            : null,
          defaultEndTime: user.defaultEndTime
            ? user.defaultEndTime.slice(0, 5)
            : null,
          defaultBreakMinutes: user.defaultBreakMinutes || 0,
          defaultHistoryPeriod: user.defaultHistoryPeriod || "current_month",
          defaultHistoryCustom: user.defaultHistoryCustom || null,
          locations: user.locations || [],
          textFilter: user.textFilter || {
            enabled: false,
            taskMarker: "###",
            categories: [
              {
                name: "Selesai",
                keywords: [
                  "sudah saya kerjakan",
                  "sudah dikerjakan",
                  "sudah selesai",
                  "done",
                  "completed",
                  "merged",
                  "di PR",
                ],
                outputTemplate: "- {task}",
                display: "normal",
              },
              {
                name: "Sedang Dikerjakan",
                keywords: [
                  "sedang dikerjakan",
                  "sedang saya kerjakan",
                  "in progress",
                  "ongoing",
                  "WIP",
                ],
                outputTemplate: "- {task}",
                display: "normal",
              },
              {
                name: "Belum Dikerjakan",
                keywords: [
                  "belum dikerjakan",
                  "not started",
                  "pending",
                  "todo",
                  "belum mulai",
                ],
                outputTemplate: "~ {task} (pending)",
                display: "muted",
              },
            ],
            defaultCategory: "Belum Dikerjakan",
          },
          createdAt: user.createdAt,
        },
      });
    } catch (err) {
      req.log.error(err);
      return reply.status(500).send({
        success: false,
        message: "Gagal mengambil data user",
      });
    }
  }

  async logout(req, reply) {
    reply.clearCookie("token", { path: "/" });
    return reply.send({ success: true, message: "Logout berhasil" });
  }
}

module.exports = new AuthController();
