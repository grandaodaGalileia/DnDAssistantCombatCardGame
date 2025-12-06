import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRooms, deleteRoom } from "../services/apiService"; // <-- import

export default function CreateRoomPage({ token }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [monsters, setMonsters] = useState([]);
  const [allMonsters, setAllMonsters] = useState([]);
  const [userRooms, setUserRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAllData() {
      await loadMonsters();
      await loadRooms();
    }
    loadAllData();
  }, [token]);

  async function loadMonsters() {
    try {
      const res = await fetch("http://localhost:5000/api/monsters", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error(errorText);
        alert("Erro ao carregar monstros.");
        return;
      }
      const data = await res.json();
      setAllMonsters(data);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar monstros.");
    }
  }

  async function loadRooms() {
    try {
      const rooms = await fetchRooms(token);
      setUserRooms(rooms);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar salas.");
    }
  }

  const handleMonsterSelection = (id) => {
    setMonsters((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (monsters.length === 0) {
      alert("Selecione ao menos um monstro para continuar.");
      return;
    }
    const res = await fetch("http://localhost:5000/api/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, password, monsters }),
    });
    if (res.ok) {
      const data = await res.json();
      console.log("Sala criada:", data);
      navigate(`/rooms/${data.id}`);
    } else {
      alert("Erro ao criar sala");
    }
  };

  const handleEnterRoom = (id) => {
    navigate(`/rooms/${id}`);
  };

  const handleDeleteRoom = async (id) => {
    if (!confirm("Tem certeza que deseja excluir esta sala?")) return;

    try {
      await deleteRoom(token, id);
      alert("Sala excluída com sucesso");
      setUserRooms((prev) => prev.filter((room) => room.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="create-room-page">
      <h2>Criar Sala</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome da Sala:</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ex: Aventura do Dragão"
          />
        </div>
        <div>
          <label>Senha (opcional):</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Se quiser, defina uma senha..."
          />
        </div>
        <div>
          <h3>Selecionar Monstros</h3>
          {allMonsters.length === 0 && (
            <p>
              Você não tem monstros cadastrados. Crie-os antes de continuar!
            </p>
          )}
          {allMonsters.map((monster) => (
            <div key={monster.id}>
              <label>
                <input
                  type="checkbox"
                  checked={monsters.includes(monster.id)}
                  onChange={() => handleMonsterSelection(monster.id)}
                />
                {monster.name}
              </label>
            </div>
          ))}
        </div>
        <button type="submit">Criar Sala e Iniciar Combate</button>
      </form>

      <hr />
      <h3>Minhas Salas</h3>
      <div className="rooms-list">
        {userRooms.length === 0 && <p>Você não tem salas criadas ainda.</p>}

        {userRooms.map((room) => (
          <div key={room.id} className="room-card">
            <h4>{room.name}</h4>
            <p>{room.password ? "Protegida por senha" : "Pública"}</p>
            <div className="room-card-buttons">
              <button onClick={() => handleEnterRoom(room.id)}>Entrar</button>
              <button onClick={() => handleDeleteRoom(room.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
