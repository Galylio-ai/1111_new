export type PhoneCountry = {
  code: string;
  dial: string;
  name: string;
  flag: string;
  placeholder: string;
};

/** Tunisia first — default for 1111.tn */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { code: "TN", dial: "+216", name: "Tunisie", flag: "🇹🇳", placeholder: "20 123 456" },
  { code: "FR", dial: "+33", name: "France", flag: "🇫🇷", placeholder: "6 12 34 56 78" },
  { code: "DZ", dial: "+213", name: "Algérie", flag: "🇩🇿", placeholder: "551 23 45 67" },
  { code: "MA", dial: "+212", name: "Maroc", flag: "🇲🇦", placeholder: "612 34 56 78" },
  { code: "LY", dial: "+218", name: "Libye", flag: "🇱🇾", placeholder: "91 234 5678" },
  { code: "IT", dial: "+39", name: "Italie", flag: "🇮🇹", placeholder: "312 345 6789" },
  { code: "DE", dial: "+49", name: "Allemagne", flag: "🇩🇪", placeholder: "151 2345678" },
  { code: "GB", dial: "+44", name: "Royaume-Uni", flag: "🇬🇧", placeholder: "7911 123456" },
  { code: "US", dial: "+1", name: "États-Unis", flag: "🇺🇸", placeholder: "201 555 0123" },
  { code: "CA", dial: "+1", name: "Canada", flag: "🇨🇦", placeholder: "416 555 0123" },
  { code: "AE", dial: "+971", name: "Émirats", flag: "🇦🇪", placeholder: "50 123 4567" },
  { code: "SA", dial: "+966", name: "Arabie saoudite", flag: "🇸🇦", placeholder: "50 123 4567" },
  { code: "QA", dial: "+974", name: "Qatar", flag: "🇶🇦", placeholder: "3312 3456" },
  { code: "EG", dial: "+20", name: "Égypte", flag: "🇪🇬", placeholder: "100 123 4567" },
  { code: "TR", dial: "+90", name: "Turquie", flag: "🇹🇷", placeholder: "532 123 4567" },
];

export const DEFAULT_PHONE_COUNTRY = PHONE_COUNTRIES[0];

export const TUNISIAN_PHONE_RE = /^\+216[24579][0-9]{7}$/;

export function getPhoneCountry(code: string): PhoneCountry {
  return PHONE_COUNTRIES.find((c) => c.code === code) ?? DEFAULT_PHONE_COUNTRY;
}

export function normalizeNationalDigits(input: string, countryCode: string): string {
  let digits = input.replace(/\D/g, "");
  const country = getPhoneCountry(countryCode);

  if (country.code === "TN") {
    if (digits.startsWith("216") && digits.length > 3) digits = digits.slice(3);
    if (digits.startsWith("0")) digits = digits.slice(1);
    return digits.slice(0, 8);
  }

  if (digits.startsWith(country.dial.replace("+", ""))) {
    digits = digits.slice(country.dial.length - 1);
  }
  return digits;
}

export function formatNationalDisplay(digits: string, countryCode: string): string {
  if (!digits) return "";
  if (countryCode === "TN" && digits.length <= 8) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

export function buildFullPhone(countryCode: string, nationalDigits: string): string {
  const country = getPhoneCountry(countryCode);
  const digits = normalizeNationalDigits(nationalDigits, countryCode);
  if (!digits) return "";
  return `${country.dial}${digits}`;
}

export function parseFullPhone(full: string): { countryCode: string; nationalDigits: string } {
  const trimmed = full.trim();
  if (!trimmed) return { countryCode: DEFAULT_PHONE_COUNTRY.code, nationalDigits: "" };

  const normalized = trimmed.startsWith("+") ? trimmed : `+${trimmed.replace(/\D/g, "")}`;
  const sorted = [...PHONE_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const country of sorted) {
    if (normalized.startsWith(country.dial)) {
      return {
        countryCode: country.code,
        nationalDigits: normalized.slice(country.dial.length).replace(/\D/g, ""),
      };
    }
  }

  return {
    countryCode: DEFAULT_PHONE_COUNTRY.code,
    nationalDigits: normalized.replace(/\D/g, ""),
  };
}

export function isValidTunisianPhone(full: string): boolean {
  return TUNISIAN_PHONE_RE.test(full);
}

export function phoneValidationMessage(countryCode: string): string | null {
  if (countryCode !== "TN") {
    return "Inscription par téléphone disponible pour les numéros tunisiens (+216) uniquement.";
  }
  return null;
}
