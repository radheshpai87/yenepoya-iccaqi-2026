export const PARTICIPANT_FEE_WAIVER_COUNTRIES = [
  'Sri Lanka',
  'Nepal',
  'Bangladesh',
  'Maldives',
  'Bhutan',
  'Myanmar',
] as const;

export const OTHER_COUNTRIES_OPTION = 'Other country';

export function isParticipantFeeWaiverCountry(country: string): boolean {
  const normalizedCountry = country.trim().toLocaleLowerCase();
  return PARTICIPANT_FEE_WAIVER_COUNTRIES.some(
    (eligibleCountry) => eligibleCountry.toLocaleLowerCase() === normalizedCountry,
  );
}

export function isParticipantCategory(category: string): boolean {
  return category.trim().toLocaleLowerCase() === 'participants only';
}
