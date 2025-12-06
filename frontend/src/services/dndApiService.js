const API_BASE = "https://www.dnd5eapi.co/api";

// Utilitário genérico
export const fetchFromAPI = async (endpoint) => {
  const response = await fetch(`${API_BASE}/${endpoint}`);
  if (!response.ok) {
    throw new Error(`Erro ao buscar: ${endpoint}`);
  }
  const data = await response.json();
  return data;
};

// Funções específicas
export const fetchRaces = async () => {
  const data = await fetchFromAPI("races");
  return data.results;
};

export const fetchClasses = async () => {
  const data = await fetchFromAPI("classes");
  return data.results;
};

export const fetchAlignments = async () => {
  const data = await fetchFromAPI("alignments");
  return data.results;
};

export const fetchSubclasses = async () => {
  const data = await fetchFromAPI("subclasses");
  return data.results;
};

export const fetchWeapons = async () => {
  const data = await fetchFromAPI("equipment-categories/weapon");
  return data.equipment;
};

export const fetchWeaponDetails = async (weaponIndex) => {
  await delay(1); // evita erro 429
  return await fetchFromAPI(`equipment/${weaponIndex}`);
};

// Delay helper
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

// Carrega apenas os nomes/index das magias
export const fetchSpells = async () => {
  const data = await fetchFromAPI("spells");
  return data.results; // apenas name e index
};

// Função para buscar detalhes de uma magia individual
export const fetchSpellDetails = async (spellIndex) => {
  await delay(1); // para evitar erro 429
  return await fetchFromAPI(`spells/${spellIndex}`);
};
