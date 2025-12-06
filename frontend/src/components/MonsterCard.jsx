import "../styles/MonsterCard.css";

export default function MonsterCard({ monster, onSelect, onDelete }) {
  return (
    <div className="monster-card">
      {monster.imageUrl ? (
        <img
          src={`http://localhost:5000${monster.imageUrl}`}
          alt={monster.name}
        />
      ) : (
        <div className="no-image">Sem imagem</div>
      )}
      <h3>{monster.name}</h3>
      <p>Nível Desafio: {monster.challenge}</p>
      <div className="monster-card-buttons">
        <button onClick={() => onSelect(monster)}>Consultar Ficha</button>
        <button onClick={() => onDelete(monster.id)}>Excluir</button>
      </div>
    </div>
  );
}
