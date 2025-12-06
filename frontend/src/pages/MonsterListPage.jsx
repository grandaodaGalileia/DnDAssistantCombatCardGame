import { useState, useEffect } from "react";
import { fetchMonsters, deleteMonster } from "../services/apiService";
import MonsterCard from "../components/MonsterCard";
import MonsterSheet from "../components/MonsterSheet";
import "../styles/MonsterListPage.css"; // NOVO NOME
import { useNavigate } from "react-router-dom";

export default function MonsterListPage({ token }) {
  const [monsters, setMonsters] = useState([]);
  const [selectedMonster, setSelectedMonster] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMonsters() {
      try {
        const data = await fetchMonsters(token);
        setMonsters(data);
      } catch (error) {
        console.error(error);
      }
    }
    loadMonsters();
  }, [token]);

  const handleSelect = (monster) => {
    setSelectedMonster(monster);
  };
  const handleDelete = async (id) => {
    try {
      await deleteMonster(token, id);
      setMonsters((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      alert("Erro ao excluir o monstro");
    }
  };
  return (
    <div className="monster-page">
      <div className="monster-page-content">
        <h2 className="monster-title">Monstros Criados</h2>
        <div className="monster-list">
          {monsters.length === 0 && <p>Nenhum monstro criado</p>}
          {monsters.map((monster) => (
            <MonsterCard
              key={monster.id}
              monster={monster}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          ))}
        </div>
        <button
          className="create-button"
          onClick={() => navigate("/create-monster")}
        >
          Criar novo Monstro
        </button>
        {selectedMonster && <MonsterSheet monster={selectedMonster} />}
      </div>
    </div>
  );
}
