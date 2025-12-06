// pages/HomePage.jsx
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div>
      <h2>Bem-vindo!</h2>
      <p>Escolha uma opção:</p>
      <Link to="/login">
        <button>Login</button>
      </Link>
      <Link to="/register">
        <button>Registrar</button>
      </Link>
    </div>
  );
}
