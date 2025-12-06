import { getModifier } from "./attributeUtils";

export function calcularIniciativa(baseRoll, dexterityScore) {
  return baseRoll + getModifier(dexterityScore);
}
