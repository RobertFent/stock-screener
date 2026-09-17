import z from 'zod';
import { SUPPORTED_INDEX_KEYS } from '../screener/constants';

const SupportedIndex = z.enum(SUPPORTED_INDEX_KEYS);

export const filtersDBSchema = z.object({
	name: z.string(),
	indices: z.array(SupportedIndex).optional(),
	minVolume: z.number().optional(),
	minClose: z.number().optional(),
	maxClose: z.number().optional(),
	minAdrPercent7: z.number().optional(),
	maxRSI4: z.number().optional(),
	maxRSI14: z.number().optional(),
	minIV: z.number().optional(),
	maxIV: z.number().optional(),
	minWillr4: z.number().optional(),
	maxWillr4: z.number().optional(),
	minWillr14: z.number().optional(),
	maxWillr14: z.number().optional(),
	minStochK: z.number().optional(),
	maxStochK: z.number().optional(),
	macdIncreasing: z.boolean().optional(),
	macdLineAboveSignal: z.boolean().optional(),
	closeAboveEma20AboveEma50: z.boolean().optional(),
	closeAboveMA200: z.boolean().optional(),
	stochasticsKAboveD: z.boolean().optional()
});
export type FilterDBInput = z.infer<typeof filtersDBSchema>;
