import { useNavigate } from "react-router-dom";
import "../styles/PlayerPage.css";

export default function PlayerPage() {
  const navigate = useNavigate();

  return (
    <div className="player-page">
      <div className="player-page-content">
        <h2>Seja Bem-vindo, Jogador!</h2>
        <p>
          Entre em uma aventura ou crie seu personagem para começar a jornada!
        </p>
        <div className="player-buttons">
          <div
            className="player-button join-room"
            onClick={() => navigate("/enter-room")}
          >
            Entrar em uma Sala
          </div>
          <div
            className="player-button create-characters"
            onClick={() => navigate("/dashboard")}
          >
            Criar Personagens
          </div>
        </div>
      </div>
    </div>
  );
}
