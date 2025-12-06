// components/MasterAttackModal.jsx
import { useState, useRef } from "react";
import DiceBox from "@3d-dice/dice-box";
import "../styles/MasterAttackModal.css";

export default function MasterAttackModal({ onClose, attack, monster, target, socket, roomId }) {
    const [showAdvantage, setShowAdvantage] = useState(false);
    const [showPenalty, setShowPenalty] = useState(false);
    const [advantage, setAdvantage] = useState(0);
    const [penalty, setPenalty] = useState(0);
    const [rolling, setRolling] = useState(false);
    const [result, setResult] = useState(null);
    const [damageResult, setDamageResult] = useState(null);
    const [attackOutcome, setAttackOutcome] = useState(null);

    const diceBoxRef = useRef(null);

    // Parse string tipo "2d6+3" em objeto {count: 2, sides: 6, bonus: 3}
    const parseDamageDice = (diceString) => {
        const match = diceString.match(/(\d*)d(\d+)([+-]?\d+)?/);
        if (!match) return null;
        const count = parseInt(match[1]) || 1;
        const sides = parseInt(match[2]);
        const bonus = parseInt(match[3]) || 0;
        return { count, sides, bonus };
    };

    // Cria DiceBox sob demanda
    const createDiceBox = async () => {
        if (diceBoxRef.current) {
            console.warn("[♻️] DiceBox já existe, reutilizando.");
            return diceBoxRef.current;
        }

        // Limpar container antes de criar
        const container = document.querySelector("#master-attack-dice-box");
        if (container) container.innerHTML = "";

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
        return box;
    };

    // Destrói DiceBox após uso
    const destroyDiceBox = () => {
        if (diceBoxRef.current) {
            console.log("[🧹] Limpando DiceBox.");
            diceBoxRef.current.clear();
            if (diceBoxRef.current.engine?.dispose) {
                diceBoxRef.current.engine.dispose(); // liberar WebGL context
            }
            diceBoxRef.current = null;
        }
    };

    const extractToHitBonus = (desc) => {
        const match = desc?.match(/\+(\d+)\s+to hit/i);
        if (match) {
            return parseInt(match[1]);
        }
        return 0;
    };

    // Rolagem de ataque
    const handleRoll = async () => {
        if (rolling) {
            console.warn("[⚠️ BLOQUEADO] Rolagem já em andamento");
            return;
        }
        setRolling(true);

        const box = await createDiceBox();

        console.log("[🎲 ATAQUE] Iniciando rolagem de ataque com 1d20");
        const seed = `${Date.now()}-${Math.random()}`;
        const result = await box.roll(["1d20"], undefined, { seed });
        const faces = result.map(d => d.value);
        const raw = result[0]?.value || 1;
        console.log("[🎲 ATAQUE] Resultado obtido:", result);

        const toHitBonus = extractToHitBonus(attack?.desc);
        const total = raw + toHitBonus + Number(advantage) - Number(penalty);

        setResult({ raw, total });

        const targetAC = target?.character?.ca || 10;

        console.log("[📤 EMIT] Enviando dado de ataque via socket:", {
            type: "attack",
            raw,
            bonus: toHitBonus,
            total,
            roomId,
            rollerName: monster.name,
            seed,
            faces,
        });

        socket.emit("dice_roll_result", {
            roomId,
            characterId: monster.id,
            rollerName: monster.name,
            type: "attack",
            raw,
            bonus: toHitBonus,
            total,
            attackName: attack?.name,
            dieType: "1d20",
            seed, // 👈 envia para todos
            faces,
        });

        if (total >= targetAC) {
            setAttackOutcome("Sucesso");
        } else {
            setAttackOutcome("Falha");
            setTimeout(() => {
                setAttackOutcome(null);
                destroyDiceBox();
                onClose();
                socket.emit("end_turn", { roomId });
                setRolling(false);
            }, 2000);
            return; // não espera limpar o DiceBox mais abaixo nesse caso
        }

        setTimeout(() => {
            destroyDiceBox();
            setRolling(false);
        }, 3000);
    };

    // Rolagem de dano
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
        const damageSeed = `${Date.now()}-${Math.random()}`;
        const result = await box.roll([diceNotation], undefined, { seed: damageSeed });
        const faces = result.map(d => d.value);
        console.log("[🎲 DANO] Resultado do dano:", result);

        const raw = faces.reduce((a,b)=>a+b, 0);
        const total = raw + bonus;

        setDamageResult({ raw, bonus, total });

        console.log("[📤 EMIT] Enviando dado de dano via socket:", {
            type: "damage",
            raw,
            bonus,
            total,
            roomId,
            rollerName: monster.name,
            seed: damageSeed,
            faces,
        });

        socket.emit("dice_roll_result", {
            roomId,
            characterId: monster.id,
            rollerName: monster.name,
            type: "damage",
            raw,
            bonus,
            total,
            attackName: attack?.name,
            dieType: diceNotation,
            seed: damageSeed,
            faces,
        });

        setTimeout(() => {
            destroyDiceBox();
            setRolling(false);
        }, 3000);
    };

    return (
        <div
            className="dice-modal-overlay"
            onClick={() => {
                if (result) {
                    destroyDiceBox();
                    onClose();
                }
            }}
        >
            <div className="dice-modal" onClick={(e) => e.stopPropagation()}>
                <h2>
                    {monster?.name} atacará com {attack?.name}
                </h2>

                <div
                    id="master-attack-dice-box"
                    style={{ width: "100%", height: "200px", margin: "1rem 0" }}
                />

                <div className="adv-penal-options">
                    <button onClick={() => setShowAdvantage(!showAdvantage)}>
                        Adicionar Vantagem
                    </button>
                    <button onClick={() => setShowPenalty(!showPenalty)}>
                        Adicionar Penalidade
                    </button>
                </div>

                {showAdvantage && (
                    <div>
                        <label>Valor da Vantagem: </label>
                        <input
                            type="number"
                            value={advantage}
                            onChange={(e) => setAdvantage(e.target.value)}
                        />
                    </div>
                )}

                {showPenalty && (
                    <div>
                        <label>Valor da Penalidade: </label>
                        <input
                            type="number"
                            value={penalty}
                            onChange={(e) => setPenalty(e.target.value)}
                        />
                    </div>
                )}

                {!result && (
                    <button className="roll-button" onClick={handleRoll} disabled={rolling}>
                        Rolar Ataque
                    </button>
                )}

                {result && attackOutcome === "Sucesso" && !damageResult && (
                    <button
                        className="roll-button"
                        onClick={handleDamageRoll}
                        disabled={rolling}
                    >
                        Rolar Dano
                    </button>
                )}

                {result && (
                    <div className="results">
                        🎲 Rolagem: {result.raw} <br />
                        ➕ Bônus de ataque: {extractToHitBonus(attack?.desc)} <br />
                        ⚖️ Total com modificadores: <strong>{result.total}</strong>
                    </div>
                )}
                {damageResult && (
                    <div className="results">
                        💥 Dano bruto: {damageResult.raw} <br />
                        ➕ Bônus: {damageResult.bonus} <br />
                        🎯 Dano total: <strong>{damageResult.total}</strong>
                    </div>
                )}
            </div>

            {attackOutcome && (
                <div
                    className={`attack-feedback ${attackOutcome === "Sucesso" ? "success" : "failure"
                        }`}
                >
                    {attackOutcome}
                </div>
            )}
        </div>
    );
}