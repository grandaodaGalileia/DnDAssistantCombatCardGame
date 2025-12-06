// characterController.js
const { db } = require("../firebase/firebase-config");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// pasta onde as imagens serão salvas
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

// Função para calcular o modificador de atributos
const calculateModifiers = (attributes) => {
  const mods = {};
  for (const [key, value] of Object.entries(attributes)) {
    mods[key] = Math.floor((value - 10) / 2);
  }
  return mods;
};

exports.uploadMiddleware = upload.single("image");

exports.characterController = {
  getAll: async (req, res) => {
    try {
      const charactersRef = db.collection("characters");
      const snapshot = await charactersRef
        .where("ownerId", "==", req.user.uid)
        .get();

      const characters = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      res.json(characters);
    } catch (err) {
      res.status(500).json({ error: "Erro ao buscar personagens" });
    }
  },

  create: async (req, res) => {
    try {
      if (!req.body.data) {
        return res
          .status(400)
          .json({ error: "Dados do personagem não enviados" });
      }

      const data = JSON.parse(req.body.data);
      const {
        name,
        race,
        classType,
        level,
        alignment,
        armorClass,
        hitPoints,
        speed,
        attributes,
        weapons,
        subclass,
        spells,
      } = data;

      const mods = calculateModifiers(attributes);

      const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

      const newChar = {
        name,
        race,
        classType,
        level,
        alignment,
        armorClass,
        hitPoints,
        speed,
        attributes,
        weapons: weapons || [],
        subclass,
        spells,
        ownerId: req.user.uid,
        imageUrl,
        modifiers: mods,
      };

      const docRef = await db.collection("characters").add(newChar);
      res.status(201).json({ id: docRef.id, ...newChar });
    } catch (err) {
      console.error("Erro ao criar personagem:", err);
      res.status(500).json({ error: "Erro ao criar personagem" });
    }
  },
  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const docRef = db.collection("characters").doc(id);
      const doc = await docRef.get();
      if (!doc.exists) {
        return res.status(404).json({ error: "Personagem não encontrado" });
      }
      await docRef.delete();
    } catch (err) {
      console.error("Erro ao excluir personagem:", err);
      res.status(500).json({ error: "Erro ao excluir personagem" });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    try {
      const docRef = db.collection("characters").doc(id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: "Personagem não encontrado" });
      }

      const data = req.body;

      if (data.attributes) {
        data.modifiers = calculateModifiers(data.attributes);
      }

      await docRef.update(data);
      res.json({ id, ...data });
    } catch (error) {
      console.error("Erro ao atualizar personagem:", error);
      res.status(500).json({ error: "Erro ao atualizar personagem" });
    }
  },
};
