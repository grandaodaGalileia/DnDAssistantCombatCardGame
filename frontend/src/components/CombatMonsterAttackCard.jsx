import { useState } from "react";
import "../styles/CombatMonsterAttackCard.css";

export default function AttackCard({ attack, selectedMonster }) {
  const [expanded, setExpanded] = useState(false);

  const getDamageText = () => {
    if (!attack.damage?.length) return "Sem dano";
    return attack.damage
      .map((dmg) => `${dmg.damage_dice || "?"} ${dmg.damage_type?.name || ""}`)
      .join(" / ");
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData("application/json", JSON.stringify({attack, selectedMonsterId: selectedMonster.id}));
  };

  const toggleExpanded = () => setExpanded((prev) => !prev);

  return (
    <div className="attack-card" draggable onDragStart={handleDragStart}>
      <h4>{attack.name}</h4>
      <p><strong>Dano:</strong> {getDamageText()}</p>
      <div className={`attack-description ${expanded ? "expanded" : "collapsed"}`}>
        <strong>Descrição:</strong>{" "}
        <span>{attack.desc || "Sem descrição"}</span>
      </div>
      <div className="button-container">
      {attack.desc?.length > 50 && (
        <button className="read-more-btn" onClick={toggleExpanded}>
          {expanded ? "Mostrar menos" : "Ler mais"}
        </button>
      )}
      </div>
    </div>
  );
}
