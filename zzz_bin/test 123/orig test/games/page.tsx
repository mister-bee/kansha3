import { useState } from "react";
import CombinedCharacters from "./CombinedCharacters";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold text-blue-500">Games</h1>
      <CombinedCharacters />
    </main>
  );
}
