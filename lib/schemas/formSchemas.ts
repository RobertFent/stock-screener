import z from 'zod';
import { SUPPORTED_INDEX_KEYS } from '../screener/constants';

const SupportedIndex = z.enum(SUPPORTED_INDEX_KEYS);

/**
 * `FormData` only carries strings, so every numeric bound arrives as a string
 * and every switch as `'on'` / absent. Conversion happens in
 * `lib/schemas/parsers.ts`.
 */
export const filtersFormSchema = z.object({
	// present when an existing preset is being updated
	id: z.string().optional(),
	name: z
		.string()
		.trim()
		.min(1, 'Please give the filter a name')
		.max(255, 'Filter name is too long'),
	// a single selected index arrives as a plain string, several as an array
	indices: z
		.union([SupportedIndex, z.array(SupportedIndex)])
		.optional()
		.transform((value) => {
			if (value === undefined) {
				return [];
			}
			return Array.isArray(value) ? value : [value];
		}),
	minVolume: z.string().optional(),
	minClose: z.string().optional(),
	maxClose: z.string().optional(),
	minAdrPercent7: z.string().optional(),
	maxRSI4: z.string().optional(),
	maxRSI14: z.string().optional(),
	minIV: z.string().optional(),
	maxIV: z.string().optional(),
	minWillr4: z.string().optional(),
	maxWillr4: z.string().optional(),
	minWillr14: z.string().optional(),
	maxWillr14: z.string().optional(),
	minStochK: z.string().optional(),
	maxStochK: z.string().optional(),
	macdIncreasing: z.string().optional(),
	macdLineAboveSignal: z.string().optional(),
	closeAboveEma20AboveEma50: z.string().optional(),
	closeAboveMA200: z.string().optional(),
	stochasticsKAboveD: z.string().optional()
});
export type FilterFormInput = z.infer<typeof filtersFormSchema>;
