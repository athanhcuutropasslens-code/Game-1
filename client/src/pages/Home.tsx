/**
 * Pixel Rogue - Home Page
 * Design: Retro Arcade Cyberpunk
 */

import Game from '@/components/Game';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center p-2 scanlines">
      <Game />
    </div>
  );
}
