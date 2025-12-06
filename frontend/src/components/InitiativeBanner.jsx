import { useEffect, useState } from "react";
import "../styles/InitiativeBanner.css";

export default function InitiativeBanner({ initiativeOrder, currentTurnCharacterId }) {
  const [showDetailed, setShowDetailed] = useState(true);

  useEffect(() => {
    if (!initiativeOrder || initiativeOrder.length === 0) return;

    setShowDetailed(true);
    const timer = setTimeout(() => setShowDetailed(false), 10000);
    return () => clearTimeout(timer);
  }, [initiativeOrder]);

  if (!initiativeOrder || initiativeOrder.length === 0) return null;

  return (
    <div className="initiative-order-banner">
      {showDetailed ? (
        <>
          <h3>📜 Ordem de Iniciativa:</h3>
          <ul>
            {initiativeOrder.map((entry, index) => (
              <li key={index}>
                {index + 1}. {entry.name} ({entry.initiative})
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <div className="initiative-image-line">
            {initiativeOrder.map((entry, index) => {
              const imageUrl = entry.imageUrl || "/default-icon.png";
              const isCurrent = entry.id === currentTurnCharacterId;
              return (
                <div
                  className={`initiative-icon-wrapper ${isCurrent ? "active-character" : ""}`}
                  key={index}
                >
                  <div className="initiative-icon-container">
                    <img
                      src={`http://localhost:5000${imageUrl}`}
                      alt={entry.name}
                      title={entry.name}
                      className="initiative-icon"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
