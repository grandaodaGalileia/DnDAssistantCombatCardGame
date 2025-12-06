// src/pages/CreateCharacterPage.jsx
import CreateCharacterForm from "../components/CreateCharacterForm";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { createCharacter } from "../services/apiService";
import "../styles/CreateCharacterPage.css";

export default function CreateCharacterPage({ token }) {
  console.log("Token: ", token);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreate = async (formData) => {
    console.log("Token dentro de handleCreate:", token);
    setLoading(true);
    try {
      const newCharacter = await createCharacter(token, formData);
      console.log("Personagem criado:", newCharacter);
      // Após criar, volta para a lista de personagens (dashboard)
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao criar personagem:", error);
      alert("Erro ao criar personagem. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-character-page">
      <div className="create-character-content">
        <h2>Criar Novo Personagem</h2>
        <CreateCharacterForm onCreate={handleCreate} />
        {loading && <p>Criando personagem...</p>}
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          ← Voltar para a Lista
        </button>
      </div>
    </div>
  );
}
