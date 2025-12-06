// components/MonsterCard.jsx
import "../styles/CombatMonsterCard.css";

export default function MonsterCard({ monster, isSelected, onClick }) {
  return (
    <div
      className={`monster-card ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      <img
        src={
          `http://localhost:5000${monster.imageUrl}` ||
          "https://via.placeholder.com/100"
        }
        alt={monster.name}
      />
      <h3>{monster.name}</h3>
      <p>HP: {monster.hp}</p>
      <p>CA: {monster.ac}</p>
    </div>
  );
}
