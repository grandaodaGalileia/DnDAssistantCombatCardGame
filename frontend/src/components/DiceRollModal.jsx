// components/DiceRollModal.jsx
import { useState, useRef, useEffect } from "react";
import DiceBox from "@3d-dice/dice-box";
import { getDexMod } from "../utils/attributeUtils";
import "../styles/DiceRollModal.css";

export default function DiceRollModal({
  onClose,
  attack,
  target,
  isInitiativeRoll = false,
  character = null,
  onInitiativeRolled = () => { },
  roomId,
  socket,
  isMonsterInitiative = false,
  monsters = [],
}) {
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [results, setResults] = useState([]);
  const [totalInitiative, setTotalInitiative] = useState(null);
  const [rollResult, setRollResult] = useState(null);
  const [dexModifier, setDexModifier] = useState(null);
  const [attackOutcome, setAttackOutcome] = useState(null); // "Sucesso" | "Falha"
  const [outcomeColor, setOutcomeColor] = useState("green");
  const [rolled, setRolled] = useState(false);

  const diceBoxRef = useRef(null);

  useEffect(() => {
    const initDiceBox = async () => {
      if (diceBoxRef.current) {
        console.warn("[♻️] DiceBox já existe! Evitando recriação.");
        return;
      }

      const selector = isMonsterInitiative ? "#monster-dice-box" : "#dice-box-container";
      const container = document.querySelector(selector);

      if (!container) {
        console.warn("⚠️ Dice container não encontrado no DOM.");
        return;
      }

      const box = new DiceBox({
        selector: "#master-attack-dice-box",
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
    };

    initDiceBox();

    return () => {
      if (diceBoxRef.current) {
        console.log("[🧹] Limpando DiceBox ao desmontar modal.");
        diceBoxRef.current.clear();
        diceBoxRef.current = null;
      }
    };
  }, []);

  const rollWithDiceBox = async (sides = 20, modifier = 0, callback = () => { }) => {
    if (!diceBoxRef.current) return;

    const box = diceBoxRef.current;
    const parsedSides = typeof sides === "string" ? parseInt(sides.replace("d", "")) : sides;
    await box.roll([`1d${sides}`]);

    // Espera o resultado da rolagem
    box.onRollComplete = (results) => {
      const rawValue = results[0]?.value || 1;
      const total = rawValue + modifier;
      callback(rawValue, modifier, total);

      // Apaga os dados depois de 2 segundos
      setTimeout(() => {
        box.clear();
      }, 3000);
    };
  };
  const rollInitiativeForAll = async () => {
    const box = diceBoxRef.current;
    if (!box) return;

    const diceArray = monsters.map(() => "1d20");
    const modifiers = monsters.map(getDexMod);

    await box.roll(diceArray);

    box.onRollComplete = (rollResults) => {
      const finalResults = rollResults.map((result, index) => {
        const monster = monsters[index];
        const roll = result?.value || 1;
        const modifier = modifiers[index];
        const total = roll + modifier;

        socket.emit("initiative_roll", {
          roomId,
          id: monster.id,
          name: monster.name,
          type: "monster",
          roll,
          modifier,
          initiative: total,
        });

        return {
          id: monster.id,
          name: monster.name,
          roll,
          modifier,
          total,
        };
      });
      setResults(finalResults);
      setRolled(true);
      setTimeout(() => {
        box.clear();
      }, 3000);
    };
  };

  const showResultOverlay = (text, color) => {
    setAttackOutcome(text);
    setOutcomeColor(color);
    setTimeout(() => {
      setAttackOutcome(null);
    }, 1500);
  };

  const closeModal = () => {
    setRollResult(null);
    setDexModifier(null);
    setTotalInitiative(null);
    setRolled(false);
    onInitiativeRolled(); // atualiza estado externo
    if (diceBoxRef.current) {
      console.log("[🧹 LIMPEZA] Destruindo DiceBox do DiceRollModal");
      diceBoxRef.current.clear();
      diceBoxRef.current = null;
    }
    onClose();
  };

  if (isMonsterInitiative) {
    return (
      <div className="dice-modal-overlay" onClick={closeModal}>
        <div className="dice-modal" onClick={(e) => e.stopPropagation()}>
          <div
            id={isMonsterInitiative ? "monster-dice-box" : "dice-box-container"}
            style={{
              width: "100%",
              height: "200px",
              margin: "1rem auto",
              borderRadius: "12px",
            }}
          />
          {!rolled ? (
            <button onClick={rollInitiativeForAll} className="roll-button">
              Rolar Iniciativa para Todos
            </button>
          ) : (
            <div className="results">
              {results.map((res) => (
                <div key={res.id} className="monster-result">
                  <strong>{res.name}</strong>: 🎲 {res.roll} + {res.modifier} ={" "}
                  <span className="total">{res.total}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const rollDice = () => {
    setRolling(true);

    rollWithDiceBox(20, 0, (rollValue) => {
      setResult(rollValue);
      setRolling(false);

      const targetAC = target?.character.ca || 10; // valor padrão caso não tenha

      if (rollValue >= targetAC) {
        // Sucesso
        console.log("SUCESSO EM ACERTAR O ALVO");
        showResultOverlay("Sucesso", "green");
      } else {
        // Falha
        console.log("FALHA EM ACERTAR O ALVO")
        showResultOverlay("Falha", "red");

        // Após exibir, fechar modal e pular turno
        setTimeout(() => {
          if (diceBoxRef.current) {
            console.log("[🧹 LIMPEZA] Destruindo DiceBox do DiceRollModal");
            diceBoxRef.current.clear();
            diceBoxRef.current = null;
          }
          onClose(); // fecha o modal
          socket.emit("end_turn", { roomId }); // termina a vez do monstro
        }, 2000);
      }
    });
  };

  useEffect(() => {
    return () => {
      if (diceBoxRef.current) {
        console.log("[🧹 LIMPEZA] Destruindo DiceBox do PlayerAttackModal");
        diceBoxRef.current.clear();
        diceBoxRef.current = null;
      }
    };
  }, []);

  return (
    <div
      className="dice-modal-overlay"
      onClick={() => rolled && closeModal()}
    >
      <div className="dice-modal" onClick={(e) => e.stopPropagation()}>
        <p style={{ fontStyle: "italic" }}>{attack?.attack?.name}</p>
        <div
          id="dice-box-container"
          style={{
            width: "100%",
            height: "200px",
            margin: "1rem auto",
            borderRadius: "12px",
          }}
        />
        {isInitiativeRoll ? (
          !rolled ? (
            <button
              onClick={() => {
                const dexMod = getDexMod(character);
                rollWithDiceBox(20, dexMod, (roll, modifier, total) => {
                  socket.emit("initiative_roll", {
                    roomId,
                    id: character.id,
                    name: character.name,
                    type: "player",
                    roll, // só envia valor base
                  });

                  setRollResult(roll);
                  setDexModifier(modifier);
                  setTotalInitiative(total);
                  setRolled(true);
                });
              }}
              className="roll-button"
            >
              Rolar Iniciativa
            </button>
          ) : (
            <div className="results">
              <div>
                <strong>{character.name}</strong>: 🎲 {rollResult} + {dexModifier} ={" "}
                <span className="total">{totalInitiative}</span>
              </div>
            </div>
          )
        ) : (
          !rolling && (
            <button onClick={rollDice} className="roll-button">
              Rolar Dado
            </button>
          )
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
