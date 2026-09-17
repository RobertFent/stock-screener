import { adrEmphasis, rsiTone, stochTone, toneClass, willrTone } from './tone';

describe('indicator tones', () => {
	it('treats oversold as bullish and overbought as bearish', () => {
		expect(rsiTone(12)).toBe('bullish');
		expect(rsiTone(50)).toBe('neutral');
		expect(rsiTone(82)).toBe('bearish');
	});

	it('handles the negative Williams %R range', () => {
		expect(willrTone(-95)).toBe('bullish');
		expect(willrTone(-50)).toBe('neutral');
		expect(willrTone(-5)).toBe('bearish');
	});

	it('bands the stochastic %K', () => {
		expect(stochTone(10)).toBe('bullish');
		expect(stochTone(50)).toBe('neutral');
		expect(stochTone(95)).toBe('bearish');
	});

	it('stays neutral for missing or non-finite values', () => {
		expect(rsiTone(null)).toBe('neutral');
		expect(stochTone(Number.NaN)).toBe('neutral');
	});

	it('emphasises a tradable daily range', () => {
		expect(adrEmphasis(5)).toContain('text-primary');
		expect(adrEmphasis(3.2)).toBe('text-foreground');
		expect(adrEmphasis(1)).toBe('text-muted-foreground');
		expect(adrEmphasis(null)).toBe('text-muted-foreground');
	});

	it('maps a tone onto a class', () => {
		expect(toneClass('bullish')).toBe('text-bullish');
	});
});
