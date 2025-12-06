import { useEffect, useState } from "react";
import "../styles/Modal.css";
import {
  fetchSpellDetails,
  fetchWeaponDetails,
} from "../services/dndApiService";
import {
  GiMagicSwirl,
  GiCrossedSwords,
  GiBattleAxe,
  GiRun,
} from "react-icons/gi";

export default function Modal({ isOpen, onClose, type, index }) {
  const [details, setDetails] = useState(null);

  useEffect(() => {
    if (!isOpen || !type || !index) return;

    const loadDetails = async () => {
      try {
        const data =
          type === "spell"
            ? await fetchSpellDetails(index)
            : await fetchWeaponDetails(index);
        setDetails(data);
      } catch (err) {
        console.error("Erro ao buscar detalhes:", err);
      }
    };

    loadDetails();
  }, [isOpen, type, index]);

  if (!isOpen || !details) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content fantasy-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2>{details.name}</h2>
        {/* Dentro do retorno do Modal.jsx */}
        <div className="modal-body">
          {type === "spell" ? (
            <>
              <p>
                <strong>Nível:</strong> {details.level}
              </p>
              <p>
                <strong>🪄 Escola de Magia:</strong> {details.school?.name}
              </p>
              <p>
                <strong>⏳ Tempo de Conjuração:</strong> {details.casting_time}
              </p>
              <p>
                <strong>🕓 Duração:</strong> {details.duration}
              </p>
              <p>
                <strong>🧳 Componentes:</strong>{" "}
                {details.components?.join(", ")}
              </p>
              <div className="modal-description">
                {details.desc?.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            </>
          ) : (
            <>
              <p>
                <GiBattleAxe /> <strong>Categoria:</strong>{" "}
                {details.equipment_category?.name}
              </p>
              <p>
                <strong>🗡️ Tipo de Arma:</strong> {details.weapon_category}
              </p>
              <p>
                <GiCrossedSwords /> <strong>Dano:</strong>{" "}
                {details.damage?.damage_dice} (
                {details.damage?.damage_type?.name})
              </p>
              <p>
                <strong>⚔️ Propriedades:</strong>{" "}
                {details.properties?.map((p) => p.name).join(", ")}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
