// components/PlayerAttackModal.jsx
import { useEffect, useState, useRef } from "react";
import DiceBox from "@3d-dice/dice-box";
import "../styles/MasterAttackModal.css";

export default function PlayerAttackModal({ onClose, attack, player, target, socket, roomId }) {
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [damageResult, setDamageResult] = useState(null);
  const [attackOutcome, setAttackOutcome] = useState(null);

  const diceBoxRef = useRef(null);

  const parseDamageDice = (diceString) => {
    const match = diceString.match(/(\d*)d(\d+)([+-]?\d+)?/);
    if (!match) return null;
    const count = parseInt(match[1]) || 1;
    const sides = parseInt(match[2]);
    const bonus = parseInt(match[3]) || 0;
    return { count, sides, bonus };
  };

  const extractToHitBonus = () => {
    return player?.modifiers?.strength || 0;
  };

  // Cria DiceBox sob demanda
  const createDiceBox = async () => {
    if (diceBoxRef.current) {
      console.warn("[♻️] DiceBox já existe, reutilizando.");
      return diceBoxRef.current;
    }

    const container = document.querySelector("#player-attack-dice-box");
    if (container) container.innerHTML = "";

    const box = new DiceBox({
      selector: "#player-attack-dice-box",
      theme: "default",
      assetPath: "/assets/dice-box/",
      gravity: 3.5,
      friction: 0.8,
      throwForce: 3.0,
      scale: 8,
    });
    await box.init();
    diceBoxRef.current = box;
    console.log("[✅] DiceBox criado com sucesso.");
    return box;
  };

  // Destrói DiceBox após uso
  const destroyDiceBox = () => {
    if (diceBoxRef.current) {
      console.log("[🧹] Limpando DiceBox.");
      diceBoxRef.current.clear();
      if (diceBoxRef.current.engine?.dispose) {
        diceBoxRef.current.engine.dispose();
      }
      diceBoxRef.current = null;
    }
  };

  const endAttackTurn = () => {
    setAttackOutcome(null);
    onClose();
    socket.emit("end_turn", { roomId });
  };

  const handleRoll = async () => {
    if (rolling) {
      console.warn("[⚠️ BLOQUEADO] Rolagem já em andamento");
      return;
    }

    setRolling(true);
    const box = await createDiceBox();

    console.log("[🎲 ATAQUE] Iniciando rolagem de ataque com 1d20");
    const resultArray = await box.roll(["1d20"]);
    const raw = resultArray[0]?.value || 1;
    const total = raw + extractToHitBonus();
    console.log("[🎲 ATAQUE] Resultado obtido:", resultArray);

    setResult({ raw, total });

    const targetAC = target?.ac || 10;

    console.log("[📤 EMIT] Enviando dado de ataque via socket:", {
      type: "attack",
      raw,
      bonus: extractToHitBonus(),
      total,
      roomId,
      rollerName: player.name,
    });

    socket.emit("dice_roll_result", {
      roomId,
      characterId: player.id,
      rollerName: player.name,
      type: "attack",
      raw,
      bonus: extractToHitBonus(),
      total,
      attackName: attack?.name,
    });

    if (raw === 1) {
      setAttackOutcome("Falha crítica");
      setTimeout(() => {
        destroyDiceBox();
        endAttackTurn();
        setRolling(false);
      }, 3000);
      return;
    } else if (raw === 20) {
      setAttackOutcome("Acerto crítico");
    } else if (total >= targetAC) {
      setAttackOutcome("Sucesso");
    } else {
      setAttackOutcome("Falha");
      setTimeout(() => {
        destroyDiceBox();
        endAttackTurn();
        setRolling(false);
      }, 3000);
      return;
    }

    setTimeout(() => {
      destroyDiceBox();
      setRolling(false);
    }, 3000);
  };

  const handleDamageRoll = async () => {
    if (rolling) {
      console.warn("[⚠️ BLOQUEADO] Rolagem já em andamento");
      return;
    }
    if (!attack?.damage?.[0]?.damage_dice) return;

    setRolling(true);
    const box = await createDiceBox();

    const { count, sides, bonus } = parseDamageDice(attack.damage[0].damage_dice);
    const diceNotation = `${count}d${sides}`;

    console.log("[🎲 DANO] Iniciando rolagem de dano:", diceNotation);
    const resultArray = await box.roll([diceNotation]);
    console.log("[🎲 DANO] Resultado do dano:", resultArray);
    const raw = resultArray.reduce((sum, r) => sum + (r?.value || 0), 0);
    const total = raw + bonus + (player?.modifiers?.strength || 0);

    setDamageResult({ raw, bonus, total });

    console.log("[📤 EMIT] Enviando dado de dano via socket:", {
      type: "damage",
      raw,
      bonus,
      total,
      roomId,
      rollerName: player.name,
      dieType: diceNotation,
    });

    socket.emit("dice_roll_result", {
      roomId,
      characterId: player.id,
      rollerName: player.name,
      type: "damage",
      raw,
      bonus: extractToHitBonus(),
      total,
      attackName: attack?.name,
      dieType: diceNotation,
    });

    setTimeout(() => {
      destroyDiceBox();
      setRolling(false);
      setTimeout(endAttackTurn, 3000);
    }, 3000);
  };

  // Cleanup ao desmontar componente (destruir DiceBox)
  // só para garantir que não fique sobrando nada
  useEffect(() => {
    return () => {
      destroyDiceBox();
    };
  }, []);

  return (
    <div
      className={`dice-modal-overlay ${
        attackOutcome === "Falha crítica"
          ? "critical-failure-glow"
          : attackOutcome === "Acerto crítico"
          ? "critical-success-glow"
          : ""
      }`}
      onClick={() => {
        if (result) {
          destroyDiceBox();
          onClose();
        }
      }}
    >
      <div className="dice-modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          {player?.name} atacará com {attack?.name}
        </h2>

        <div
          id="player-attack-dice-box"
          style={{ width: "100%", height: "200px", margin: "1rem 0" }}
        />

        {!result && (
          <button className="roll-button" onClick={handleRoll} disabled={rolling}>
            Rolar Ataque
          </button>
        )}

        {result && attackOutcome === "Sucesso" && !damageResult && (
          <button className="roll-button" onClick={handleDamageRoll} disabled={rolling}>
            Rolar Dano
          </button>
        )}

        {result && (
          <div className="results">
            🎲 Rolagem: {result.raw} <br />
            ➕ Mod. de Força: {extractToHitBonus()} <br />
            ⚖️ Total com modificadores: <strong>{result.total}</strong>
          </div>
        )}
        {damageResult && (
          <div className="results">
            💥 Dano bruto: {damageResult.raw} <br />
            ➕ Bônus + Força: {damageResult.bonus + (player?.modifiers?.strength || 0)} <br />
            🎯 Dano total: <strong>{damageResult.total}</strong>
          </div>
        )}
      </div>

      {attackOutcome && (
        <div className={`attack-feedback ${attackOutcome === "Sucesso" ? "success" : "failure"}`}>
          {attackOutcome}
        </div>
      )}
    </div>
  );
}