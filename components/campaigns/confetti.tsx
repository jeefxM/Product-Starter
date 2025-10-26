"use client";

import { useEffect, useState } from "react";

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speed: number;
  wobble: number;
}

export function Confetti() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const colors = [
      "#10b981", // green-500
      "#3b82f6", // blue-500
      "#8b5cf6", // purple-500
      "#f59e0b", // amber-500
      "#ef4444", // red-500
      "#ec4899", // pink-500
      "#06b6d4", // cyan-500
    ];

    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < 150; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100 - 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        speed: Math.random() * 3 + 2,
        wobble: Math.random() * 10 - 5,
      });
    }
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-fall"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            animation: `fall ${piece.speed}s linear infinite, wobble 2s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(calc(100vh + 100px)) rotate(720deg);
          }
        }
        @keyframes wobble {
          0%, 100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(${Math.random() * 40 - 20}px);
          }
        }
        .animate-fall {
          animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
      `}</style>
    </div>
  );
}