import { useEffect, useState } from "react";
import "../styles/CharacterListPage.css";
import {
  fetchCharacters,
  deleteCharacter,
  getCharacterById,
} from "../services/apiService";
import CharacterList from "../components/CharacterList";
import CharacterSheet from "../components/CharacterSheet";
import { useNavigate } from "react-router-dom";

export default function CharacterListPage({ token }) {
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const data = await fetchCharacters(token);
      setCharacters(data);
    };
    load();
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await deleteCharacter(token, id);
      setCharacters((prev) => prev.filter((char) => char.id !== id));
      if (selectedCharacter?.id === id) setSelectedCharacter(null);
    } catch (error) {
      console.error("Erro ao excluir personagem:", error);
    }
  };

  const handleSelect = async (char) => {
    try {
      const detailed = await getCharacterById(token, char.id);
      setSelectedCharacter(detailed);
    } catch (error) {
      console.error("Erro ao buscar personagem completo:", error);
    }
  };

  return (
    <div className="character-page">
      <div className="character-page-content">
        <h2 className="character-title">Seus Personagens</h2>

        <div className="character-list">
          <CharacterList
            characters={characters}
            onSelect={handleSelect}
            onDelete={handleDelete}
          />
        </div>

        <button
          className="create-button"
          onClick={() => navigate("/create-character")}
        >
          Criar Personagem
        </button>

        {selectedCharacter && (
          <div className="character-sheet">
            <CharacterSheet character={selectedCharacter} />
          </div>
        )}
      </div>
    </div>
  );
}
