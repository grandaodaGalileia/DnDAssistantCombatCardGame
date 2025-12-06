export function getModifier(score) {
  return Math.floor((score - 10) / 2);
}

export function getDexMod(entity) {
  const dex = Number(entity?.attributes?.dexterity);
  if (!Number.isFinite(dex)) return 0;
  return Math.floor((dex - 10) / 2);
}
