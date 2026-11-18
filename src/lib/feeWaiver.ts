export const PARTICIPANT_FEE_WAIVER_COUNTRIES = [
  'Sri Lanka',
  'Nepal',
  'Bangladesh',
  'Maldives',
  'Bhutan',
  'Myanmar',
] as const;

export const FEE_WAIVER_COUNTRIES = PARTICIPANT_FEE_WAIVER_COUNTRIES;

export const OTHER_COUNTRIES_OPTION = 'Other country';

export function isParticipantFeeWaiverCountry(country: string): boolean {
  if (!country) return false;
  const normalizedCountry = country.trim().toLocaleLowerCase();
  return PARTICIPANT_FEE_WAIVER_COUNTRIES.some(
    (eligibleCountry) => eligibleCountry.toLocaleLowerCase() === normalizedCountry,
  );
}

export const isFeeWaiverCountry = isParticipantFeeWaiverCountry;

export function isParticipantCategory(category: string): boolean {
  if (!category) return false;
  return category.trim().toLocaleLowerCase() === 'participants only';
}

