import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function EnterRoomPage({ token }) {
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [characters, setCharacters] = useState([]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Carrega personagens do usuário logado
  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/characters`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          throw new Error("Erro ao carregar personagens");
        }
        const data = await res.json();
        setCharacters(data);
      } catch (error) {
        setError(error.message);
      }
    };
    fetchCharacters();
  }, [token]);

  const handleEnter = async (e) => {
    e.preventDefault();
    if (!selectedCharacter) {
      setError("Por favor, selecione um personagem para entrar na sala.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/api/rooms/join/${roomId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password, characterId: selectedCharacter.id }),
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        setError(errorData.error);
        return;
      }
      
      const data = await res.json();
      console.log(data);
      navigate(`/rooms/${roomId}`, {
        state: { character: selectedCharacter }, // passa dados do personagem para a WaitingRoom
      });
    } catch (error) {
      console.error(error);
      setError("Erro ao entrar na sala.");
    }
  };

  return (
    <div className="enter-room">
      <h2>Entrar em uma Sala</h2>
      <form onSubmit={handleEnter}>
        <div>
          <label>ID da Sala:</label>
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
            placeholder="Ex: AB12CD34"
          />
        </div>
        <div>
          <label>Senha (se necessária):</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Se necessária..."
            type="password"
          />
        </div>
        <button type="submit">Entrar</button>
      </form>

      <h3>Seus Personagens</h3>
      <div className="character-list">
        {characters.length > 0 ? (
          characters.map((character) => (
            <div
              key={character.id}
              className={`character-card ${
                selectedCharacter?.id === character.id ? "selected" : ""
              }`}
              onClick={() => setSelectedCharacter(character)}
              style={{
                border:
                  selectedCharacter?.id === character.id
                    ? "2px solid green"
                    : "1px solid #ccc",
                cursor: "pointer",
                padding: "10px",
                borderRadius: "8px",
              }}
            >
              {character.imageUrl ? (
                <img
                  src={`http://localhost:5000${character.imageUrl}`}
                  alt={character.name}
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "8px",
                  }}
                />
              ) : (
                <div
                  style={{
                    height: "100px",
                    background: "#333",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    borderRadius: "8px",
                  }}
                >
                  Sem imagem
                </div>
              )}
              <h3>{character.name}</h3>
              <p>
                {character.classType} - Nível {character.level}
              </p>
            </div>
          ))
        ) : (
          <p>Você não tem personagens cadastrados!</p>
        )}
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
