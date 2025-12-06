import { useState, useEffect } from "react";
import { createMonster } from "../services/apiService";
import { fetchFromAPI } from "../services/dndApiService";
import "../styles/MonsterSheet.css";
import "../styles/CreateMonsterPage.css";

export default function CreateMonsterPage({ token }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMonster, setSelectedMonster] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (searchQuery.length > 1) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    const data = await fetchFromAPI(`monsters?name=${searchQuery}`);
    setSearchResults(data.results || []);
  };
  const handleSelectResult = async (monsterIndex) => {
    const data = await fetchFromAPI(`monsters/${monsterIndex}`);
    setSelectedMonster(data);
    setSearchResults([]);
    setSearchQuery(data.name);
  };
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };
  const handleCreate = async () => {
    if (!selectedMonster) return;

    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({
        name: selectedMonster.name,
        size: selectedMonster.size,
        armorClass: Array.isArray(selectedMonster.armor_class)
          ? selectedMonster.armor_class[0]?.value
          : selectedMonster.armor_class ?? null,
        hitPoints: selectedMonster.hit_points ?? null,
        speed: selectedMonster.speed?.walk ?? "Desconhecida",
        attributes: {
          strength: selectedMonster.strength ?? 10,
          dexterity: selectedMonster.dexterity ?? 10,
          constitution: selectedMonster.constitution ?? 10,
          intelligence: selectedMonster.intelligence ?? 10,
          wisdom: selectedMonster.wisdom ?? 10,
          charisma: selectedMonster.charisma ?? 10,
        },
        savingThrows: selectedMonster.saving_throws ?? [],
        damageResistances: selectedMonster.damage_resistances ?? [],
        damageImmunities: selectedMonster.damage_immunities ?? [],
        conditionImmunities: selectedMonster.condition_immunities ?? [],
        senses: selectedMonster.senses ?? {},
        challenge: selectedMonster.challenge_rating ?? "0",
        abilities: selectedMonster.special_abilities ?? [],
        attacks: selectedMonster.actions ?? [],
      })
    );
    if (imageFile) {
      formData.append("image", imageFile);
    }
    try {
      await createMonster(token, formData);
      alert("Monstro criado com sucesso!");
    } catch (err) {
      alert("Erro ao criar monstro: " + err.message);
    }
  };
  return (
    <div className="create-monster-page">
      <div className="create-monster-page-content">
        <h1>Criar Monstro</h1>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar Monstro..."
          className="search-input"
        />
        {searchResults.length > 0 && (
          <div className="search-suggestions">
            {searchResults.map((monster) => (
              <div
                key={monster.index}
                onClick={() => handleSelectResult(monster.index)}
              >
                {monster.name}
              </div>
            ))}
          </div>
        )}
        {selectedMonster && (
          <div className="monster-sheet">
            <h2>{selectedMonster.name}</h2>
            <p>
              <strong>CA:</strong>{" "}
              {Array.isArray(selectedMonster.armor_class)
                ? selectedMonster.armor_class[0]?.value
                : selectedMonster.armor_class}
            </p>
            <p>
              <strong>HP:</strong> {selectedMonster.hit_points}
            </p>
            <p>
              <strong>Tamanho:</strong> {selectedMonster.size}
            </p>
            <h3>Atributos</h3>
            <ul>
              <li>FOR: {selectedMonster.strength}</li>
              <li>DES: {selectedMonster.dexterity}</li>
              <li>CON: {selectedMonster.constitution}</li>
              <li>INT: {selectedMonster.intelligence}</li>
              <li>SAB: {selectedMonster.wisdom}</li>
              <li>CAR: {selectedMonster.charisma}</li>
            </ul>
            <h3>Saving Throws</h3>
            <p>
              {selectedMonster.saving_throws?.join(", ") || "Não disponível"}
            </p>
            <h3>Resistências</h3>
            <p>
              {selectedMonster.damage_resistances?.join(", ") ||
                "Não disponível"}
            </p>
            <h3>Imunidades</h3>
            <p>
              {selectedMonster.damage_immunities?.join(", ") ||
                "Não disponível"}
            </p>
            <h3>Condições Imunes</h3>
            <p>
              {selectedMonster.condition_immunities?.join(", ") ||
                "Não disponível"}
            </p>
            <h3>Sentidos</h3>
            {selectedMonster.senses &&
            Object.keys(selectedMonster.senses).length > 0 ? (
              <ul>
                {Object.entries(selectedMonster.senses).map(([key, value]) => (
                  <li key={key}>
                    {key.replace("_", " ")}: {value}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Não disponível</p>
            )}
            <h3>Habilidades</h3>
            {selectedMonster.special_abilities?.map((ability) => (
              <div key={ability.name}>
                <strong>{ability.name}</strong> - {ability.desc}
              </div>
            ))}
            <h3>Ataques/Ações</h3>
            {selectedMonster.actions?.map((attack) => (
              <div key={attack.name}>
                <strong>{attack.name}</strong> - {attack.desc}
              </div>
            ))}
            <div className="image-input">
              <label>Adicionar imagem</label>
              <input type="file" onChange={handleImageChange} />
            </div>
            <button onClick={handleCreate}>Criar Monstro</button>
          </div>
        )}
      </div>
    </div>
  );
}
