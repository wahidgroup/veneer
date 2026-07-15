interface RgbColor {
	r: number;
	g: number;
	b: number;
}

interface HsvColor {
	h: number;
	s: number;
	v: number;
}

function clampChannel(value: number, min: number, max: number): number {
	if (value < min) {
		return min;
	}
	if (value > max) {
		return max;
	}

	return value;
}

function channelToHex(channel: number): string {
	const clamped = Math.round(clampChannel(channel, 0, 255));
	return clamped.toString(16).padStart(2, "0");
}

/**
 * Convert RGB channels (0–255) to `#` + six hex digits.
 */
function rgbToHex({ r, g, b }: RgbColor): string {
	return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
}

/**
 * Parse 3- or 6-digit hex (optional leading #). Returns null when invalid.
 */
function hexToRgb(input: string): RgbColor | null {
	const trimmed = input.trim();
	let hex = trimmed;
	if (trimmed.startsWith("#")) {
		hex = trimmed.slice(1);
	}

	let full = hex;
	if (hex.length === 3) {
		const a = hex[0];
		const b = hex[1];
		const c = hex[2];
		if (a === undefined || b === undefined || c === undefined) {
			return null;
		}
		full = `${a}${a}${b}${b}${c}${c}`;
	}

	if (full.length !== 6) {
		return null;
	}
	if (!/^[0-9a-fA-F]{6}$/.test(full)) {
		return null;
	}

	const r = Number.parseInt(full.slice(0, 2), 16);
	const g = Number.parseInt(full.slice(2, 4), 16);
	const b = Number.parseInt(full.slice(4, 6), 16);
	if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
		return null;
	}

	return { r, g, b };
}

/**
 * Normalize hex to lowercase six-digit form with `#`, or null when invalid.
 */
function normalizeHex(input: string): string | null {
	const rgb = hexToRgb(input);
	if (rgb === null) {
		return null;
	}

	return rgbToHex(rgb);
}

/**
 * RGB (0–255) -> HSV. Hue in degrees [0, 360), s/v in [0, 1].
 */
function rgbToHsv({ r, g, b }: RgbColor): HsvColor {
	const rn = clampChannel(r, 0, 255) / 255;
	const gn = clampChannel(g, 0, 255) / 255;
	const bn = clampChannel(b, 0, 255) / 255;

	const max = Math.max(rn, gn, bn);
	const min = Math.min(rn, gn, bn);
	const delta = max - min;

	let h = 0;
	if (delta !== 0) {
		if (max === rn) {
			h = 60 * (((gn - bn) / delta) % 6);
		} else if (max === gn) {
			h = 60 * ((bn - rn) / delta + 2);
		} else {
			h = 60 * ((rn - gn) / delta + 4);
		}
	}
	if (h < 0) {
		h += 360;
	}

	let s = 0;
	if (max !== 0) {
		s = delta / max;
	}

	return { h, s, v: max };
}

/**
 * HSV -> RGB (0–255). Hue degrees [0, 360), s/v in [0, 1].
 */
function hsvToRgb({ h, s, v }: HsvColor): RgbColor {
	const hue = ((h % 360) + 360) % 360;
	const sat = clampChannel(s, 0, 1);
	const val = clampChannel(v, 0, 1);

	const c = val * sat;
	const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
	const m = val - c;

	let rp = 0;
	let gp = 0;
	let bp = 0;
	if (hue < 60) {
		rp = c;
		gp = x;
	} else if (hue < 120) {
		rp = x;
		gp = c;
	} else if (hue < 180) {
		gp = c;
		bp = x;
	} else if (hue < 240) {
		gp = x;
		bp = c;
	} else if (hue < 300) {
		rp = x;
		bp = c;
	} else {
		rp = c;
		bp = x;
	}

	return {
		r: Math.round((rp + m) * 255),
		g: Math.round((gp + m) * 255),
		b: Math.round((bp + m) * 255),
	};
}

function hsvToHex(hsv: HsvColor): string {
	return rgbToHex(hsvToRgb(hsv));
}

function hexToHsv(input: string): HsvColor | null {
	const rgb = hexToRgb(input);
	if (rgb === null) {
		return null;
	}

	return rgbToHsv(rgb);
}

export type { HsvColor, RgbColor };
export {
	clampChannel,
	hexToHsv,
	hexToRgb,
	hsvToHex,
	hsvToRgb,
	normalizeHex,
	rgbToHex,
	rgbToHsv,
};
