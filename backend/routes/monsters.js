const express = require("express");
const {
  getAllMonsters,
  createMonster,
  deleteMonster,
} = require("../controllers/monsterController");
const { verifyToken } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Pasta de uploads para monstros
const uploadPath = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

const router = express.Router();

// Lista todos os monstros do mestre atual
router.get("/", verifyToken, getAllMonsters);

// Cria um novo monstro (com imagem opcional)
router.post("/", verifyToken, upload.single("image"), createMonster);

// Exclui um monstro
router.delete("/:id", verifyToken, deleteMonster);

module.exports = router;
