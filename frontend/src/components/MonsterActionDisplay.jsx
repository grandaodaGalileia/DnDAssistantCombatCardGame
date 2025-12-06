import { useEffect, useState, useRef } from "react";
import "../styles/MonsterActionDisplay.css";

export default function MonsterActionDisplay({ monster, attack, target, spell }) {
  const [displayQueue, setDisplayQueue] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [fade, setFade] = useState("fade-in");

  const lastDataRef = useRef({
    monsterJson: null,
    attackJson: null,
    targetJson: null,
    spellJson: null,
  });

  // Detecta alterações reais e adiciona à fila
  useEffect(() => {
    const newQueue = [];

    // MONSTER (não deve repetir o mesmo monstro)
    const monsterStr = monster ? JSON.stringify(monster) : null;
    if (monsterStr && monsterStr !== lastDataRef.current.monsterJson) {
      newQueue.push({ type: "monster", data: monster });
      lastDataRef.current.monsterJson = monsterStr;
    }

    // ATTACK (sempre deve mostrar se foi reenviado)
    const attackStr = attack ? JSON.stringify(attack) : null;
    if (attackStr && attackStr !== lastDataRef.current.attackJson) {
      newQueue.push({ type: "attack", data: attack });
      lastDataRef.current.attackJson = attackStr;
    }

    // ATTACK (sempre deve mostrar se foi reenviado)
    const spellStr = spell ? JSON.stringify(spell) : null;
    if (spellStr && spellStr !== lastDataRef.current.spellJson) {
      newQueue.push({ type: "spell", data: spell });
      lastDataRef.current.spellJson = spellStr;
    }

    // TARGET (idem)
    const targetStr = target ? JSON.stringify(target) : null;
    if (targetStr && targetStr !== lastDataRef.current.targetJson) {
      newQueue.push({ type: "target", data: target });
      lastDataRef.current.targetJson = targetStr;
    }

    if (newQueue.length > 0) {
      setDisplayQueue((prev) => [...prev, ...newQueue]);
    }
  }, [monster, attack, target, spell]);

  // Controla o que será exibido com animação
  useEffect(() => {
    if (displayQueue.length === 0) {
      setCurrentItem(null);
      return;
    }

    const next = displayQueue[0];
    setCurrentItem(next);
    setFade("fade-in");

    const showDuration = setTimeout(() => {
      setFade("fade-out");
    }, 4000);

    const clearDuration = setTimeout(() => {
      setDisplayQueue((prev) => prev.slice(1));
    }, 4800);

    return () => {
      clearTimeout(showDuration);
      clearTimeout(clearDuration);
    };
  }, [displayQueue]);

  if (!currentItem) return null;

  const renderContent = () => {
    if (currentItem.type === "monster") {
      const m = currentItem.data;
      return (
        <div className="display-card">
          <h2>{m.name}</h2>
          <img src={`http://localhost:5000${m.imageUrl}`} alt={m.name} />
          <p>HP: {m.hitPoints}</p>
          <p>CA: {m.armorClass}</p>
        </div>
      );
    }

    if (currentItem.type === "attack") {
      const atk = currentItem.data;
      let dmgText = "Sem dano";
      if (Array.isArray(atk.damage)) {
        dmgText = atk.damage.map(
          (d) => `${d.damage_dice || "?"} ${d.damage_type?.name || ""}`
        ).join(" / ");
      } else if (typeof atk.damage === "object" && atk.damage !== null) {
        dmgText = `${atk.damage.damage_dice || "?"} ${atk.damage.damage_type?.name || ""}`;
      }
      return (
        <div className="display-card">
          <h3>Ataque: {atk.name}</h3>
          <p>{atk.desc}</p>
          <p><strong>Dano:</strong> {dmgText}</p>
        </div>
      );
    }

    if (currentItem.type === "spell") {
      const spell = currentItem.data;
      const dmgText = spell.damage?.map(
        (d) => `${d.damage_dice || "?"} ${d.damage_type?.name || ""}`
      ).join(" / ") || "Sem dano";

      return (
        <div className="display-card">
          <h3>Magia: {spell.name}</h3>
          <p>{spell.desc}</p>
          <p><strong>Dano:</strong> {dmgText}</p>
        </div>
      );
    }

    if (currentItem.type === "target") {
      const t = currentItem.data;

      const name = t.character?.name || t.name || "Desconhecido";
      const imageUrl = t.character?.imageUrl || t.imageUrl || "";
      const hp = t.character?.hp ?? t.hitPoints ?? "??";
      const ca = t.character?.ca ?? t.armorClass ?? "??";

      return (
        <div className="display-card">
          <h3>Alvo: {name}</h3>
          {imageUrl && <img src={`http://localhost:5000${imageUrl}`} alt={name} />}
          <p>HP: {hp}</p>
          <p>CA: {ca}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`monster-action-float ${fade}`}>
      {renderContent()}
    </div>
  );
}
