import type { MoveDefinition } from "@/lib/gameTypes";

export const MOVES: Record<"ROCK" | "PAPER" | "SCISSORS", MoveDefinition> = {
  ROCK: {
    id: "rock",
    name: "Búa",
    icon: "✊",
    beats: "scissors",
    color: "text-orange-500",
  },
  PAPER: {
    id: "paper",
    name: "Bao",
    icon: "✋",
    beats: "rock",
    color: "text-green-500",
  },
  SCISSORS: {
    id: "scissors",
    name: "Kéo",
    icon: "✌️",
    beats: "paper",
    color: "text-blue-500",
  },
};
