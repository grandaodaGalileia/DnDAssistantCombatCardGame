// CombatMonsterArea.jsx
import { useState } from "react";
import CombatMonsterCard from "../components/CombatMonsterCard";
import CombatMonsterAttackCard from "./CombatMonsterAttackCard";
import "../styles/CombatMonsterArea.css";

export default function CombatMonsterArea({ monsters, onAttackSelected, currentTurnCharacterId, onInvalidAttempt }) {
  const [viewMode, setViewMode] = useState("basic"); // 'basic' ou 'attacks'
  const [selectedMonster, setSelectedMonster] = useState(null);

  const handleAttackClick = (monster, attack) => {
  // VERIFICAÇÃO AQUI
  if (monster.id !== currentTurnCharacterId) {
    if (onInvalidAttempt) onInvalidAttempt();
    return;
  }

  setSelectedMonster(monster);
  setViewMode("attacks");
  if (onAttackSelected) {
    onAttackSelected({ monster, attack });
  }
};

  const handleBackClick = () => {
    setSelectedMonster(null);
    setViewMode("basic");
  };

  return (
    <div className="monsters-area">
      {viewMode === "basic" && (
        <div className="monsters-row">
          {monsters.map((monster) => (
            <div className="monster-card-outer" key={monster.id}>
              <div className="monster-card-inner">
                <div className="monster-card-top">
                  <img
                    src={`http://localhost:5000${monster.imageUrl}` || "https://via.placeholder.com/100"}
                    alt={monster.name}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({ img: `http://localhost:5000${monster.imageUrl}`, name: monster.name, id: monster.id, size: monster.size
                        })
                      );
                    }}
                  />
                </div>

                <div className="monster-card-middle">
                  <h3>{monster.name}</h3>
                </div>

                <div className="monster-card-bottom">
                  <div className="monster-stats">
                    <p>HP: {monster.hp}</p>
                    <p>CA: {monster.ac}</p>
                  </div>
                  <div className="monster-buttons">
                    <button onClick={() => {
                      setSelectedMonster(monster);
                      setViewMode("attacks");
                    }}>
                      Atacar
                    </button>
                    <button disabled>Correr</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewMode === "attacks" && selectedMonster && (
        <div className="attacks-section">
          <div className="attacks-header">
            <h3>Ataques de {selectedMonster.name}</h3>
          </div>
          <div className="attacks-row">
            {selectedMonster.attacks?.length ? (
              selectedMonster.attacks.map((atk, i) => (
                <div key={i} onClick={() => handleAttackClick(selectedMonster, atk)}>
                  <CombatMonsterAttackCard attack={atk} 
                  selectedMonster={selectedMonster}
                  />
                </div>
              ))
            ) : (
              <p>Sem ataques disponíveis.</p>
            )}
          </div>
          <button className="back-button" onClick={handleBackClick}>
            Voltar
          </button>
        </div>
      )}
    </div>
  );
}
