import { useState, useEffect } from "react";
import "../styles/PlayerMonsterCombatLayout.css";

export default function PlayerMonsterCombatLayout({ monsters,
  onTargetSelected,
  currentTurnCharacterId,
  characterId }) {
  const [selectedMonsterId, setSelectedMonsterId] = useState(null); // o que está expandido agora
  const [selectedSide, setSelectedSide] = useState(null);
  const [glowMonsterId, setGlowMonsterId] = useState(null); // o que permanece com glow

  const handleMonsterClick = (monsterId, side) => {
  if (currentTurnCharacterId !== characterId) {
    const warnDiv = document.createElement("div");
    warnDiv.className = "not-your-turn-message";
    warnDiv.innerText = "⏳ Aguarde sua vez!";
    document.body.appendChild(warnDiv);
    setTimeout(() => warnDiv.remove(), 2000);
    return;
  }

  const monster = monsters.find(m => m.id === monsterId);
  setSelectedMonsterId(monsterId);
  setSelectedSide(side);
  if (onTargetSelected) {
    onTargetSelected(monster);
  }

  setTimeout(() => {
    setSelectedMonsterId(null);
    setGlowMonsterId(monsterId);
  }, 3000);
};


  const handleClickOutside = (e) => {
    if (e.target.classList.contains("mmonster-combat-layout")) {
      setSelectedMonsterId(null);
      setSelectedSide(null);
      setGlowMonsterId(null);
    }
  };

  const renderCard = (monster, isExpanded = false, isGlowing = false) => (
    <div
      className={`mmonster-wrapper ${isExpanded ? "expanded" : ""}`}
      key={monster.id}
    >
      <div
        className={`mmonster-card ${isExpanded ? "expanded" : ""} ${isGlowing ? "glow" : ""}`}
      >
        <h3>{monster.name}</h3>
        <img
          src={
            monster.imageUrl
              ? `http://localhost:5000${monster.imageUrl}`
              : "https://via.placeholder.com/100"
          }
          alt={monster.name}
        />
        <p>HP: {monster.hp ?? "?"}</p>
        <p>CA: {monster.ac ?? "?"}</p>
      </div>
    </div>
  );

  const leftMonsters = monsters.filter(
    (_, i) => i % 2 === 0 && monsters[i].id !== selectedMonsterId
  );
  const rightMonsters = monsters.filter(
    (_, i) => i % 2 !== 0 && monsters[i].id !== selectedMonsterId
  );

  const selectedMonster = monsters.find(m => m.id === selectedMonsterId);

  return (
    <div className="mmonster-combat-layout" onClick={handleClickOutside}>
      <div className="mmonster-side-column left-column">
        {leftMonsters.map(m => (
          <div key={m.id} onClick={() => handleMonsterClick(m.id, "left")}>
            {renderCard(m, false, glowMonsterId === m.id)}
          </div>
        ))}
      </div>

      {selectedMonster && (
        <div className="center-card-container">
          {renderCard(selectedMonster, true, true)}
        </div>
      )}

      <div className="mmonster-side-column right-column">
        {rightMonsters.map(m => (
          <div key={m.id} onClick={() => handleMonsterClick(m.id, "right")}>
            {renderCard(m, false, glowMonsterId === m.id)}
          </div>
        ))}
      </div>
    </div>
  );
}
