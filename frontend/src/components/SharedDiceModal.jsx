import React, { useEffect, useRef, useState } from "react";
import DiceBox from "@3d-dice/dice-box";
import "../styles/SharedDiceModal.css";

export default function SharedDiceModal({ rollData, onClose }) {
    const diceBoxRef = useRef(null);
    const hasRolledRef = useRef(false);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!rollData) return;
        console.log("[🆕] SharedDiceModal montado com:", rollData);

        if (diceBoxRef.current) {
            console.warn("[♻️] DiceBox já existe, reutilizando.");
            return diceBoxRef.current;
        }

        const initDiceBox = async () => {
            console.log("Criando DiceBox SharedDiceModal.jsx")
            const box = new DiceBox({
                selector: "#shared-dice-canvas",
                theme: "default",
                assetPath: "/assets/dice-box/",
                gravity: 3.5,
                friction: 0.8,
                throwForce: 3.0,
                scale: 8,
            });

            await box.init();
            diceBoxRef.current = box;
            triggerRoll();
        };

        const triggerRoll = async () => {
            if (!rollData || hasRolledRef.current || !diceBoxRef.current) return;
            hasRolledRef.current = true;

            const { dieType, seed } = rollData;
            const notation = dieType || (type === "attack" ? "1d20" : "1d6");

            // Rolagem determinística usando apenas seed (mesma física + mesmo resultado)
            await diceBoxRef.current.roll([notation], undefined, { seed });

            diceBoxRef.current.onRollComplete = () => {
                setTimeout(() => cleanup(), 3000);
            };
        };




        const cleanup = () => {
            if (diceBoxRef.current) {
                console.log("[🧹] Limpando DiceBox.");
                diceBoxRef.current.clear();
                if (diceBoxRef.current.engine?.dispose) {
                    diceBoxRef.current.engine.dispose(); // liberar WebGL context
                }
                diceBoxRef.current = null;
            }

            hasRolledRef.current = false;
            rollData = null;
            setVisible(false);
            onClose();
        };

        initDiceBox();

        return () => {
            cleanup();
        };
    }, [rollData, onClose]);

    if (!visible || !rollData) return null;

    const { rollerName, type, raw, bonus, total, attackName } = rollData;

    return (
        <div className="shared-dice-modal-overlay">
            <div className="shared-dice-modal">
                <div
                    id="shared-dice-canvas"
                    style={{ width: "100%", height: "300px" }}
                />
                <h2>🎲 Rolagem compartilhada</h2>
                <p>
                    <strong>{rollerName}</strong> rolou {type === "attack" ? "um ataque" : "um dano"}!
                </p>
                {attackName && (
                    <p>
                        🗡️ Ataque: <strong>{attackName}</strong>
                    </p>
                )}
                <p>
                    🎯 Rolagem: <strong>{raw}</strong>
                </p>
                <p>
                    ➕ Bônus: <strong>{bonus}</strong>
                </p>
                <p>
                    💥 Total: <strong>{total}</strong>
                </p>
            </div>
        </div>
    );
}