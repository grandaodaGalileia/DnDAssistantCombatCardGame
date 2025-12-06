// controllers/roomController.js
const { db } = require("../firebase/firebase-config");
const { getIO } = require("../socket");

exports.createRoom = async (req, res) => {
  const { name, password, monsters } = req.body;

  if (!name || !monsters?.length) {
    return res
      .status(400)
      .json({ error: "É necessário informar nome e ao menos 1 monstro." });
  }

  try {
    const monstersData = [];
    for (const monsterId of monsters) {
      const monsterDoc = await db.collection("monsters").doc(monsterId).get();
      if (!monsterDoc.exists) {
        return res
          .status(404)
          .json({ error: `Monstro ${monsterId} não encontrado.` });
      }
      monstersData.push({ id: monsterDoc.id, ...monsterDoc.data() });
    }

    const roomData = {
      name,
      password: password || null,
      masterId: req.user.uid,
      monsters: monstersData,
      status: "waiting",
      createdAt: new Date(),
      players: [],
      selectedCharacters: [],
    };

    const docRef = await db.collection("rooms").add(roomData);
    res.json({ id: docRef.id, ...roomData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar sala" });
  }
};

exports.getRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await db.collection("rooms").doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Sala não encontrada" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: "Erro ao obter sala" });
  }
};

exports.getMyRooms = async (req, res) => {
  try {
    const roomsRef = db.collection("rooms");
    const snapshot = await roomsRef.where("masterId", "==", req.user.uid).get();

    const rooms = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar salas" });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const roomRef = db.collection("rooms").doc(id);
    const doc = await roomRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Sala não encontrada" });
    }
    if (doc.data().masterId !== req.user.uid) {
      return res.status(403).json({ error: "Acesso não autorizado" });
    }

    await roomRef.delete();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir sala" });
  }
};

