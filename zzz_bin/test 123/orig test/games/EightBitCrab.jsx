"use client";

import React, { useState, useEffect, useCallback } from "react";

const EightBitCrab = ({
  width = 64,
  height = 64,
  bodyColor = "#ff6b6b",
  eyeColor = "black",
  containerWidth = 300,
  containerHeight = 300,
  step = 10,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const move = useCallback(
    (direction) => {
      setPosition((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        switch (direction) {
          case "ArrowUp":
            newY = Math.max(0, prev.y - step);
            break;
          case "ArrowDown":
            newY = Math.min(containerHeight - height, prev.y + step);
            break;
          case "ArrowLeft":
            newX = Math.max(0, prev.x - step);
            break;
          case "ArrowRight":
            newX = Math.min(containerWidth - width, prev.x + step);
            break;
          default:
            break;
        }

        return { x: newX, y: newY };
      });
    },
    [containerWidth, containerHeight, width, height, step]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        event.preventDefault();
        move(event.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [move]);

  return (
    <div
      style={{
        width: containerWidth,
        height: containerHeight,
        border: "1px solid black",
        position: "relative",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width={width}
        height={height}
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          transition: "all 0.1s",
        }}
      >
        {/* Body */}
        <rect x="16" y="24" width="32" height="24" fill={bodyColor} />

        {/* Eyes */}
        <rect x="20" y="28" width="4" height="4" fill={eyeColor} />
        <rect x="40" y="28" width="4" height="4" fill={eyeColor} />

        {/* Claws */}
        <rect x="8" y="32" width="8" height="8" fill={bodyColor} />
        <rect x="48" y="32" width="8" height="8" fill={bodyColor} />

        {/* Legs */}
        <rect x="16" y="48" width="4" height="8" fill={bodyColor} />
        <rect x="24" y="48" width="4" height="8" fill={bodyColor} />
        <rect x="36" y="48" width="4" height="8" fill={bodyColor} />
        <rect x="44" y="48" width="4" height="8" fill={bodyColor} />
      </svg>
    </div>
  );
};

export default EightBitCrab;
