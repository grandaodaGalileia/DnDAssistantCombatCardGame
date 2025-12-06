import "../styles/CharacterSheet.css";
import Modal from "./Modal";
import { useState } from "react";

export default function CharacterSheet({ character }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalItem, setModalItem] = useState(null);

  function handleOpenModal(type, itemIndex) {
    setModalType(type);
    setModalItem(itemIndex);
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
    setModalType(null);
    setModalItem(null);
  }

  return (
    <>
      <h2>Ficha de {character.name}</h2>
      {/* ... dados do personagem ... */}
      <p>
        <strong>Raça:</strong> {character.race}
      </p>
      <p>
        <strong>Classe:</strong> {character.classType}
      </p>
      <p>
        <strong>Subclasse:</strong> {character.subclass || "N/A"}
      </p>
      <p>
        <strong>Alinhamento:</strong> {character.alignment}
      </p>
      <p>
        <strong>Nível:</strong> {character.level}
      </p>
      <p>
        <strong>CA:</strong> {character.armorClass}
      </p>
      <p>
        <strong>PV:</strong> {character.hitPoints}
      </p>
      <p>
        <strong>Velocidade:</strong> {character.speed}
      </p>
      <p>
        <strong>Arma:</strong> {character.weapon}
      </p>

      <h3>Atributos e Modificadores</h3>
      <ul>
        {character.attributes &&
          Object.entries(character.attributes).map(([key, val]) => (
            <li key={key}>
              {key[0].toUpperCase() + key.slice(1)}: {val}
              {character.modifiers &&
                character.modifiers[key] !== undefined && (
                  <>
                    {" "}
                    ({character.modifiers[key] >= 0 ? "+" : ""}
                    {character.modifiers[key]})
                  </>
                )}
            </li>
          ))}
      </ul>

      <div className="cards-container">
        <div>
          <h3>Magias</h3>
          {character.spells && character.spells.length > 0 ? (
            <div className="cards-container">
              {character.spells.map((spell) => (
                <div
                  key={spell.index}
                  className="card"
                  onClick={() => handleOpenModal("spell", spell.index)}
                >
                  <div className="card-title">{spell.name}</div>
                  <div className="card-subtitle">Clique para detalhes</div>
                </div>
              ))}
            </div>
          ) : (
            <p>Nenhuma magia selecionada</p>
          )}
        </div>

        <div>
          <h3>Armas</h3>
          {character.weapons && character.weapons.length > 0 ? (
            <div className="cards-container">
              {character.weapons.map((weapon) => (
                <div
                  key={weapon.index}
                  className="card"
                  onClick={() => handleOpenModal("weapon", weapon.index)}
                >
                  <div className="card-title">{weapon.name}</div>
                  <div className="card-subtitle">Clique para detalhes</div>
                </div>
              ))}
            </div>
          ) : (
            <p>Nenhuma arma selecionada</p>
          )}
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        type={modalType}
        index={modalItem}
      />
    </>
  );
}
