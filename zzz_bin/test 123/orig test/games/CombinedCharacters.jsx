"use client";

import React, { useState, useEffect, useCallback } from "react";

const EightBitCrab = ({
  x,
  y,
  width,
  height,
  bodyColor,
  eyeColor,
  isJumping,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width={width}
    height={height}
    style={{
      position: "absolute",
      left: x,
      top: y,
      transition: "all 0.1s",
      animation: isJumping ? "jump 0.5s ease infinite" : "none",
    }}
  >
    <rect x="16" y="24" width="32" height="24" fill={bodyColor} />
    <rect x="20" y="28" width="4" height="4" fill={eyeColor} />
    <rect x="40" y="28" width="4" height="4" fill={eyeColor} />
    <rect x="8" y="32" width="8" height="8" fill={bodyColor} />
    <rect x="48" y="32" width="8" height="8" fill={bodyColor} />
    <rect x="16" y="48" width="4" height="8" fill={bodyColor} />
    <rect x="24" y="48" width="4" height="8" fill={bodyColor} />
    <rect x="36" y="48" width="4" height="8" fill={bodyColor} />
    <rect x="44" y="48" width="4" height="8" fill={bodyColor} />
    <style>{`
      @keyframes jump {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
    `}</style>
  </svg>
);

const AlienCharacter = ({
  x,
  y,
  width,
  height,
  bodyColor,
  eyeColor,
  isDisappearing,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    width={width}
    height={height}
    style={{
      position: "absolute",
      left: x,
      top: y,
      transition: "all 0.1s",
      transform: isDisappearing ? "scale(0)" : "scale(1)",
      opacity: isDisappearing ? 0 : 1,
    }}
  >
    <ellipse cx="32" cy="40" rx="20" ry="16" fill={bodyColor} />
    <circle cx="32" cy="24" r="16" fill={bodyColor} />
    <ellipse cx="24" cy="20" rx="4" ry="6" fill={eyeColor} />
    <ellipse cx="40" cy="20" rx="4" ry="6" fill={eyeColor} />
    <line x1="28" y1="8" x2="24" y2="2" stroke={bodyColor} strokeWidth="2" />
    <line x1="36" y1="8" x2="40" y2="2" stroke={bodyColor} strokeWidth="2" />
    <circle cx="24" cy="2" r="2" fill={bodyColor} />
    <circle cx="40" cy="2" r="2" fill={bodyColor} />
  </svg>
);

const CombinedCharacters = ({
  containerWidth = 600,
  containerHeight = 400,
  characterSize = 64,
  crabStep = 10,
}) => {
  const [crabPosition, setCrabPosition] = useState({ x: 0, y: 0 });
  const [alienPosition, setAlienPosition] = useState({
    x: containerWidth / 2,
    y: containerHeight / 2,
  });
  const [isAlienAlive, setIsAlienAlive] = useState(true);
  const [isCrabJumping, setIsCrabJumping] = useState(false);
  const [isAlienDisappearing, setIsAlienDisappearing] = useState(false);

  const moveCrab = useCallback(
    (direction) => {
      setCrabPosition((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        switch (direction) {
          case "ArrowUp":
            newY = Math.max(0, prev.y - crabStep);
            break;
          case "ArrowDown":
            newY = Math.min(containerHeight - characterSize, prev.y + crabStep);
            break;
          case "ArrowLeft":
            newX = Math.max(0, prev.x - crabStep);
            break;
          case "ArrowRight":
            newX = Math.min(containerWidth - characterSize, prev.x + crabStep);
            break;
          default:
            break;
        }

        return { x: newX, y: newY };
      });
    },
    [containerWidth, containerHeight, characterSize, crabStep]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)
      ) {
        event.preventDefault();
        moveCrab(event.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [moveCrab]);

  useEffect(() => {
    const moveAlien = () => {
      if (!isAlienAlive) return;

      setAlienPosition((prev) => {
        const maxStep = 150;
        const newX = Math.max(
          0,
          Math.min(
            containerWidth - characterSize,
            prev.x + (Math.random() - 0.5) * maxStep
          )
        );
        const newY = Math.max(
          0,
          Math.min(
            containerHeight - characterSize,
            prev.y + (Math.random() - 0.5) * maxStep
          )
        );
        return { x: newX, y: newY };
      });
    };

    const intervalId = setInterval(moveAlien, 400);

    return () => clearInterval(intervalId);
  }, [containerWidth, containerHeight, characterSize, isAlienAlive]);

  useEffect(() => {
    const checkCollision = () => {
      const crabCenterX = crabPosition.x + characterSize / 2;
      const crabCenterY = crabPosition.y + characterSize / 2;
      const alienCenterX = alienPosition.x + characterSize / 2;
      const alienCenterY = alienPosition.y + characterSize / 2;

      const distance = Math.sqrt(
        Math.pow(crabCenterX - alienCenterX, 2) +
          Math.pow(crabCenterY - alienCenterY, 2)
      );

      if (distance < characterSize && isAlienAlive) {
        setIsAlienDisappearing(true);
        setIsCrabJumping(true);
        setTimeout(() => {
          setIsAlienAlive(false);
          setIsCrabJumping(false);
        }, 1000);
      }
    };

    checkCollision();
  }, [crabPosition, alienPosition, characterSize, isAlienAlive]);

  return (
    <div
      style={{
        width: containerWidth,
        height: containerHeight,
        border: "1px solid black",
        position: "relative",
      }}
    >
      <EightBitCrab
        x={crabPosition.x}
        y={crabPosition.y}
        width={characterSize}
        height={characterSize}
        bodyColor="#ff9999"
        eyeColor="#333333"
        isJumping={isCrabJumping}
      />
      {isAlienAlive && (
        <AlienCharacter
          x={alienPosition.x}
          y={alienPosition.y}
          width={characterSize}
          height={characterSize}
          bodyColor="#8affb1"
          eyeColor="#333333"
          isDisappearing={isAlienDisappearing}
        />
      )}
    </div>
  );
};

export default CombinedCharacters;
