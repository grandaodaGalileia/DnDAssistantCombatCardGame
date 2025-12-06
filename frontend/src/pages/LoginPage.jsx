import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  const handleLogin = async (token) => {
    localStorage.setItem("token", token);
    onLogin(token);
    navigate("/role-select");
  };

  return (
    <div>
      <h2>Login</h2>
      <LoginForm onLogin={handleLogin} />
      <p>
        Não tem uma conta?{" "}
        <button onClick={() => navigate("/register")}>Registre-se aqui</button>
      </p>
    </div>
  );
}
