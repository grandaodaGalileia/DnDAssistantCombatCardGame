import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import PlayerBar from "../components/PlayerBar";
import PlayerPlayerCombatLayout from "../components/PlayerPlayerCombatLayout";
import PlayerMonsterCombatLayout from "../components/PlayerMonsterCombatLayout";
import InitiativeBanner from "../components/initiativeBanner";
import TurnIndicator from "../components/TurnIndicator";
import DiceRollModal from "../components/DiceRollModal";
import CombatGrid from "../components/CombatGrid";
import MonsterActionDisplay from "../components/MonsterActionDisplay";
import PlayerAttackModal from "../components/PlayerAttackModal";
import SharedDiceModal from "../components/SharedDiceModal";
import "../styles/PlayerCombatPage.css";
import { GRID_WIDTH, GRID_HEIGHT } from "../utils/gridConfig";

export default function PlayerCombatPage({ token }) {
  const { id: roomId } = useParams();
  const [socket, setSocket] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [monsters, setMonsters] = useState([]);
  const [showInitiativePrompt, setShowInitiativePrompt] = useState(null);
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [initiativeOrder, setInitiativeOrder] = useState([]);
  const [hasRolledInitiative, setHasRolledInitiative] = useState(false);
  const [showPlayerInitiativeModal, setShowPlayerInitiativeModal] = useState(false);
  const location = useLocation();
  const characterId =
    location.state?.characterId || localStorage.getItem("selectedCharacterId");
  const [currentTurnCharacterId, setCurrentTurnCharacterId] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [turnMessage, setTurnMessage] = useState("");
  const [currentMonster, setCurrentMonster] = useState(null);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [selectedAttack, setSelectedAttack] = useState(null);
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [gridData, setGridData] = useState(Array(GRID_WIDTH * GRID_HEIGHT).fill(null));
  const canShowAttackModal = selectedAttack && currentTarget;
  const [showSharedDiceModal, setShowSharedDiceModal] = useState(null);
  const [sharedDiceData, setSharedDiceData] = useState(null);


  useEffect(() => {
    console.log("[Player] useEffect foi chamado"); // ✅
    if (!token || !roomId || !characterId) {
      console.warn("[Player] Dados ausentes:", { token, roomId, characterId }); // ✅
      return;
    }

    console.log("[Player] Iniciando socket com characterId =", characterId);

    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.emit("join_room", {
      roomId,
      token,
      characterId,
      playerName: "",
    });

    newSocket.on("players_update", (players) => {
      const currentPlayer = players.find(p => String(p.character?.id) === String(characterId));
      console.log("[DEBUG] Dados do player encontrado:", currentPlayer);
      console.log("[DEBUG] CharacterId atual:", characterId);
      if (currentPlayer) {
        setPlayerData({
          ...currentPlayer.character,
          id: currentPlayer.characterId,
        });
      }
      console.log("[DEBUG] Dados do player encontrado:", currentPlayer);
      console.log("[DEBUG] CharacterId atual:", characterId);
    });

    newSocket.on("combat_data", ({ players, monsters }) => {
      console.log("[Player] Recebido combat_data:", players);
      console.log("[Player] Procurando por characterId:", characterId);

      setPlayers(players || []);
      setMonsters(monsters || []);

      const currentPlayer = players.find(
        (p) => String(p.characterId) === String(characterId)
      );
      console.log("[Player] Encontrado:", currentPlayer);
      if (currentPlayer) {
        setPlayerData({
          ...currentPlayer.character,
          id: currentPlayer.characterId,
        });
      }
    });

    newSocket.on("combat_initiated", () => {
      console.log("EVENTO DE COMBATE INICIADO CHAMADO");
      setShowInitiativePrompt(true);
    });

    newSocket.on("error_message", (msg) => {
      console.error("[PlayerCombatPage] Erro:", msg);
    });

    return () => {
      newSocket.emit("leave_room", { roomId });
      newSocket.disconnect();
    };
  }, [token, roomId, characterId]);

  const resetSelections = () => {
    console.log("resetando todos os Sets");
    setCurrentTarget(null);
    setCurrentMonster(null);
    setSelectedAttack(null);
    setSelectedSpell(null);
    setSharedDiceData(null);
  };

  const emitGridUpdate = ({ gridData }) => {
    if (socket && Array.isArray(gridData)) {
      socket.emit("grid_update", { roomId, gridData });
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("initiative_order", (order) => {
      console.log("Recebida ordem de iniciativa:", order);
      setInitiativeOrder(order); // um useState([]) no topo
    });

    socket.on("your_turn", ({ currentCharacterId, currentTurn, currentName }) => {
      setCurrentTurnCharacterId(currentCharacterId);
      setCurrentTurn(currentTurn);

      resetSelections();
    });

    socket.on("turn_info", ({ message }) => {
      setTurnMessage(message);
      setTimeout(() => setTurnMessage(""), 3000);
    });

    socket.on("alvo_selecionado", ({ player }) => {
      console.log("Alvo Selecionado111: ", player);
      setCurrentTarget(player);

      if (selectedAttack) {
        console.log("Entrei dentro de selectedAttack no evento alvo_selecionadod: ", selectedAttack);
        setShowDiceModal(true);
      }
    });

    socket.on("monstro_da_vez", ({ monster }) => {
      console.log("Monstro selecionado: ", monster);
      setCurrentMonster(monster);
    });

    socket.on("ataque_selecionado", ({ attack }) => {
      console.log("Ataque selecionado: ", attack);
      setSelectedAttack(attack);

      if (currentTarget) {
        console.log("Entrei dentro de Current Tard dentro do evento AtaqueSelecionado: ", currentTarget);
        setShowDiceModal(true);
      }
    });

    socket.on("magia_selecionada", ({ spell }) => {
      console.log("Magia selecionada: ", spell);
      setSelectedSpell(spell);
    })

    socket.on("dice_roll_result", ({ rollerName, characterId: rollerId, type, raw, bonus, total, attackName, dieType, seed, faces }) => {
      console.log("[📥 RECEBIDO] dice_roll_result:", { rollerName, type, raw, bonus, total, seed, faces });
      if (String(rollerId) === String(characterId)) return; // não mostrar para o jogador da vez

      setSharedDiceData({
        type,
        raw,
        bonus,
        total,
        rollerName,
        attackName,
        dieType,
        seed,
        faces,
      });
      setShowSharedDiceModal(true);
    });


    socket.on("grid_update", ({ gridData: updatedGrid }) => {
      console.log("[Player] Grid atualizado recebido");
      setGridData(updatedGrid);
    });

    return () => {
      socket.off("initiative_order");
    };

  }, [socket]);

  if (!playerData) {
    return <div className="player-combat-page">⏳ Aguardando dados...</div>;
  }

  return (
    <div className="player-combat-page">
      {/* Jogadores nas laterais */}
      <PlayerPlayerCombatLayout players={players} currentId={characterId} />
      {/* Monstros nas laterais (abaixo dos jogadores) */}
      <PlayerMonsterCombatLayout
        monsters={monsters}
        currentTurnCharacterId={currentTurnCharacterId}
        characterId={characterId}
        onTargetSelected={(monster) =>
          socket.emit("alvo_selecionado", { roomId, player: monster })
        }
      />
      {/* Jogador atual no centro */}
      <div className="grid-combat-player">
        <CombatGrid
          gridData={gridData}
          setGridData={setGridData}
          onGridUpdate={emitGridUpdate}
        />
      </div>

      <PlayerBar character={playerData} />

      {showPlayerInitiativeModal && !hasRolledInitiative && (
        <DiceRollModal
          onClose={() => setShowPlayerInitiativeModal(false)}
          isInitiativeRoll={true}
          character={playerData}
          roomId={roomId}
          socket={socket}
          onInitiativeRolled={() => {
            setHasRolledInitiative(true);
            setShowInitiativePrompt(false);
          }}
        />
      )}
      {console.log("RENDER:: showInitiativePrompt =", showInitiativePrompt)}
      {console.log("RENDER:: hasRolledInitiative =", hasRolledInitiative)}
      {canShowAttackModal && currentTurnCharacterId === characterId && (
        <PlayerAttackModal
          attack={selectedAttack}
          target={currentTarget}
          player={playerData}
          onClose={() => {
            setSelectedAttack(null);
            setCurrentTarget(null);
            setSelectedSpell(null);
          }}
          roomId={roomId}
          socket={socket}
        />
      )}

      {showSharedDiceModal && sharedDiceData &&(
        <SharedDiceModal
          key={JSON.stringify(sharedDiceData)} // força nova montagem
          rollData={sharedDiceData}
          onClose={() => {
            setShowSharedDiceModal(false);
            setSharedDiceData(null);
          }}
        />
      )}

      {showInitiativePrompt && !hasRolledInitiative && (
        <div className="initiative-banner">
          <h2>Combate Iniciado</h2>
          <button onClick={() => {
            setShowPlayerInitiativeModal(true);           // mostra modal
            setShowInitiativePrompt(false);
          }}
          >
            Rolar Iniciativa
          </button>
        </div>
      )}
      {initiativeOrder.length > 0 && (
        <InitiativeBanner
          initiativeOrder={initiativeOrder}
          currentTurnCharacterId={currentTurnCharacterId}
        />
      )}
      <TurnIndicator
        currentTurnCharacterId={currentTurnCharacterId}
        initiativeOrder={initiativeOrder}
        viewerCharacterId={characterId}
      />
      {currentTurnCharacterId === characterId && (
        <div className="turn-notice">
          <h1>🎯 Sua vez!</h1>
          <button onClick={() => socket.emit("end_turn", { roomId })}>
            Terminar Vez
          </button>
        </div>
      )}
      {turnMessage && (
        <div className="turn-info">
          <h3>{turnMessage}</h3>
        </div>
      )}
      <MonsterActionDisplay
        monster={currentMonster}
        target={currentTarget}
        attack={selectedAttack}
        spell={selectedSpell}
      />
      <div
        className="player-drop-zone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const data = e.dataTransfer.getData("application/json");
          if (!data) return;

          if (currentTurnCharacterId !== characterId) {
            const warnDiv = document.createElement("div");
            warnDiv.className = "not-your-turn-message";
            warnDiv.innerText = "Espere sua vez para atacar";

            document.body.appendChild(warnDiv);
            setTimeout(() => warnDiv.remove(), 2000); // remove após 2s
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === "attack") {
              let atk = parsed.attack;
              // Se damage for um objeto simples, converte para array
              if (atk.damage && !Array.isArray(atk.damage)) {
                atk.damage = [atk.damage];
              }
              socket.emit("ataque_selecionado", { roomId, attack: atk });
              console.log("Ataque normalizado e droppado:", atk);
            }
            else if (parsed.type === "alvo") {
              socket.emit("alvo_selecionado", { roomId, player: parsed.player });
              console.log("Alvo droppado:", parsed.player);
            }
            else if (parsed.type === "spell") {
              socket.emit("magia_selecionada", { roomId, spell: parsed.spell });
              console.log("Magia droppada: ", parsed.spell);
            }
            else {
              console.warn("Tipo não reconhecido:", parsed);
            }
          } catch (err) {
            console.error("Erro ao processar drop:", err);
          }
        }}
      >
        <p>🎯 Solte aqui sua carta de ataque</p>
      </div>
    </div>

  );
}
