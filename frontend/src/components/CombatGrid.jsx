import React, { useRef, useState, useEffect } from "react";
import "../styles/CombatGrid.css";
import { getTileDimensions } from "../utils/sizeToTiles";
import { GRID_WIDTH, GRID_HEIGHT } from "../utils/gridConfig";

export default function CombatGrid({
  gridData,
  setGridData,
  onGridUpdate,
  userRole,
  userCharacterId,
  socket,
  roomId,
}) {
  const [scale, setScale] = useState(1);
  const gridContainerRef = useRef(null);
  const position = useRef({ x: 0, y: 0 });
  const isPanning = useRef(false);

  // === SOCKET ===
  useEffect(() => {
    if (!socket) return;
    const handleGridUpdate = ({ gridData: newGrid }) => setGridData(newGrid);
    socket.on("grid_update", handleGridUpdate);
    return () => socket.off("grid_update", handleGridUpdate);
  }, [socket, setGridData]);

  const emitGridUpdate = (newGrid) => {
    if (socket && roomId) socket.emit("grid_update", { roomId, gridData: newGrid });
  };

  // === UTILIDADES ===
  const indexToCoord = (index) => ({ x: index % GRID_WIDTH, y: Math.floor(index / GRID_WIDTH) });
  const coordToIndex = (x, y) => y * GRID_WIDTH + x;

  const canPlaceToken = (x, y, w, h, tokenId) => {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const idx = coordToIndex(x + dx, y + dy);
        if (idx >= gridData.length) return false;
        const cell = gridData[idx];
        if (cell?.isMain && cell.id !== tokenId) return false;
      }
    }
    return true;
  };

  const placeToken = (x, y, token) => {
    const { w, h } = getTileDimensions(token.size || "Medium");
    if (!canPlaceToken(x, y, w, h, token.id)) return;

    const newGrid = [...gridData].map((cell) => (cell?.id === token.id ? null : cell));

    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const idx = coordToIndex(x + dx, y + dy);
        newGrid[idx] = { ...token, occupied: true };
      }
    }

    const mainIndex = coordToIndex(x, y);
    newGrid[mainIndex] = { ...token, startX: x, startY: y, w, h, isMain: true };

    setGridData(newGrid);
    emitGridUpdate(newGrid);
    if (onGridUpdate) onGridUpdate({ gridData: newGrid });
  };

  // === GRID ZOOM / PAN ===
  const handleWheel = (e) => {
    if (e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.min(Math.max(prev + delta, 0.5), 2.5));
  };

  const handleMouseDown = (e) => {
    if (e.target.classList.contains("grid-token-absolute")) return;
    isPanning.current = true;
    position.current = { x: e.clientX, y: e.clientY };
    gridContainerRef.current.style.cursor = "grabbing";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isPanning.current) return;
    const dx = e.clientX - position.current.x;
    const dy = e.clientY - position.current.y;
    position.current = { x: e.clientX, y: e.clientY };
    gridContainerRef.current.scrollLeft -= dx;
    gridContainerRef.current.scrollTop -= dy;
  };

  const handleMouseUp = () => {
    isPanning.current = false;
    gridContainerRef.current.style.cursor = "default";
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className="grid-wrapper"
      ref={gridContainerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
    >
      <div
        className="combat-grid"
        style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}
      >
        {/* Células do grid */}
        {gridData.map((_, index) => (
          <div
            key={index}
            className="grid-cell"
            onDrop={(e) => {
              e.preventDefault();
              const rawData = e.dataTransfer.getData("application/json");
              if (!rawData) return;
              let data;
              try { data = JSON.parse(rawData); }
              catch (err) { console.error(err, rawData); return; }

              if ((userRole === "master" && data.type === "player") ||
                  (userRole === "player" && data.id !== userCharacterId)) return;

              const { w, h } = getTileDimensions(data.size || "Medium");
              const { x, y } = indexToCoord(index);
              if (!canPlaceToken(x, y, w, h, data.id)) return;
              placeToken(x, y, data);
            }}
            onDragOver={(e) => e.preventDefault()}
          />
        ))}

        {/* Tokens internos do grid */}
        {gridData.filter(cell => cell?.isMain).map(cell => (
          <img
            key={cell.id}
            src={cell.img}
            alt={cell.name}
            className="grid-token-absolute"
            draggable={true}
            onDragStart={(e) => {
              e.dataTransfer.setData("application/json", JSON.stringify(cell));
              const crt = document.createElement("img");
              crt.src = cell.img;
              crt.style.width = "50px";
              e.dataTransfer.setDragImage(crt, 25, 25);
            }}
            style={{
              gridColumnStart: cell.startX + 1,
              gridColumnEnd: `span ${cell.w}`,
              gridRowStart: cell.startY + 1,
              gridRowEnd: `span ${cell.h}`,
              transform: `scale(${getTileDimensions(cell.size)?.scale || 1})`,
              cursor: (userRole === "master" && cell.type === "monster") ||
                      (userRole === "player" && cell.id === userCharacterId)
                      ? "grab"
                      : "not-allowed",
            }}
          />
        ))}
      </div>
    </div>
  );
}
