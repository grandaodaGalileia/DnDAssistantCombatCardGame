export default function CharacterCard({ character, onSelect, onDelete }) {
  return (
    <div className="character-card">
      {character.imageUrl ? (
        <img
          src={`http://localhost:5000${character.imageUrl}`}
          alt={character.name}
        />
      ) : (
        <div
          style={{
            height: "150px",
            background: "#333",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            borderRadius: "8px",
          }}
        >
          Sem imagem
        </div>
      )}
      <h3>{character.name}</h3>
      <p>Nível {character.level}</p>
      <button onClick={() => onSelect(character)}>Consultar Ficha</button>
      <button onClick={() => onDelete(character.id)}>Excluir</button>
    </div>
  );
}
