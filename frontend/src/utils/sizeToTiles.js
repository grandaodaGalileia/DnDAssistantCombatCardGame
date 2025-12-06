export const getTileDimensions = (size) => {
  switch (size) {
    case "Tiny":
      return { w: 1, h: 1, scale: 0.5 }; // render pequeno
    case "Small":
    case "Medium":
      return { w: 1, h: 1, scale: 1 };
    case "Large":
      return { w: 2, h: 2, scale: 1 };
    case "Huge":
      return { w: 3, h: 3, scale: 1 };
    case "Gargantuan":
      return { w: 4, h: 4, scale: 1 };
    default:
      return { w: 1, h: 1, scale: 1 };
  }
};