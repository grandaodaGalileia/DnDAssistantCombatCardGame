import { useState } from "react";
import { register } from "../services/authService";

export default function RegisterForm({ onRegister }) {
  const [username, setUsername] = useState(""); // NOVO
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await register(email, password, username);
      const token = await userCredential.user.getIdToken();
      onRegister(token);
    } catch (err) {
      alert("Erro ao registrar.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Nome de usuário"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
        required
      />
      <button type="submit">Registrar</button>
    </form>
  );
}
