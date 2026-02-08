import z from 'zod';

export const filtersFormSchema = z.object({
	name: z.string(),
	minVolume: z.string().optional(),
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
	stochasticsKAboveD: z.string().optional()
});
export type FilterFormInput = z.infer<typeof filtersFormSchema>;
