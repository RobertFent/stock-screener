import { filtersFormSchema } from './formSchemas';
import { parseFilterFormToDBForm } from './parsers';

const baseForm = { name: 'preset', indices: ['sp100' as const] };

describe('filtersFormSchema', () => {
	it('accepts a single index sent as a plain string', () => {
		const result = filtersFormSchema.parse({
			name: 'preset',
			indices: 'sp500'
		});
		expect(result.indices).toEqual(['sp500']);
	});

	it('accepts several indices', () => {
		const result = filtersFormSchema.parse({
			name: 'preset',
			indices: ['sp100', 'nasdaq100']
		});
		expect(result.indices).toEqual(['sp100', 'nasdaq100']);
	});

	it('defaults to no index when the field is missing', () => {
		expect(filtersFormSchema.parse({ name: 'preset' }).indices).toEqual([]);
	});

	it('rejects an empty name', () => {
		expect(filtersFormSchema.safeParse({ name: '   ' }).success).toBe(
			false
		);
	});
});

describe('parseFilterFormToDBForm', () => {
	it('converts numeric strings and leaves blanks undefined', () => {
		const parsed = parseFilterFormToDBForm({
			...baseForm,
			maxRSI4: '30',
			minAdrPercent7: '3.5',
			maxRSI14: '',
			minIV: 'abc'
		});

		expect(parsed.maxRSI4).toBe(30);
		expect(parsed.minAdrPercent7).toBe(3.5);
		expect(parsed.maxRSI14).toBeUndefined();
		expect(parsed.minIV).toBeUndefined();
	});

	it('maps checkbox values onto booleans', () => {
		const parsed = parseFilterFormToDBForm({
			...baseForm,
			closeAboveMA200: 'on'
		});
		expect(parsed.closeAboveMA200).toBe(true);
		expect(parsed.macdIncreasing).toBeUndefined();
	});
});
