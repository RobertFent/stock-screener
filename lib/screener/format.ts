const EM_DASH = '—';

/**
 * Turns a possibly `null`/`undefined`/`NaN` value into a number or `null`.
 * Postgres numerics arrive as strings, so string input is supported as well.
 */
export const toNumberOrNull = (
	value: string | number | null | undefined
): number | null => {
	if (value === null || value === undefined || value === '') {
		return null;
	}
	const parsed = typeof value === 'number' ? value : Number(value);
	return Number.isFinite(parsed) ? parsed : null;
};

/** Fixed decimal formatting that never renders `NaN` or `null`. */
export const formatNumber = (
	value: string | number | null | undefined,
	fractionDigits = 2
): string => {
	const parsed = toNumberOrNull(value);
	if (parsed === null) {
		return EM_DASH;
	}
	return parsed.toLocaleString('en-US', {
		minimumFractionDigits: fractionDigits,
		maximumFractionDigits: fractionDigits
	});
};

/** `1234567` -> `1.23M`. Used for volume, which is a bigint string. */
export const formatCompact = (
	value: string | number | null | undefined
): string => {
	const parsed = toNumberOrNull(value);
	if (parsed === null) {
		return EM_DASH;
	}
	return parsed.toLocaleString('en-US', {
		notation: 'compact',
		maximumFractionDigits: 2
	});
};

export const formatCurrency = (
	value: string | number | null | undefined,
	fractionDigits = 2
): string => {
	const parsed = toNumberOrNull(value);
	if (parsed === null) {
		return EM_DASH;
	}
	return `$${formatNumber(parsed, fractionDigits)}`;
};

export const formatPercent = (
	value: string | number | null | undefined,
	fractionDigits = 2
): string => {
	const parsed = toNumberOrNull(value);
	if (parsed === null) {
		return EM_DASH;
	}
	return `${formatNumber(parsed, fractionDigits)}%`;
};

/** `2026-09-16` -> `Wed, 16 Sep 2026`, invalid input -> em dash. */
export const formatDate = (value: string | null | undefined): string => {
	if (!value) {
		return EM_DASH;
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return EM_DASH;
	}
	return date.toLocaleDateString('en-GB', {
		weekday: 'short',
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
};

/**
 * Average Daily Range as a percentage of the closing price. Traders size
 * positions off this, so it is more useful than the raw dollar ADR.
 */
export const adrPercent = (
	adr: string | number | null | undefined,
	close: number | null | undefined
): number | null => {
	const parsedAdr = toNumberOrNull(adr);
	const parsedClose = toNumberOrNull(close);
	if (parsedAdr === null || parsedClose === null || parsedClose === 0) {
		return null;
	}
	return (parsedAdr / parsedClose) * 100;
};

export { EM_DASH };
