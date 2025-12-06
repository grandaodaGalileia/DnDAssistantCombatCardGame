import { useState, useEffect } from "react";
import {
  fetchRaces,
  fetchClasses,
  fetchAlignments,
  fetchSubclasses,
  fetchWeapons,
  fetchWeaponDetails,
  fetchSpells,
  fetchSpellDetails,
} from "../services/dndApiService";

export default function CreateCharacterForm({ onCreate }) {
  const [name, setName] = useState("");
  const [race, setRace] = useState("");
  const [classType, setClassType] = useState("");
  const [level, setLevel] = useState(1);
  const [alignment, setAlignment] = useState("");
  const [armorClass, setArmorClass] = useState(10);
  const [hitPoints, setHitPoints] = useState(10);
  const [speed, setSpeed] = useState(30);
  const [selectedWeapons, setSelectedWeapons] = useState([]);
  const [subclass, setSubclass] = useState("");
  const [races, setRaces] = useState([]);
  const [classes, setClasses] = useState([]);
  const [alignments, setAlignments] = useState([]);
  const [subclasses, setSubclasses] = useState([]);
  const [weapons, setWeapons] = useState([]);
  const [spells, setSpells] = useState([]); // Apenas name + index
  const [filteredSpells, setFilteredSpells] = useState([]); // Detalhes das magias compatíveis
  const [selectedSpells, setSelectedSpells] = useState([]);
  const [image, setImage] = useState(null);
  const [attributes, setAttributes] = useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });

  useEffect(() => {
    const loadData = async () => {
      setRaces(await fetchRaces());
      setClasses(await fetchClasses());
      setAlignments(await fetchAlignments());
      setSubclasses(await fetchSubclasses());
      setWeapons(await fetchWeapons());
      setSpells(await fetchSpells()); // Apenas nomes/index
    };
    loadData();
  }, []);

  useEffect(() => {
    console.log("Spells atualizadas:", spells);
  }, [spells]);

  useEffect(() => {
    console.log("ClassType", classType);
    const loadFilteredSpells = async () => {
      if (!classType || spells.length === 0) {
        setFilteredSpells([]);
        return;
      }
      const matchingSpells = [];

      for (const spell of spells) {
        try {
          const detail = await fetchSpellDetails(spell.index);
          console.log("Detalhes: ", detail.classes, "ClassType: ", classType);
          const isMatch = detail.classes?.some(
            (cls) => cls.index === classType
          );

          if (isMatch)
            matchingSpells.push({ index: detail.index, name: detail.name });
        } catch (err) {
          console.error(`Erro ao buscar magia ${spell.index}:`, err);
        }
      }

      setFilteredSpells(matchingSpells);
    };

    loadFilteredSpells();
  }, [classType, spells]);

  const handleAttrChange = (attr, value) => {
    setAttributes((prev) => ({ ...prev, [attr]: Number(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const detailedSpells = await Promise.all(
      selectedSpells.map(async (spellIndex) => {
        try {
          return await fetchSpellDetails(spellIndex);
        } catch (err) {
          console.error("Erro ao buscar spell:", spellIndex, err);
          return { index: spellIndex, name: spellIndex };
        }
      })
    );

    const detailedWeapons = await Promise.all(
      selectedWeapons.map(async (weaponIndex) => {
        try {
          return await fetchWeaponDetails(weaponIndex);
        } catch (err) {
          console.error("Erro ao buscar weapon:", weaponIndex, err);
          return { index: weaponIndex, name: weaponIndex };
        }
      })
    );

    const formData = new FormData();
    const characterData = {
      name,
      race,
      classType,
      level,
      alignment,
      armorClass,
      hitPoints,
      speed,
      attributes,
      weapons: detailedWeapons,
      subclass,
      spells: detailedSpells,
    };

    formData.append("data", JSON.stringify(characterData));
    if (image) formData.append("image", image);

    onCreate(formData);
  };

  return (
    <form className="create-character-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <label>Nome do Personagem</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Eldor, Lyra, Thorne"
          required
        />
      </div>

      <div className="form-section">
        <label>Raça</label>
        <select value={race} onChange={(e) => setRace(e.target.value)} required>
          <option value="">Escolha a Raça</option>
          {races.map((r) => (
            <option key={r.index} value={r.index}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-section">
        <label>Classe</label>
        <select
          value={classType}
          onChange={(e) => setClassType(e.target.value)}
          required
          disabled={spells.length === 0}
        >
          <option value="">Escolha a Classe</option>
          {classes.map((c) => (
            <option key={c.index} value={c.index}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-section">
        <label>Subclasse</label>
        <select value={subclass} onChange={(e) => setSubclass(e.target.value)}>
          <option value="">Escolha a Subclasse</option>
          {subclasses.map((sc) => (
            <option key={sc.index} value={sc.index}>
              {sc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-section">
        <label>Nível</label>
        <input
          type="number"
          value={level}
          onChange={(e) => setLevel(Number(e.target.value))}
          required
        />
      </div>

      <div className="form-section">
        <label>Alinhamento</label>
        <select
          value={alignment}
          onChange={(e) => setAlignment(e.target.value)}
          required
        >
          <option value="">Escolha o Alinhamento</option>
          {alignments.map((a) => (
            <option key={a.index} value={a.index}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-section">
          <label>Classe de Armadura</label>
          <input
            type="number"
            value={armorClass}
            onChange={(e) => setArmorClass(Number(e.target.value))}
            required
          />
        </div>

        <div className="form-section">
          <label>Pontos de Vida</label>
          <input
            type="number"
            value={hitPoints}
            onChange={(e) => setHitPoints(Number(e.target.value))}
            required
          />
        </div>

        <div className="form-section">
          <label>Velocidade</label>
          <input
            type="number"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="form-section">
        <label>Armas Iniciais</label>
        <select
          multiple
          value={selectedWeapons}
          onChange={(e) =>
            setSelectedWeapons(
              [...e.target.selectedOptions].map((opt) => opt.value)
            )
          }
        >
          {weapons.map((w) => (
            <option key={w.index} value={w.index}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-section">
        <label>Magias Disponíveis</label>
        <select
          multiple
          value={selectedSpells}
          onChange={(e) =>
            setSelectedSpells(
              [...e.target.selectedOptions].map((opt) => opt.value)
            )
          }
        >
          {filteredSpells.map((s) => (
            <option key={s.index} value={s.index}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="form-section">
        <legend>Atributos</legend>
        <div className="form-attributes-grid">
          {Object.entries(attributes).map(([key, value]) => (
            <div key={key} className="attribute-input">
              <label>{key[0].toUpperCase() + key.slice(1)}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => handleAttrChange(key, e.target.value)}
                required
              />
            </div>
          ))}
        </div>
      </fieldset>

      <div className="form-section">
        <label>Imagem do Personagem</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>

      <button type="submit">Criar</button>
    </form>
  );
}
