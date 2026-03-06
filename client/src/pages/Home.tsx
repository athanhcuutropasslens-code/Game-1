/**
 * Pixel Rogue - Home Page
 * Design: Retro Arcade Cyberpunk
 */

import Game from '@/components/Game';
import { PIXEL_THEME } from '@/lib/pixelTheme';

export default function Home() {
  return (
    <div
      className={`min-h-screen flex items-center justify-center p-2 ${PIXEL_THEME.fx.scanlineClass}`}
      style={{ backgroundColor: PIXEL_THEME.palette.void900 }}
    >
      <Game />
    </div>
  );
}
