import "../styles/MonsterModal.css";

export default function MonsterModal({ isOpen, onClose, title, description }) {
  if (!isOpen) return null;

  return (
    <div className="monster-modal-overlay" onClick={onClose}>
      <div
        className="monster-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="monster-modal-close" onClick={onClose}>
          ✕
        </button>
        <h2>{title}</h2>
        <div className="monster-modal-body">
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}
