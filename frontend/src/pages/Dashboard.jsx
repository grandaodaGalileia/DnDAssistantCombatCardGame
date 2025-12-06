import { useEffect, useState } from "react";
import {
  fetchCharacters,
  createCharacter,
  deleteCharacter,
} from "../services/apiService";
import CharacterList from "../components/CharacterList";
import CreateCharacterForm from "../components/CreateCharacterForm";

export default function Dashboard({ token }) {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchCharacters(token);
      setCharacters(data);
    };
    load();
  }, [token]);

  const handleCreate = async (formData) => {
    try {
      const newCharacter = await createCharacter(token, formData);
      console.log("Personagem criado:", newCharacter); // 👈 veja se vem com `id`
      setCharacters((prev) => [...prev, newCharacter]);
    } catch (error) {
      console.error("Erro ao criar personagem:", error);
    }
  };

  const handleDelete = async (id) => {
    console.log("Tentando deletar personagem com ID:", id);
    try {
      await deleteCharacter(token, id);
      setCharacters((prev) => prev.filter((char) => char.id !== id));
    } catch (error) {
      console.error("Erro ao excluir personagem:", error);
    }
  };

  const handleSelect = (char) => {
    console.log("Selecionado:", char);
    // futuramente: setar no contexto ou redirecionar para tela de ficha
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <CharacterList
        characters={characters}
        onSelect={handleSelect}
        onDelete={handleDelete}
      />
      <h3>Criar Novo Personagem</h3>
      <CreateCharacterForm onCreate={handleCreate} />
    </div>
  );
}
