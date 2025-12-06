import { useNavigate } from "react-router-dom";
import "../styles/MasterPage.css";

export default function MasterPage() {
  const navigate = useNavigate();

  return (
    <div className="master-page">
      <div className="master-page-content">
        <h2>Seja Bem-vindo, Mestre!</h2>
        <p>Gerencie suas salas e crie monstros para suas aventuras épicas!</p>
        <div className="master-buttons">
          <div
            className="master-button create-room"
            onClick={() => navigate("/create-room")}
          >
            Criar Sala
          </div>
          <div
            className="master-button create-monsters"
            onClick={() => navigate("/master")}
          >
            Criar Monstros
          </div>
        </div>
      </div>
    </div>
  );
}
