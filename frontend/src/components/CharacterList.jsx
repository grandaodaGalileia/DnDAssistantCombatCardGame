import CharacterCard from "./CharacterCard";

export default function CharacterList({ characters, onSelect, onDelete }) {
  if (characters.length === 0) {
    return <p>Nenhum personagem criado</p>;
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {characters.map((char) => (
        <CharacterCard key={char.id} character={char} onSelect={onSelect} onDelete={onDelete} />
      ))}
    </div>
  );
}
