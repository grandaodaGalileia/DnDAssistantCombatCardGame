import { useState } from "react";
import "../styles/MasterPlayerCombatLayout.css";

export default function MasterPlayerCombatLayout({ players, isMasterTurn, onPlayerSelected }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);
  const [selectedSide, setSelectedSide] = useState(null); // 'left' ou 'right'
  const [glowPlayerId, setGlowPlayerId] = useState(null);

  const handleCardClick = (characterId, side, isMasterTurn) => {
    if (!isMasterTurn) {
      const warnDiv = document.createElement("div");
      warnDiv.className = "not-your-turn-message";
      warnDiv.innerText = "⏳ Aguarde sua vez!";
      document.body.appendChild(warnDiv);
      setTimeout(() => warnDiv.remove(), 2000);
      return;
    }

    const player = players.find((p) => p.characterId === characterId);

    setSelectedPlayerId(characterId);
    setSelectedSide(side);
    if (onPlayerSelected) {
      onPlayerSelected(player);
    }

    setTimeout(() => {
      setSelectedPlayerId(null);
      setGlowPlayerId(characterId); // mantém o glow depois da expansão
    }, 3000);
  };

  const handleClickOutside = (e) => {
    if (e.target.classList.contains("combat-layout")) {
      setSelectedPlayerId(null);
      setSelectedSide(null);
    }
  };

  const renderCard = (player, isExpanded = false, isGlowing = false) => {
    const character = player.character || {};

    return (
      <div
        className={`player-wrapper ${isExpanded ? "expanded" : ""}`}
        key={player.characterId}
      >
        <div className={`player-name ${isExpanded ? "expanded" : ""}`}>
          {player.name || "Jogador"}
        </div>
        <div className={`player-card ${isExpanded ? "expanded" : ""} ${isGlowing ? "glow" : ""}`}>
          <h3>{character.name || "Sem Nome"}</h3>
          <img
            src={
              character.imageUrl
                ? `http://localhost:5000${character.imageUrl}`
                : "https://via.placeholder.com/100"
            }
            alt={character.name || "Sem Nome"}
          />
          <p>HP: {character.hp ?? "?"}</p>
          <p>CA: {character.ca ?? "?"}</p>
        </div>
      </div>
    );
  };


  const leftPlayers = players.filter(
    (_, i) => i % 2 === 0 && players[i].characterId !== selectedPlayerId
  );
  const rightPlayers = players.filter(
    (_, i) => i % 2 !== 0 && players[i].characterId !== selectedPlayerId
  );

  const selectedPlayer = players.find((p) => p.characterId === selectedPlayerId);

  return (
    <div className="combat-layout" onClick={handleClickOutside}>
      <div className="side-column left-column">
        {leftPlayers.map((p) => (
          <div key={p.characterId} onClick={() => handleCardClick(p.characterId, "left", isMasterTurn)}>
            {renderCard(p, false, glowPlayerId === p.characterId)}
          </div>
        ))}
      </div>

      {selectedPlayer && (
        <div className="center-card-container">
          {renderCard(selectedPlayer, true, true)}
        </div>
      )}

      <div className="side-column right-column">
        {rightPlayers.map((p) => (
          <div key={p.characterId} onClick={() => handleCardClick(p.characterId, "right", isMasterTurn)}>
            {renderCard(p, false, glowPlayerId === p.characterId)}
          </div>
        ))}
      </div>
    </div>
  );
}
