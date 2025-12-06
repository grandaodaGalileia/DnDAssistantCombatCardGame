const { db } = require("../firebase/firebase-config");

// Cálculo de modificadores (igual ao characterController)
const calculateModifiers = (attributes) => {
  const mods = {};
  for (const [key, value] of Object.entries(attributes)) {
    mods[key] = Math.floor((value - 10) / 2);
  }
  return mods;
};

exports.getAllMonsters = async (req, res) => {
  try {
    const monstersRef = db.collection("monsters");
    const snapshot = await monstersRef
      .where("ownerId", "==", req.user.uid)
      .get();

    const monsters = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(monsters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar monstros" });
  }
};

exports.createMonster = async (req, res) => {
  try {
    if (!req.body.data) {
      return res
        .status(400)
        .json({ error: "Campo 'data' não encontrado no formulário" });
    }

    const data = JSON.parse(req.body.data);
    const {
      name,
      armorClass,
      hitPoints,
      speed,
      attributes,
      challenge,
      abilities,
      attacks,
      savingThrows,
      damageResistances,
      damageImmunities,
      conditionImmunities,
      senses,
      size,
    } = data;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const modifiers = calculateModifiers(attributes ?? {});

    const newMonster = {
      name,
      size: size ?? "Medium",
      armorClass: armorClass ?? null,
      hitPoints: hitPoints ?? null,
      speed: speed ?? "Desconhecida",
      attributes: attributes ?? {},
      modifiers,
      challenge: challenge ?? "0",
      abilities: abilities ?? [],
      attacks: attacks ?? [],
      savingThrows: savingThrows ?? [],
      damageResistances: damageResistances ?? [],
      damageImmunities: damageImmunities ?? [],
      conditionImmunities: conditionImmunities ?? [],
      senses: senses ?? {},
      ownerId: req.user.uid,
      imageUrl,
    };

    const docRef = await db.collection("monsters").add(newMonster);
    res.status(201).json({ id: docRef.id, ...newMonster });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar monstro" });
  }
};

exports.deleteMonster = async (req, res) => {
  try {
    const { id } = req.params;

    const docRef = db.collection("monsters").doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Monstro não encontrado" });
    }

    await docRef.delete();
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao excluir monstro" });
  }
};
