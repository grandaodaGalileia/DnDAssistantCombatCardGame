import "../styles/PlayerPlayerCombatLayout.css";

export default function PlayerPlayerCombatLayout({ players, currentId }) {
  const leftPlayers = players.filter(
  (player, i) => i % 2 === 0 && String(player.characterId) !== String(currentId)
);
const rightPlayers = players.filter(
  (player, i) => i % 2 !== 0 && String(player.characterId) !== String(currentId)
);

  const renderCard = (player) => {
    const character = player.character || {};
    return (
      <div className="pplayer-wrapper" key={player.id}>
        <div className="pplayer-name">{player.name || "Jogador"}</div>
        <div className="pplayer-card">
          <h3>{character.name}</h3>
          <img
            src={
              character.imageUrl
                ? `http://localhost:5000${character.imageUrl}`
                : "https://via.placeholder.com/100"
            }
            alt={character.name}
          />
          <p>HP: {character.hp ?? "?"}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="pplayer-combat-layout">
      <div className="pplayer-side-column left-column">
        {leftPlayers.map(renderCard)}
      </div>
      <div className="pplayer-side-column right-column">
        {rightPlayers.map(renderCard)}
      </div>
    </div>
  );
}
