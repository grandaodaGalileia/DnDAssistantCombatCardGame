import "../styles/InitiativeBanner.css"; // Ou crie outro CSS se preferir

export default function TurnIndicator({ currentTurnCharacterId, initiativeOrder, viewerCharacterId }) {
  if (!currentTurnCharacterId || !initiativeOrder || initiativeOrder.length === 0) return null;

  // Avisa para todos, exceto quem está na vez
  if (currentTurnCharacterId === viewerCharacterId) return null;

  const currentEntry = initiativeOrder.find(entry => entry.id === currentTurnCharacterId);
  if (!currentEntry) return null;

  return (
    <div className="turn-indicator">
      <p>🎯 Vez de: <strong>{currentEntry.name}</strong></p>
    </div>
  );
}
