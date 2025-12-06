import { useEffect, useState } from "react";

export default function CombatMaster({ room }) {
  const { monsters, selectedCharacters } = room;

  return (
    <div>
      <h2>Combate - Visão do Mestre</h2>
      <h3>Monstros</h3>
      {monsters?.map((monster) => (
        <div key={monster.id}>
          <h4>{monster.name}</h4>
          <p>HP: {monster.hitPoints}</p>
          <p>CA: {monster.armorClass}</p>
        </div>
      ))}

      <h3>Personagens Jogadores</h3>
      {selectedCharacters?.map((char) => (
        <div key={char.characterId}>
          <p>ID: {char.characterId}</p>
          <p>HP: {char.hitPoints}</p>
        </div>
      ))}
    </div>
  );
}
