import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RoleSelectPage from "./pages/RoleSelectPage";
import CharacterListPage from "./pages/CharacterListPage";
import CreateCharacterPage from "./pages/CreateCharacterPage";
import CreateMonsterPage from "./pages/CreateMonsterPage";
import MonsterListPage from "./pages/MonsterListPage";
import MasterPage from "./pages/MasterPage";
import PlayerPage from "./pages/PlayerPage";
import CreateRoomPage from "./pages/CreateRoomPage";
import WaitingRoomPage from "./pages/WaitingRoomPage";
import EnterRoomPage from "./pages/EnterRoomPage";
import MasterCombatPage from "./pages/MasterCombatPage";
import PlayerCombatPage from "./pages/PlayerCombatPage";

function App() {
  const [token, setToken] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {!token ? (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage onLogin={setToken} />} />
            <Route
              path="/register"
              element={<RegisterPage onRegister={setToken} />}
            />
          </>
        ) : (
          <>
            <Route path="/role-select" element={<RoleSelectPage />} />
            <Route path="/master-menu" element={<MasterPage />} />
            <Route path="/player-menu" element={<PlayerPage />} />
            <Route
              path="/dashboard"
              element={<CharacterListPage token={token} />}
            />
            <Route
              path="/create-character"
              element={<CreateCharacterPage token={token} />}
            />
            <Route path="/master" element={<MonsterListPage token={token} />} />
            <Route
              path="/create-monster"
              element={<CreateMonsterPage token={token} />}
            />
            <Route
              path="/create-room"
              element={<CreateRoomPage token={token} />}
            />
            <Route
              path="/rooms/:id"
              element={<WaitingRoomPage token={token} />}
            />
            <Route
              path="/enter-room"
              element={<EnterRoomPage token={token} />}
            />
            <Route
              path="/combat/master/:id"
              element={<MasterCombatPage token={token} />}
            />
            <Route
              path="/combat/player/:id"
              element={<PlayerCombatPage token={token} />}
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
