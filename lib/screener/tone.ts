/**
 * Maps an indicator value onto a colour class.
 *
 * The convention is opportunity based, which is how these oscillators are read
 * in practice: oversold readings get the bullish colour (a long candidate),
 * overbought readings the bearish one. Everything in between stays neutral so
 * the table does not turn into a rainbow.
 */
export type Tone = 'bullish' | 'bearish' | 'neutral';

export const TONE_CLASS: Record<Tone, string> = {
	bullish: 'text-bullish',
	bearish: 'text-bearish',
	neutral: 'text-foreground'
};

const band = (value: number | null, lower: number, upper: number): Tone => {
	if (value === null || !Number.isFinite(value)) {
		return 'neutral';
	}
	if (value <= lower) {
		return 'bullish';
	}
	if (value >= upper) {
		return 'bearish';
	}
	return 'neutral';
};

/** RSI: <= 30 oversold, >= 70 overbought. */
export const rsiTone = (value: number | null): Tone => {
	return band(value, 30, 70);
};

/** Williams %R runs from -100 (oversold) to 0 (overbought). */
export const willrTone = (value: number | null): Tone => {
	return band(value, -80, -20);
};

/** Stochastic %K: <= 20 oversold, >= 80 overbought. */
export const stochTone = (value: number | null): Tone => {
	return band(value, 20, 80);
};

/**
 * ADR% is not directional - it is a tradability floor. Anything from 3% is
 * usually enough daily range to work with, so it is emphasised rather than
 * coloured by direction.
 */
export const adrEmphasis = (value: number | null): string => {
	if (value === null || !Number.isFinite(value)) {
		return 'text-muted-foreground';
	}
	if (value >= 4) {
		return 'text-primary font-medium';
	}
	if (value >= 3) {
		return 'text-foreground';
	}
	return 'text-muted-foreground';
};

export const toneClass = (tone: Tone): string => {
	return TONE_CLASS[tone];
};
