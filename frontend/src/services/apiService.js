import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { getUserIdFromToken } from "./authService";

const API_URL = "http://localhost:5000/api";
export const verifyToken = async (token) => {
  const res = await fetch(`${API_URL}/auth/verify-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};
export const fetchCharacters = async (token) => {
  const res = await fetch(`${API_URL}/characters`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};
export const createCharacter = async (token, formData) => {
  const res = await fetch(`${API_URL}/characters`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData, // sem Content-Type aqui
  });
  return res.json();
};
export async function deleteCharacter(token, id) {
  console.log("Token: ", token);
  const res = await fetch(`http://localhost:5000/api/characters/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Erro ao deletar personagem");
  }
  return true;
}

export async function getCharacterById(token, id) {
  const userId = await getUserIdFromToken(token);
  const docRef = doc(db, "characters", id);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    throw new Error("Personagem não encontrado");
  }

  return { id: snap.id, ...snap.data() };
}

//Monstros

export const fetchMonsters = async (token) => {
  const res = await fetch(`${API_URL}/monsters`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
};

export async function createMonster(token, formData) {
  const res = await fetch(`${API_URL}/monsters`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error(errorData);
    throw new Error(errorData.error || "Erro ao criar monstro");
  }

  return await res.json();
}

export const deleteMonster = async (token, id) => {
  const res = await fetch(`${API_URL}/monsters/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error("Erro ao excluir o monstro");
  }
};

//Salas

export const fetchRooms = async (token) => {
  const res = await fetch(`${API_URL}/rooms`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Erro ao carregar salas");
  }
  return await res.json();
};

export const deleteRoom = async (token, roomId) => {
  const res = await fetch(`${API_URL}/rooms/${roomId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Erro ao excluir sala");
  }
};
