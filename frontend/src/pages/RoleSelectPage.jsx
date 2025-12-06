import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/roleselect_img.jpg";
import "../styles/RoleSelectPage.css"; // Caminho para o arquivo CSS

export default function RoleSelectPage() {
  const navigate = useNavigate();

  const handleSelect = (role) => {
    if (role === "jogador") {
      navigate("/player-menu");
    } else {
      navigate("/master-menu");
    }
  };

  return (
    <div
      style={{ backgroundImage: `url(${backgroundImage})` }}
      className="role-page"
    >
      <h2 className="role-title">Escolha seu papel</h2>
      <div className="role-buttons">
        <button className="role-button" onClick={() => handleSelect("mestre")}>
          Mestre
        </button>
        <button className="role-button" onClick={() => handleSelect("jogador")}>
          Jogador
        </button>
      </div>
    </div>
  );
}
