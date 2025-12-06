import "../styles/PlayerCombatCards.css";

export default function PlayerCombatCards({ character, section }) {
  if (!character) return null;

  const spells = character.spells || [];
  const weapons = character.weapons || [];

  return (
    <div className="combat-cards-container">
      {section === "spells" && (
        <div className="spells-section">
          <div className="spells-list">
            {spells.map((spell, index) => (
              <div key={index} className="spell-card"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify({ type: "spell", spell })
                  );
                }}
              >
                <h4>{spell.name}</h4>
                <p>
                  <strong>Nível:</strong> {spell.level}
                </p>
                {spell.damage?.damage_dice && (
                  <p>
                    <strong>Dano:</strong> {spell.damage.damage_dice}
                  </p>
                )}
                <p>
                  <strong>Tempo:</strong> {spell.casting_time}
                </p>
                <p className="spell-description">
                  <strong>Descrição:</strong>{" "}
                  {spell.desc?.join(" ") || "Sem descrição"}
                </p>
                <div className="spell-buttons">
                  <button
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(
                        "application/json",
                        JSON.stringify({ type: "spell", spell })
                      );
                    }}
                  >
                    Usar
                  </button>
                  <button>Ler mais</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {section === "weapons" && (
        <div className="weapons-section">
          <div className="weapons-list">
            {weapons.map((weapon, index) => (
              <div className="weapon-card" key={index}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify({ type: "attack", attack: weapon })
                  );
                }}
              >
                <h4>{weapon.name}</h4>
                <p>
                  <strong>Tipo:</strong> {weapon.weapon_category} (
                  {weapon.category_range})
                </p>
                <p>
                  <strong>Dano:</strong> {weapon.damage?.damage_dice} (
                  {weapon.damage?.damage_type?.name})
                </p>
                <p className="spell-description">
                  <strong>Propriedades:</strong>{" "}
                  {weapon.properties?.map((p) => p.name).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
