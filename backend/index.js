const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { db, auth } = require("./firebase/firebase-config");

const authRoutes = require("./routes/auth");
const characterRoutes = require("./routes/characters");
const monstersRoutes = require("./routes/monsters");
const roomRoutes = require("./routes/rooms");
const turnTrackers = {};

const { init } = require("./socket"); // ✅ Importa o init do socket.js

const app = express();

// Middlewares básicos
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/characters", characterRoutes);
app.use("/api/monsters", monstersRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/uploads", express.static("uploads"));

// ✅ Servidor HTTP + Socket.io
const server = http.createServer(app);

// ✅ Inicializa o Socket.io
const io = init(server);

// Eventos de conexão do Socket.io
const roomPlayers = {};
const initiativeTrackers = {};
io.on("connection", (socket) => {
  console.log("Cliente conectado:", socket.id);

  socket.on("join_room", async ({ roomId, playerName, characterId, token }) => {
    console.log(
      `[socket.io] join_room recebido: roomId=${roomId}, playerName=${playerName}, characterId=${characterId}, token=${token}
    `
    );
    try {
      const decoded = await auth.verifyIdToken(token);
      const userId = decoded.uid;

      const roomDoc = await db.collection("rooms").doc(roomId).get();
      if (!roomDoc.exists) {
        socket.emit("error_message", "Sala não encontrada.");
        return;
      }
      const roomData = roomDoc.data();
      const isMaster = roomData.masterId === userId;

      const role = isMaster ? "master" : "player";

      if (
        role === "master" &&
        roomPlayers[roomId]?.some((p) => p.role === "master")
      ) {
        socket.emit("error_message", "Já existe um Mestre nesta sala!");
        return;
      }

      // Carrega dados do personagem (opcional!)
      let characterData;

      if (characterId) {
        const characterDoc = await db
          .collection("characters")
          .doc(characterId)
          .get();
        if (!characterDoc.exists) {
          socket.emit("error_message", "Personagem não encontrado.");
          return;
        }
        characterData = characterDoc.data();
      }

      socket.join(roomId);
      console.log(
        `[Socket] ${socket.id} entrou na sala ${roomId} como ${role}
      `
      );
      if (!roomPlayers[roomId]) roomPlayers[roomId] = [];
      roomPlayers[roomId].push({
        id: socket.id,
        userId,
        name: playerName || (isMaster ? "Mestre" : "Jogador Anônimo"),
        role,
        character: characterData
          ? {
            ...characterData,
            id: characterId,
          }
          : null,
        characterFullData: characterData || null,
      });

      io.to(roomId).emit(
        "players_update",
        roomPlayers[roomId].map((player) =>
          player.userId === userId
            ? { ...player, character: player.characterFullData }
            : {
              ...player,
              character: {
                id: player.character?.id,
                name: player.character?.name,
                hitPoints: player.character?.hitPoints,
                photo: player.character?.photo,
              },
            }
        )
      );
    } catch (error) {
      console.error(error);
      socket.emit("error_message", "Erro de autenticação ou entrada na sala.");
    }
  });

  socket.on("set_ready", ({ roomId, ready }) => {
    if (!roomPlayers[roomId]) return;

    const player = roomPlayers[roomId]?.find((p) => p.id === socket.id);
    if (player && player.role !== "master") {
      player.ready = ready;

      // Notifica todos
      io.to(roomId).emit("players_update", roomPlayers[roomId]);
    }
  });

  socket.on("start_combat", async ({ roomId }) => {
    console.log("[startCombat] Emitindo para:", roomId);

    try {
      const roomRef = db.collection("rooms").doc(roomId);
      const roomDoc = await roomRef.get();
      if (!roomDoc.exists) {
        socket.emit("error_message", "Sala não encontrada.");
        return;
      }

      const roomData = roomDoc.data();
      const alivePlayers = roomData.selectedCharacters?.filter((c) => c.hitPoints > 0) || [];
      const totalExpected = alivePlayers.length + (roomData.monsters?.length || 0);

      // ⚠️ Só inicializa se ainda não existe
      if (!initiativeTrackers[roomId]) {
        initiativeTrackers[roomId] = {
          rolls: [],
          totalExpected,
        };
        console.log(`[startCombat] Tracker inicializado para sala ${roomId} com ${totalExpected} esperados.`);
      } else {
        console.log(`[startCombat] Tracker JÁ EXISTE para sala ${roomId}. Nenhuma reinicialização.`);
      }

      io.to(roomId).emit("combat_started");
    } catch (err) {
      console.error("[startCombat] Erro:", err);
      socket.emit("error_message", "Erro ao iniciar combate.");
    }
  });

  socket.on("combat_initiated", ({ roomId }) => {
    console.log(`🧠 Combate realmente iniciado na sala ${roomId}`);
    io.to(roomId).emit("combat_initiated");
  });

  socket.on("initiative_roll", async ({ roomId, id, name, type, roll }) => {
    try {
      if (!initiativeTrackers[roomId]) return;

      const tracker = initiativeTrackers[roomId];

      const alreadyRolled = tracker.rolls.find((r) => r.id === id);
      if (alreadyRolled) return;

      let finalInitiative = roll;
      let modifier = 0;
      let characterData = null;
      let monster = null;
      let photo = null;

      if (type === "player") {
        const characterDoc = await db.collection("characters").doc(id).get();
        if (characterDoc.exists) {
          characterData = characterDoc.data();
          const dex = Number(characterData.attributes?.dexterity);
          modifier = Number.isFinite(dex) ? Math.floor((dex - 10) / 2) : 0;
          finalInitiative += modifier;
          photo = characterData.imageUrl;
        }
      } else if (type === "monster") {
        const roomDoc = await db.collection("rooms").doc(roomId).get();
        const roomData = roomDoc.data();
        monster = roomData.monsters?.find((m) => m.id === id);
        if (monster) {
          const dex = monster.attributes?.dexterity || 10;
          modifier = Math.floor((dex - 10) / 2);
          finalInitiative += modifier;
          photo = monster.imageUrl;
        }
      }


      if (type === "player" && characterData?.imageUrl) {
        photo = characterData.imageUrl;
      } else if (type === "monster" && monster?.imageUrl) {
        photo = monster.imageUrl;
      }

      tracker.rolls.push({
        id,
        name,
        type,
        initiative: finalInitiative,
        imageUrl: photo,
      });

      if (tracker.rolls.length === tracker.totalExpected) {
        const sorted = [...tracker.rolls].sort((a, b) => b.initiative - a.initiative);

        turnTrackers[roomId] = {
          currentTurn: 1,
          currentIndex: 0,
          initiativeOrder: sorted,
        };

        io.to(roomId).emit("initiative_order", sorted);

        const current = sorted[0];
        io.to(roomId).emit("your_turn", {
          currentCharacterId: current.id,
          currentTurn: 1,
          currentName: current.name,
        });

        // BLOCO PARA MONSTROS
        if (current.type === "monster") {
          const roomDoc = await db.collection("rooms").doc(roomId).get();
          const roomData = roomDoc.data();

          const monster = roomData.monsters?.find((m) => m.id === current.id);
          if (monster) {
            console.log(`[auto] Emitindo monstro_da_vez: ${monster.name}`);
            io.to(roomId).emit("monstro_da_vez", { monster });
          }
        }
      }
    } catch (err) {
      console.error(`[initiative_roll] Erro na sala ${roomId}:`, err);
    }
  });

  socket.on("end_turn", async ({ roomId }) => {
    const tracker = turnTrackers[roomId];
    if (!tracker) return;

    tracker.currentIndex += 1;

    // Se chegou ao fim, volta pro começo e avança turno
    if (tracker.currentIndex >= tracker.initiativeOrder.length) {
      tracker.currentIndex = 0;
      tracker.currentTurn += 1;

      io.to(roomId).emit("turn_info", {
        message: `🔁 Turno ${tracker.currentTurn}`,
      });
    }

    const current = tracker.initiativeOrder[tracker.currentIndex];

    // Notifica a vez do próximo personagem
    io.to(roomId).emit("your_turn", {
      currentCharacterId: current.id,
      currentTurn: tracker.currentTurn,
      currentName: current.name,
    });

    // Se for monstro, emite automaticamente o monstro_da_vez
    if (current.type === "monster") {
      const roomDoc = await db.collection("rooms").doc(roomId).get();
      const roomData = roomDoc.data();

      const monster = roomData.monsters?.find((m) => m.id === current.id);
      if (monster) {
        console.log(`[auto] Emitindo monstro_da_vez: ${monster.name}`);
        io.to(roomId).emit("monstro_da_vez", { monster });
      }
    }
  });

  // Mestre seleciona o monstro da vez
  socket.on("monstro_da_vez", ({ roomId, monster }) => {
    console.log(`[socket.io] monstro_da_vez para sala ${roomId}: ${monster.name}`);
    io.to(roomId).emit("monstro_da_vez", { monster });
  });

  // Mestre seleciona o alvo (jogador)
  socket.on("alvo_selecionado", ({ roomId, player }) => {
    console.log(`[socket.io] alvo_selecionado para sala ${roomId}: ${player.name}`);
    io.to(roomId).emit("alvo_selecionado", { player });
  });

  // Mestre seleciona o ataque
  socket.on("ataque_selecionado", ({ roomId, attack }) => {
    console.log(`[socket.io] ataque_selecionado para sala ${roomId}: ${attack.name}`);
    io.to(roomId).emit("ataque_selecionado", { attack });
  });

  // Player seleciona a magia
  socket.on("magia_selecionada", ({ roomId, spell }) => {
    console.log(`[socket.io] magia_selecionada para sala ${roomId}: ${spell.name}`);
    io.to(roomId).emit("magia_selecionada", { spell });
  });

  socket.on("dice_roll_result", ({ roomId, ...rollData }) => {
    console.log("[🔁 SERVER EMIT] Reenviando dice_roll_result para sala:", roomId, rollData);
    io.to(roomId).emit("dice_roll_result", rollData);
  });

  socket.on("grid_update", ({ roomId, gridData }) => {
    if (Array.isArray(gridData)) {
      io.to(roomId).emit("grid_update", { gridData });
    } else {
      console.warn(`[grid_update] Dados inválidos recebidos para sala ${roomId}:`, gridData);
    }
  });

  socket.on("leave_room", ({ roomId }) => {
    roomPlayers[roomId] = roomPlayers[roomId]?.filter(
      (player) => player.id !== socket.id
    );
    io.to(roomId).emit("players_update", roomPlayers[roomId]);
    socket.leave(roomId);
  });

  socket.on("disconnect", () => {
    for (const roomId in roomPlayers) {
      roomPlayers[roomId] = roomPlayers[roomId]?.filter(
        (player) => player.id !== socket.id
      );
      io.to(roomId).emit("players_update", roomPlayers[roomId]);
    }
    console.log(`❌ Cliente ${socket.id} desconectado`);
  });
});

// ✅ Porta definida pela .env ou padrão 5000
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
