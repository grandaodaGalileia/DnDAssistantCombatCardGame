const express = require("express");
const { auth, db } = require("../firebase/firebase-config");
const router = express.Router();
const { authController } = require("../controllers/authController");

// Registro com nome de usuário
router.post("/register", async (req, res) => {
  const { uid, email, username } = req.body;

  if (!uid || !email || !username) {
    return res.status(400).json({ error: "Faltam dados para registro" });
  }

  try {
    await db.collection("users").doc(uid).set({ email, username });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao salvar dados do usuário" });
  }
});

// Verificação de Token
router.post("/verify-token", async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await auth.verifyIdToken(token);
    const userDoc = await db.collection("users").doc(decoded.uid).get();

    if (!userDoc.exists) {
      return res.json({ uid: decoded.uid, username: null });
    }

    const data = userDoc.data();
    res.json({ uid: decoded.uid, username: data.username || null });
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
});

module.exports = router;
