import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { verifyToken } from "../services/apiService";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";

export default function WaitingRoomPage({ token }) {
  const { id: roomId } = useParams();
  const [players, setPlayers] = useState([]);
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [characterId, setCharacterId] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const role = "master";

  // Conecta ao socket e entra na sala
  useEffect(() => {
    if (!username) return;

    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.emit("join_room", {
      roomId,
      playerName: username,
      token,
    });

    newSocket.on("players_update", (updatedPlayers) =>
      setPlayers(updatedPlayers)
    );
    newSocket.on("error_message", (msg) => {
      alert(msg);
    });

    return () => {
      newSocket.emit("leave_room", { roomId }); // Limpa quando sair
      newSocket.disconnect();
    };
  }, [roomId, token, username]);

  useEffect(() => {
  const selectedChar = location.state?.character;
  if (selectedChar?.id) {
    console.log("[WaitingRoom] Recebido character via location.state:", selectedChar);
    setCharacterId(selectedChar.id);
    localStorage.setItem("selectedCharacterId", selectedChar.id);
  } else {
    console.warn("[WaitingRoom] Nenhum character recebido via location.state");
  }
}, [location.state]);

  // Obter o nome de usuário atual
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await verifyToken(token);
        if (userData.username) {
          setUsername(userData.username);
        } else {
          setError("Não foi possível obter o nome de usuário.");
        }
      } catch (err) {
        console.error(err);
        setError("Erro ao verificar o usuário.");
      }
    };
    fetchUser();
  }, [token]);

  const handleStartCombat = async () => {
    const res = await fetch(
      `http://localhost:5000/api/rooms/${roomId}/start-combat`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await res.json();
    if (data.success) {
      socket.emit("start_combat", { roomId }); // Emite para todos
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("combat_started", async () => {
      console.log("Combat started recebido!");
      console.log("[WaitingRoom] CharacterId recebido:", characterId);
      if (players.find((p) => p.name === username)?.role === "master") {
        navigate(`/combat/master/${roomId}`);
      } else {
        navigate(`/combat/player/${roomId}`, {
          state: { characterId },
        });
      }
    });
  }, [socket, players, username, roomId]);

  return (
    <div className="waiting-room">
      <h2>Sala de Espera — ID: {roomId}</h2>
      {username && (
        <p>
          Jogador atual: <strong>{username}</strong>
        </p>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="players-list">
        <h3>Jogadores Conectados</h3>
        {players.length === 0 ? (
          <p> Aguardando jogadores conectarem...</p>
        ) : (
          <ul>
            {players.map((player) => (
              <li key={player.id}>
                {player.name} —{" "}
                {player.role === "master" ? "Mestre" : "Jogador"}{" "}
                {player.role === "player" && (
                  <span>{player.ready ? " ✅ Pronto" : " ⏳ Aguardando"}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="waiting-room-buttons">
        {players.find((p) => p.name === username)?.role === "master" ? (
          // Mestre
          <button
            disabled={players.some((p) => p.role === "player" && !p.ready)}
            onClick={handleStartCombat}
          >
            Iniciar Combate
          </button>
        ) : (
          // Jogador
          <button
            onClick={() =>
              socket.emit("set_ready", {
                roomId,
                ready: true,
              })
            }
          >
            Pronto
          </button>
        )}
      </div>
    </div>
  );
}
