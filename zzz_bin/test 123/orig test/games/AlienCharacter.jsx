"use client";

import React, { useState, useEffect, useCallback } from "react";

const AlienCharacter = ({
  width = 64,
  height = 64,
  bodyColor = "#8affb1",
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
        event.shiftKey &&
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
        <ellipse cx="32" cy="40" rx="20" ry="16" fill={bodyColor} />

        {/* Head */}
        <circle cx="32" cy="24" r="16" fill={bodyColor} />

        {/* Eyes */}
        <ellipse cx="24" cy="20" rx="4" ry="6" fill={eyeColor} />
        <ellipse cx="40" cy="20" rx="4" ry="6" fill={eyeColor} />

        {/* Antenna */}
        <line
          x1="28"
          y1="8"
          x2="24"
          y2="2"
          stroke={bodyColor}
          strokeWidth="2"
        />
        <line
          x1="36"
          y1="8"
          x2="40"
          y2="2"
          stroke={bodyColor}
          strokeWidth="2"
        />
        <circle cx="24" cy="2" r="2" fill={bodyColor} />
        <circle cx="40" cy="2" r="2" fill={bodyColor} />
      </svg>
    </div>
  );
};

export default AlienCharacter;
