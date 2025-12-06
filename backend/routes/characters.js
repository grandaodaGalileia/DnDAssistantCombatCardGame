const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  uploadMiddleware,
  characterController,
} = require("../controllers/characterController");

// Todas as rotas aqui exigem autenticação
router.post("/", verifyToken, uploadMiddleware, characterController.create);
router.get("/", verifyToken, characterController.getAll);
router.delete("/:id", verifyToken, characterController.delete);

module.exports = router;
