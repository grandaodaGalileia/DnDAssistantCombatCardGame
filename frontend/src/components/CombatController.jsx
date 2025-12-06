import { useEffect, useState } from "react";
import AlertModal from "./AlertModal";
import "../styles/CombatController.css"

export default function CombatController({ players, monsters, onStartCombat }) {
  const [showStartButton, setShowStartButton] = useState(true);
  const [alertData, setAlertData] = useState(null); // { title, message, buttons }

  const playersAlive = players.filter((p) => p.character?.hp > 0);
  const monstersAlive = monsters.filter((m) => m.hp > 0);

  const handleStartClick = () => {
    if (playersAlive.length === 0) {
      setAlertData({
        title: "Não foi possível iniciar combate",
        message: "Não há personagens vivos.",
        buttons: [{ text: "OK", action: () => setAlertData(null) }],
      });
      return;
    }

    if (monstersAlive.length === 0) {
      setAlertData({
        title: "Só jogadores vivos",
        message: "Deseja continuar?",
        buttons: [
          { text: "Continuar", action: () => handleContinueWithoutMonsters() },
          { text: "Não continuar", action: () => setAlertData(null) },
        ],
      });
      return;
    }

    startCombat();
  };

  const handleContinueWithoutMonsters = () => {
    setAlertData(null);
    startCombat();
  };

  const startCombat = () => {
    setShowStartButton(false);
    onStartCombat();
  };

  return (
    <>
      {showStartButton && (
        <button className="start-combat-button" onClick={handleStartClick}>
          Iniciar Combate
        </button>
      )}

      {alertData && (
        <AlertModal onClose={() => setAlertData(null)}>
          <h2>{alertData.title}</h2>
          <p>{alertData.message}</p>
          <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
            {alertData.buttons.map((btn, i) => (
              <button key={i} onClick={btn.action}>
                {btn.text}
              </button>
            ))}
          </div>
        </AlertModal>
      )}
    </>
  );
}
