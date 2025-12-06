export default function CombatPlayer({ room, userId }) {
  const { selectedCharacters, monsters } = room;

  return (
    <div>
      <h2>Combate - Visão do Jogador</h2>

      <h3>Monstros</h3>
      {monsters?.map((monster) => (
        <div key={monster.id}>
          <h4>{monster.name}</h4>
          <p>HP: {monster.hitPoints}</p>
        </div>
      ))}

      <h3>Aliados</h3>
      {selectedCharacters?.map((char) => (
        <div key={char.characterId}>
          <p>Personagem: {char.characterId}</p>
          <p>HP: {char.hitPoints}</p>
        </div>
      ))}
    </div>
  );
}
