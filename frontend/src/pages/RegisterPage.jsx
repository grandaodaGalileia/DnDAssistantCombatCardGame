import { useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";

export default function RegisterPage({ onRegister }) {
  const navigate = useNavigate();

  const handleRegister = async (token) => {
    localStorage.setItem("token", token);
    onRegister(token); // ESSENCIAL
    navigate("/role-select");
  };

  return (
    <div>
      <h2>Registro</h2>
      <RegisterForm onRegister={handleRegister} />
    </div>
  );
}