exports.joinRoom = async (req, res) => {
  const { id } = req.params;
  const { password, characterId } = req.body;

  if (!characterId) {
    return res
      .status(400)
      .json({ error: "É necessário informar o ID do personagem." });
  }

  try {
    const roomRef = db.collection("rooms").doc(id);
    const roomDoc = await roomRef.get();
    if (!roomDoc.exists) {
      return res.status(404).json({ error: "Sala não encontrada" });
    }

    const roomData = roomDoc.data();

    if (roomData.password && roomData.password !== password) {
      return res.status(403).json({ error: "Senha incorreta" });
    }

    const characterDoc = await db
      .collection("characters")
      .doc(characterId)
      .get();
    if (!characterDoc.exists) {
      return res.status(404).json({ error: "Personagem não encontrado" });
    }

    const characterData = characterDoc.data();
    console.log(">> Dados completos do personagem 1:", characterData);
    const characterOwnerId = characterData.ownerId;

    const userAlreadyJoined = (roomData.selectedCharacters || []).some(
      (c) => c.ownerId === characterOwnerId
    );

    if (userAlreadyJoined) {
      const alreadySelected = (roomData.selectedCharacters || []).find(
        (c) => c.characterId === characterId
      );

      if (alreadySelected) {
        // Permitir reconexão com personagem já na sala
        return res.json({
          success: true,
          roomData: { id, ...roomData },
          characterId,
          message: "Reconexão bem-sucedida com personagem já presente.",
        });
      } else {
        // Bloquear entrada com novo personagem (limite: 1 por jogador)
        return res
          .status(400)
          .json({ error: "Você já entrou na sala com um personagem." });
      }
    }

    const selectedCharacter = {
      characterId,
      ownerId: characterOwnerId,
      ...characterData,
    };

    console.log(">> Dados do personagem SELECIONADO:", selectedCharacter);
    const updatedCharacters = [
      ...(roomData.selectedCharacters || []),
      selectedCharacter,
    ];

    await roomRef.update({ selectedCharacters: updatedCharacters });
    res.json({
      success: true,
      roomData: { id, ...roomData, selectedCharacters: updatedCharacters },
      characterId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao verificar sala" });
  }
};

exports.startCombat = async (req, res) => {
  const { id } = req.params;

  try {
    const roomRef = db.collection("rooms").doc(id);
    const roomDoc = await roomRef.get();

    if (!roomDoc.exists) {
      console.error("[startCombat] Sala não encontrada:", id);
      return res.status(404).json({ error: "Sala não encontrada" });
    }

    const roomData = roomDoc.data();
    if (roomData.masterId !== req.user.uid) {
      console.error("[startCombat] Acesso não autorizado para:", req.user.uid);
      return res
        .status(403)
        .json({ error: "Somente o mestre pode iniciar o combate" });
    }

    await roomRef.update({ status: "in_combat" });
    const updatedRoom = (await roomRef.get()).data();

    const roomPlayers = [];

    for (const char of updatedRoom.selectedCharacters || []) {
      // Busca dados do usuário no Firestore
      let ownerName = "Jogador";

      try {
        const userDoc = await db.collection("users").doc(char.ownerId).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          ownerName = userData.username || "Jogador";
        }
      } catch (err) {
        console.error(
          `[startCombat] Erro ao buscar nome do usuário ${char.ownerId}:`,
          err
        );
      }

      const spellsData = Array.isArray(char.spells) ? char.spells : [];

      const weaponsData = Array.isArray(char.weapons) ? char.weapons : [];

      const {
        charisma,
        constitution,
        dexterity,
        intelligence,
        strength,
        wisdom,
        classType,
        race,
        speed,
        level,
      } = char;

      roomPlayers.push({
        characterId: char.characterId,
        ownerId: char.ownerId,
        name: ownerName,
        character: {
          name: char.name,
          hp: char.hitPoints,
          ca: char.armorClass,
          imageUrl: char.imageUrl,
          spells: spellsData,
          weapons: weaponsData,
          attributes: {
            charisma: char.attributes.charisma,
            constitution: char.attributes.constitution,
            dexterity: char.attributes.dexterity,
            intelligence: char.attributes.intelligence,
            strength: char.attributes.strength,
            wisdom: char.attributes.wisdom,
          },
          modifiers: {
            charisma: char.modifiers.charisma,
            constitution: char.modifiers.constitution,
            dexterity: char.modifiers.dexterity,
            intelligence: char.modifiers.intelligence,
            strength: char.modifiers.strength,
            wisdom: char.modifiers.wisdom,
          },
          classType,
          race,
          speed,
          level,
        },
      });
    }

    const roomMonsters =
  updatedRoom.monsters?.map((mon) => {
    return {
      id: mon.id,
      name: mon.name,
      hp: mon.hitPoints,
      ac: mon.armorClass,
      size: mon.size,
      attacks: mon.attacks,
      attributes: {
        charisma: mon.attributes.charisma,
        constitution: mon.attributes.constitution,
        dexterity: mon.attributes.dexterity,
        intelligence: mon.attributes.intelligence,
        strength: mon.attributes.strength,
        wisdom: mon.attributes.wisdom,
      },
      imageUrl: mon.imageUrl,
    };
  }) || [];

    console.log("[startCombat] Jogadores carregados:", roomPlayers);
    console.log("[startCombat] Monstros carregados:", roomMonsters);

    // ✅ 1º Retorna sucesso para o REST
    res.json({ success: true });

    //2º Emite dados via socket (com pequeno delay)
    setTimeout(() => {
      const io = getIO();
      console.log("[startCombat] Emitindo dados para a sala (com delay):", id);
      io.to(id).emit("combat_data", {
        players: roomPlayers,
        monsters: roomMonsters,
      });
    }, 3000); // atraso de 2000ms para garantir que o socket se junte
  } catch (error) {
    console.error("[startCombat] Erro:", error);
    return res.status(500).json({ error: "Erro ao iniciar o combate" });
  }
};
