function roundToOneDecimal(value) {
	return parseFloat(value.toFixed(1));
}

export function calculateMean(estimates) {
	return roundToOneDecimal(estimates.reduce((sum, value) => sum + value, 0) / estimates.length);
}

export function calculateMedian(estimates) {
	estimates.sort((a, b) => a - b);
	const mid = Math.floor(estimates.length / 2);
	return estimates.length % 2 === 0
		? (estimates[mid - 1] + estimates[mid]) / 2
		: estimates[mid];
}