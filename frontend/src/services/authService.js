import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../firebase";

const API_URL = "http://localhost:5000/api";

export const login = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const register = async (email, password, username) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const token = await userCredential.user.getIdToken();

  // Salva o nome de usuário no backend
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`, // passa o token
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uid: userCredential.user.uid, email, username }),
  });
  if (!res.ok) {
    throw new Error("Erro ao salvar nome de usuário");
  }

  return userCredential;
};

export const getUserIdFromToken = async (token) => {
  const response = await fetch(`${API_URL}/auth/verify-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Token inválido");
  }

  const data = await response.json();
  return data.uid; // <- aqui retornamos apenas o UID
};
