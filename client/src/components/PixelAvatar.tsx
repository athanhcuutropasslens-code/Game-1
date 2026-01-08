/**
 * PixelAvatar Component
 * Generates pixel art avatars using a seed value
 * Design: Retro Arcade Cyberpunk - simple pixelated style
 */

interface PixelAvatarProps {
  seed: number;
  size: number;
  type?: 'hero' | 'monster' | 'boss';
  isDead?: boolean;
}

export default function PixelAvatar({
  seed,
  size,
  type = 'hero',
  isDead = false,
}: PixelAvatarProps) {
  // Generate deterministic pixel pattern based on seed
  const generatePixels = (s: number) => {
    const pixels: boolean[][] = [];
    const gridSize = 8;

    for (let y = 0; y < gridSize; y++) {
      const row: boolean[] = [];
      for (let x = 0; x < gridSize; x++) {
        const hash = Math.sin(s + x * 12.9898 + y * 78.233) * 43758.5453;
        row.push((hash - Math.floor(hash)) > 0.5);
      }
      pixels.push(row);
    }
    return pixels;
  };

  const pixels = generatePixels(seed);
  const pixelSize = size / 8;

  const getColor = () => {
    if (isDead) return '#333333';
    switch (type) {
      case 'monster':
        return '#ff006e';
      case 'boss':
        return '#ff00ff';
      default:
        return '#00ff41';
    }
  };

  const backgroundColor = isDead ? '#1a1a1a' : '#0a0e27';
  const pixelColor = getColor();

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: 0,
        backgroundColor,
        border: `2px solid ${pixelColor}`,
        opacity: isDead ? 0.5 : 1,
        filter: isDead ? 'grayscale(1)' : 'none',
      }}
    >
      {pixels.map((row, y) =>
        row.map((isActive, x) => (
          <div
            key={`${x}-${y}`}
            style={{
              backgroundColor: isActive ? pixelColor : 'transparent',
              width: pixelSize,
              height: pixelSize,
              boxShadow: isActive ? `0 0 4px ${pixelColor}` : 'none',
            }}
          />
        ))
      )}
    </div>
  );
}
