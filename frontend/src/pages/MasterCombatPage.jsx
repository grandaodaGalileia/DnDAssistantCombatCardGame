import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useMemo } from "react";
import { io } from "socket.io-client";
import MasterPlayerCombatLayout from "../components/MasterPlayerCombatLayout";
import CombatMonsterArea from "../components/CombatMonsterArea";
import CombatController from "../components/CombatController";
import DiceRollModal from "../components/DiceRollModal";
import InitiativeBanner from "../components/initiativeBanner";
import TurnIndicator from "../components/TurnIndicator";
import CombatGrid from "../components/CombatGrid";
import MasterAttackModal from "../components/MasterAttackModal";
import SharedDiceModal from "../components/SharedDiceModal";
import { getDexMod } from "../utils/attributeUtils";
import "../styles/MasterCombatPage.css";
import "../styles/CombatController.css";
import { GRID_WIDTH, GRID_HEIGHT } from "../utils/gridConfig";

export default function MasterCombatPage({ token }) {
  const { id: roomId } = useParams();
  const [socket, setSocket] = useState(null);
  const [players, setPlayers] = useState([]);
  const [monsters, setMonsters] = useState([]);
  const [inCombat, setInCombat] = useState(false);
  const [showDiceModal, setShowDiceModal] = useState(false);
  const [selectedAttack, setSelectedAttack] = useState(null);
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [initiativeOrder, setInitiativeOrder] = useState([]);
  const [showInitiativePrompt, setShowInitiativePrompt] = useState(null);
  const [showMonsterInitiativeModal, setShowMonsterInitiativeModal] = useState(false);
  const [currentTurnCharacterId, setCurrentTurnCharacterId] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(1);
  const isMasterTurn = useMemo(() => {
    return monsters.some((monster) => monster.id === currentTurnCharacterId);
  }, [monsters, currentTurnCharacterId]);
  const [turnMessage, setTurnMessage] = useState("");
  const [currentTarget, setCurrentTarget] = useState("");
  const [currentMonster, setCurrentMonster] = useState("");
  const [selectedSpell, setSelectedSpell] = useState(null);
  const [showNotYourTurnMessage, setShowNotYourTurnMessage] = useState(false);
  const canShowAttackModal = showDiceModal && currentMonster && selectedAttack && targetPlayer;
  const [showSharedDiceModal, setShowSharedDiceModal] = useState(false);
  const [gridData, setGridData] = useState(Array(GRID_WIDTH * GRID_HEIGHT).fill(null));
  const [lastRollerId, setLastRollerId] = useState(null);
  const [sharedDiceData, setSharedDiceData] = useState(null);
  const turnCharacterIdRef = useRef(null);

  useEffect(() => {
    if (!token || !roomId) return;

    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    newSocket.emit("join_room", {
      roomId,
      token,
      playerName: "Mestre",
      characterId: null,
    });

    newSocket.on("combat_data", (data) => {
      setPlayers(data.players || []);
      setMonsters(data.monsters || []);
      setInCombat(true);
    });

    newSocket.on("combat_initiated", () => {
      setShowInitiativePrompt(true);
    });

    newSocket.on("error_message", (msg) => {
      console.error("[MasterCombatPage] Erro:", msg);
    });

    return () => {
      newSocket.emit("leave_room", { roomId });
      newSocket.disconnect();
    };
  }, [token, roomId]);

  useEffect(() => {
    console.log("🔄 isMasterTurn atualizado:", isMasterTurn);
  }, [isMasterTurn]);

  const emitCombatInitiated = () => {
    if (socket) {
      socket.emit("combat_initiated", { roomId });
    }
  };

  const emitGridUpdate = ({ gridData }) => {
    if (socket && Array.isArray(gridData)) {
      socket.emit("grid_update", { roomId, gridData });
    }
  };

  const resetSelections = () => {
    setCurrentTarget(null);
    setCurrentMonster(null);
    setTargetPlayer(null);
    setSelectedAttack(null);
    setSelectedSpell(null);
    setShowDiceModal(false);
  };

  useEffect(() => {
    if (!socket && monsters.length === 0) return;

    const handleInitiativeOrder = (order) => {
      console.log("Recebida ordem de iniciativa:", order);
      setInitiativeOrder(order);
    };

    const handleYourTurn = ({ currentCharacterId, currentTurn }) => {
      console.log("characterid atual de handleYourTurn: ", currentCharacterId);
      setCurrentTurnCharacterId(currentCharacterId);
      turnCharacterIdRef.current = currentCharacterId;
      setCurrentTurn(currentTurn);
      resetSelections();
    };

    const handleTurnInfo = ({ message }) => {
      setTurnMessage(message);
      setTimeout(() => setTurnMessage(""), 3000);
    };

    const handleMonsterTurn = ({ monster }) => {
      console.log("Monstro selecionado: ", monster);
      setCurrentMonster(monster);
    };

    const handleTargetSelected = ({ player }) => {
      console.log("Alvo Selecionado: ", player);
      setCurrentTarget(player);
    };

    const handleAttackSelected = ({ attack }) => {
      console.log("Ataque selecionado: ", attack);
      setSelectedAttack(attack);
    };

    const handleSpellSelected = ({ spell }) => {
      console.log("Magia selecionada: ", spell);
      setSelectedSpell(spell);
    };

    const handleGridUpdate = ({ gridData }) => {
      console.log("Recebido grid_update do servidor:", gridData);
      if (Array.isArray(gridData)) {
        setGridData(gridData);
      } else {
        console.error("gridData inválido recebido:", gridData);
      }
    };

    const handleSharedDiceResult = ({ rollerName, characterId: rollerId, type, raw, bonus, total, attackName, dieType, seed, faces }) => {
  console.log("[📥 RECEBIDO] Evento dice_roll_result:", {
    rollerName, rollerId, type, raw, bonus, total, attackName, seed, faces
  });

  console.log("📊 Lista de monsters:", monsters);
  console.log("🎯 Comparando rollerId:", rollerId);

  const isRollFromMonster = monsters.some(monster => {
    console.log(`➡️ Checando monstro: id=${monster.id}, comparando com rollerId=${rollerId}`);
    return String(monster.id) === String(rollerId);
  });

  console.log("🧪 isRollFromMonster:", isRollFromMonster);

  if (isRollFromMonster) {
    console.log("🔒 Ignorando rolagem feita por um monstro.");
    return;
  }

  if (lastRollerId && String(lastRollerId) === String(rollerId)) {
    return;
  }

  setSharedDiceData({
    rollerName,
    type,
    raw,
    bonus,
    total,
    attackName,
    dieType,
    seed,
    faces,
  });
  setShowSharedDiceModal(true);
  setLastRollerId(rollerId);
};

    socket.on("initiative_order", handleInitiativeOrder);
    socket.on("your_turn", handleYourTurn);
    socket.on("turn_info", handleTurnInfo);
    socket.on("monstro_da_vez", handleMonsterTurn);
    socket.on("alvo_selecionado", handleTargetSelected);
    socket.on("ataque_selecionado", handleAttackSelected);
    socket.on("magia_selecionada", handleSpellSelected);
    socket.on("dice_roll_result", handleSharedDiceResult);
    socket.on("grid_update", handleGridUpdate);

    return () => {
      socket.off("initiative_order", handleInitiativeOrder);
      socket.off("your_turn", handleYourTurn);
      socket.off("turn_info", handleTurnInfo);
      socket.off("monstro_da_vez", handleMonsterTurn);
      socket.off("alvo_selecionado", handleTargetSelected);
      socket.off("ataque_selecionado", handleAttackSelected);
      socket.off("magia_selecionada", handleSpellSelected);
      socket.off("dice_roll_result", handleSharedDiceResult);
      socket.off("grid_update", handleGridUpdate);
    };
  }, [socket, monsters]);

  useEffect(() => {
    if (showInitiativePrompt && monsters.length > 0) {
      // Mestre precisa rolar manualmente
      setShowMonsterInitiativeModal(true);
    }
  }, [showInitiativePrompt, monsters]);

  useEffect(() => {
    if (selectedAttack && targetPlayer) {
      setShowDiceModal(true);
    }
  }, [selectedAttack, targetPlayer]);

  function showWarning(message) {
    const warnDiv = document.createElement("div");
    warnDiv.className = "not-your-turn-message";
    warnDiv.innerText = message;

    document.body.appendChild(warnDiv);
    setTimeout(() => warnDiv.remove(), 2000);
  }

  return (
    <div className="master-combat">
      {!inCombat ? (
        <p>⏳ Aguardando início do combate ou recebimento de dados...</p>
      ) : (
        <>
          <section className="combat-section-players">
            <MasterPlayerCombatLayout
              players={players}
              selectedPlayerId={targetPlayer?.id}
              isMasterTurn={isMasterTurn}
              onPlayerSelected={(player) => {
                setTargetPlayer(player);
                if (socket) {
                  socket.emit("alvo_selecionado", { roomId, player });
                }
                if (selectedAttack) {
                  setShowDiceModal(true);
                }
              }}
              onClearAll={() => {
                setSelectedAttack(null);
                setSelectedSpell(null);
                setTargetPlayer(null);
                setShowDiceModal(false);
              }}
            />
          </section>
          <CombatGrid
            gridData={gridData}
            setGridData={setGridData}
            onGridUpdate={emitGridUpdate}
          />

          <div
            className="attack-drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();

              if (!isMasterTurn) {
                showWarning("Espere sua vez para atacar");
                return;
              }

              const droppedData = JSON.parse(e.dataTransfer.getData("application/json"));
              const { attack, selectedMonsterId } = droppedData;

              if (!currentMonster) {
                showWarning("Nenhum monstro ativo no momento.");
                return;
              }
              if (selectedMonsterId !== currentMonster.id) {
                showWarning("Não é a vez deste monstro");
                return;
              }

              setSelectedAttack(attack);

              if (socket) {
                socket.emit("ataque_selecionado", {
                  roomId,
                  attack, // ✅ envia apenas o ataque
                });
              }
            }}
          >
            🎯 Solte o ataque aqui!
          </div>
          <section className="combat-section monsters">
            <CombatMonsterArea
              monsters={monsters}
              selectedAttack={selectedAttack}
              currentTurnCharacterId={currentTurnCharacterId}
              onInvalidAttempt={() => {
                setShowNotYourTurnMessage(true);
                setTimeout(() => setShowNotYourTurnMessage(false), 2000);
              }}
              onAttackSelected={(attackData) => {
                setSelectedAttack(attackData);
                if (socket) {
                  socket.emit("ataque_selecionado", {
                    roomId,
                    attack: attackData.attack,
                  });
                }
              }}
            />
          </section>

          <CombatController
            players={players}
            monsters={monsters}
            onStartCombat={() => {
              console.log("⚔️ Combate iniciado!");
              emitCombatInitiated(); // agora é o frontend que dispara o evento
            }}
          />
          {canShowAttackModal && (
            <MasterAttackModal
              attack={selectedAttack}
              monster={currentMonster}
              target={targetPlayer}
              onClose={() => {
                setShowDiceModal(false);
                setSelectedAttack(null);
                setTargetPlayer(null);
                setCurrentMonster(null);
                setSelectedSpell(null);
              }}
              socket={socket}
              roomId={roomId}
            />
          )}
          {showMonsterInitiativeModal && (
            <DiceRollModal
              isMonsterInitiative
              monsters={monsters}
              onClose={() => {
                setShowMonsterInitiativeModal(false);
                setShowInitiativePrompt(false);
              }}
              socket={socket}
              roomId={roomId}
            />
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
            viewerCharacterId={null} // Mestre nunca é o personagem da vez
          />

          {isMasterTurn && (
            <div className="turn-notice">
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
          {showNotYourTurnMessage && (
            <div className="not-your-turn-message">
              Espere sua vez para atacar
            </div>
          )}
          {showSharedDiceModal && sharedDiceData && (
            <SharedDiceModal
              rollData={sharedDiceData}
              onClose={() => {
                console.log("onClose de MasterCombatPage chamado!!");
                setSharedDiceData(null);
                setShowSharedDiceModal(false);
                setSharedDiceData(null);
                setLastRollerId(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
