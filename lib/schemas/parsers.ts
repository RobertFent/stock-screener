import { FilterFormInput } from './formSchemas';
import { FilterDBInput } from './databaseSchemas';

export const parseFilterFormToDBForm = (
	filter: FilterFormInput
): FilterDBInput => {
	return {
		name: filter.name,
		minVolume: toOptionalNumber(filter.minVolume),
		maxRSI: toOptionalNumber(filter.maxRSI),
		minIV: toOptionalNumber(filter.minIV),
		maxIV: toOptionalNumber(filter.maxIV),
		minWillr: toOptionalNumber(filter.minWillr),
		maxWillr: toOptionalNumber(filter.maxWillr),
		minStochK: toOptionalNumber(filter.minStochK),
		maxStochK: toOptionalNumber(filter.maxStochK),
		macdIncreasing: toOptionalCheckboxBoolean(filter.macdIncreasing),
		macdLineAboveSignal: toOptionalCheckboxBoolean(
			filter.macdLineAboveSignal
		),
		closeAboveEma20AboveEma50: toOptionalCheckboxBoolean(
			filter.closeAboveEma20AboveEma50
		),
		stochasticsKAboveD: toOptionalCheckboxBoolean(filter.stochasticsKAboveD)
	};
};

const toOptionalNumber = (value?: string): number | undefined => {
	if (value === undefined || value === '') {
		return undefined;
	}
	const number = Number(value);
	return Number.isNaN(number) ? undefined : number;
};

const toOptionalCheckboxBoolean = (value?: string): boolean | undefined => {
	if (value === undefined || value === '') {
		return undefined;
	}
	return value === 'on';
};
