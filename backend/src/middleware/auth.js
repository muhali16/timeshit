async function authMiddleware(req, reply) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return reply.status(401).send({
        success: false,
        message: 'Belum login. Silakan login terlebih dahulu.',
      });
    }

    const decoded = await req.server.jwt.verify(token);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
  } catch (err) {
    return reply.status(401).send({
      success: false,
      message: 'Token tidak valid atau sudah expired. Silakan login kembali.',
    });
  }
}

module.exports = authMiddleware;
