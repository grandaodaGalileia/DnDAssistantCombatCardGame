import "../styles/MonsterSheet.css";
import { useState } from "react";
import MonsterModal from "./MonsterModal";

export default function MonsterSheet({ monster }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");

  const handleOpenModal = (title, description) => {
    setModalTitle(title);
    setModalDescription(description);
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setModalTitle("");
    setModalDescription("");
  };

  return (
    <div className="character-sheet">
      <h2>Ficha de {monster.name}</h2>
      <p>
        <strong>Nível Desafio:</strong> {monster.challenge}
      </p>
      <p>
        <strong>CA:</strong> {monster.armorClass}
      </p>
      <p>
        <strong>PV:</strong> {monster.hitPoints}
      </p>
      <p>
        <strong>Velocidade:</strong> {monster.speed}
      </p>

      <h3>Atributos</h3>
      <ul>
        {monster.attributes &&
          Object.entries(monster.attributes).map(([key, val]) => (
            <li key={key}>
              {key[0].toUpperCase() + key.slice(1)}: {val}
              {monster.modifiers?.[key] !== undefined && (
                <>
                  {" "}
                  ({monster.modifiers[key] >= 0 ? "+" : ""}
                  {monster.modifiers[key]})
                </>
              )}
            </li>
          ))}
      </ul>

      <h3>Resistências</h3>
      <p>{monster.damageResistances?.join(", ") || "Não disponível"}</p>

      <h3>Imunidades</h3>
      <p>{monster.damageImmunities?.join(", ") || "Não disponível"}</p>

      <h3>Condições Imunes</h3>
      <p>{monster.conditionImmunities?.join(", ") || "Não disponível"}</p>

      <h3>Sentidos</h3>
      {monster.senses && Object.keys(monster.senses).length > 0 ? (
        <ul>
          {Object.entries(monster.senses).map(([sense, value]) => (
            <li key={sense}>
              {sense.replace("_", " ")}: {value}
            </li>
          ))}
        </ul>
      ) : (
        <p>Não disponível</p>
      )}

      <h3>Saving Throws</h3>
      <p>{monster.savingThrows?.join(", ") || "Não disponível"}</p>

      <h3>Habilidades</h3>
      {monster.abilities?.length > 0 ? (
        monster.abilities.map((ability, index) => (
          <div
            key={index}
            className="card"
            onClick={() => handleOpenModal(ability.name, ability.desc)}
          >
            <div className="card-title">{ability.name}</div>
            <div className="card-subtitle">Clique para detalhes</div>
          </div>
        ))
      ) : (
        <p>Nenhuma habilidade registrada</p>
      )}

      <h3>Ataques/Ações</h3>
      {monster.attacks?.length > 0 ? (
        monster.attacks.map((attack, index) => (
          <div
            key={index}
            className="card"
            onClick={() => handleOpenModal(attack.name, attack.desc)}
          >
            <div className="card-title">{attack.name}</div>
            <div className="card-subtitle">Clique para detalhes</div>
          </div>
        ))
      ) : (
        <p>Nenhum ataque registrado</p>
      )}

      <MonsterModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        description={modalDescription}
      />
    </div>
  );
}
