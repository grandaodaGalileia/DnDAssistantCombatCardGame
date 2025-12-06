const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const {
  createRoom,
  getRoom,
  getMyRooms,
  deleteRoom,
  joinRoom,
  startCombat,
} = require("../controllers/roomController");

const router = express.Router();

// Criar Sala (Mestre)
router.post("/", verifyToken, createRoom);

// Obter detalhes da Sala
router.get("/:id", verifyToken, getRoom);

//Obter detalhes da Sala do Usuario
router.get("/", verifyToken, getMyRooms);

//Deletar Sala do Usuario
router.delete("/:id", verifyToken, deleteRoom);

//Verificação de Id e Senha para entrar em uma sala
router.post("/join/:id", verifyToken, joinRoom);

router.post("/:id/start-combat", verifyToken, startCombat);

module.exports = router;
