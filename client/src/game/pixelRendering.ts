const ALLOWED_BASE_SIZES = new Set([16, 32]);

export const getPixelPerfectSize = (baseSize: number, scale: number): number => {
  if (!ALLOWED_BASE_SIZES.has(baseSize)) {
    throw new Error(`Unsupported base size: ${baseSize}. Use 16 or 32.`);
  }

  if (!Number.isInteger(scale) || scale <= 0) {
    throw new Error(`Scale must be a positive integer. Received: ${scale}`);
  }

  return baseSize * scale;
};
