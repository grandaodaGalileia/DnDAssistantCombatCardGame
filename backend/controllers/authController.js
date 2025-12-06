const { auth } = require("../firebase/firebase-config");
exports.authController = {
  verifyToken: async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token não enviado." });

    try {
      const decoded = await auth.verifyIdToken(token);
      res.json({ uid: decoded.uid, email: decoded.email });
    } catch (err) {
      res.status(401).json({ error: "Token inválido." });
    }
  },
};
