const { auth } = require("../firebase/firebase-config");

const verifyToken = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token ausente ou mal formatado" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = decoded; // Passa informações do usuário para o próximo handler
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

module.exports = { verifyToken };
