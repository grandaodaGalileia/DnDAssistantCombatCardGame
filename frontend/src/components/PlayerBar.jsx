import { useState } from "react";
import PlayerCombatCards from "./PlayerCombatCards";
import "../styles/PlayerBar.css";

export default function PlayerBar({ character }) {
  const [activeTab, setActiveTab] = useState("spells");

  if (!character) return null;

  return (
    <div className="player-bar-wrapper">
      <div className="player-bar">
        {/* Imagem e info */}
        <div className="character-info">
          <div className="character-name">{character.name}</div>
          <div className="character-class">{character.classType}</div>
          <div className="character-image-wrapper">
            <img
              className="character-image"
              src={`http://localhost:5000${character.imageUrl}` || "https://via.placeholder.com/100"}
              draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({ img: `http://localhost:5000${character.imageUrl}`, name: character.name, id: character.id })
                      );
                    }}
              alt={character.name}
            />
          </div>
          <div className="character-stats">
            <div>HP: {character.hp}</div>
            <div>CA: {character.ca}</div>
          </div>
        </div>

        {/* Cards + Botões */}
        <div className="player-cards-section">
          <div className="cards-tab-buttons">
            <button
              className={activeTab === "spells" ? "active" : ""}
              onClick={() => setActiveTab("spells")}
            >
              Magias
            </button>
            <button
              className={activeTab === "weapons" ? "active" : ""}
              onClick={() => setActiveTab("weapons")}
            >
              Armas
            </button>
          </div>
          <PlayerCombatCards character={character} section={activeTab} />
        </div>
      </div>
    </div>
  );
}
