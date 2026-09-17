import {
	adrPercent,
	formatCompact,
	formatCurrency,
	formatDate,
	formatNumber,
	formatPercent,
	toNumberOrNull,
	EM_DASH
} from './format';

describe('toNumberOrNull', () => {
	it.each([null, undefined, '', 'abc', NaN])(
		'returns null for %p',
		(value) => {
			expect(toNumberOrNull(value as never)).toBeNull();
		}
	);

	it('parses numeric strings coming from postgres numerics', () => {
		expect(toNumberOrNull('3.50')).toBe(3.5);
		expect(toNumberOrNull(0)).toBe(0);
	});
});

describe('formatters', () => {
	it('never renders NaN', () => {
		expect(formatNumber(null)).toBe(EM_DASH);
		expect(formatCurrency(undefined)).toBe(EM_DASH);
		expect(formatPercent('abc')).toBe(EM_DASH);
		expect(formatCompact(null)).toBe(EM_DASH);
		expect(formatDate('not a date')).toBe(EM_DASH);
	});

	it('formats values for the results table', () => {
		expect(formatNumber(12.3456, 2)).toBe('12.35');
		expect(formatCurrency(1234.5)).toBe('$1,234.50');
		expect(formatPercent(-55.123, 1)).toBe('-55.1%');
		expect(formatCompact('12500000')).toBe('12.5M');
	});
});

describe('adrPercent', () => {
	it('expresses the average daily range relative to the close', () => {
		expect(adrPercent('3.5', 100)).toBeCloseTo(3.5);
	});

	it('returns null when data is missing or the close is zero', () => {
		expect(adrPercent(null, 100)).toBeNull();
		expect(adrPercent('3.5', 0)).toBeNull();
	});
});
