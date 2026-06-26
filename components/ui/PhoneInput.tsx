"use client";

import { useEffect, useId, useState } from "react";
import {
  DEFAULT_PHONE_COUNTRY,
  PHONE_COUNTRIES,
  buildFullPhone,
  formatNationalDisplay,
  normalizeNationalDigits,
  parseFullPhone,
} from "@/lib/phone";

type PhoneInputProps = {
  value: string;
  onChange: (fullPhone: string) => void;
  onCountryChange?: (countryCode: string) => void;
  className?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  compact?: boolean;
};

export function PhoneInput({
  value,
  onChange,
  onCountryChange,
  className = "",
  invalid = false,
  disabled = false,
  id,
  compact = false,
}: PhoneInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;

  const parsed = parseFullPhone(value);
  const [countryCode, setCountryCode] = useState(parsed.countryCode);
  const [nationalDigits, setNationalDigits] = useState(parsed.nationalDigits);

  useEffect(() => {
    const next = parseFullPhone(value);
    setCountryCode(next.countryCode);
    setNationalDigits(next.nationalDigits);
  }, [value]);

  const country = PHONE_COUNTRIES.find((c) => c.code === countryCode) ?? DEFAULT_PHONE_COUNTRY;

  function emit(code: string, digits: string) {
    onChange(buildFullPhone(code, digits));
  }

  function handleCountryChange(code: string) {
    setCountryCode(code);
    onCountryChange?.(code);
    emit(code, nationalDigits);
  }

  function handleNationalChange(raw: string) {
    const digits = normalizeNationalDigits(raw, countryCode);
    setNationalDigits(digits);
    emit(countryCode, digits);
  }

  const borderClass = invalid
    ? "border-red-500/50 focus-within:border-red-400 focus-within:ring-red-400/15"
    : "border-slate-200 focus-within:border-brand-gold/60 focus-within:ring-brand-gold/10 dark:border-white/10";

  const fieldPad = compact ? "py-3 sm:py-3.5" : "py-3.5 sm:py-4";
  const fieldText = compact ? "text-sm sm:text-base" : "text-base";

  return (
    <div
      className={`grid grid-cols-[30%_1fr] overflow-hidden rounded-2xl border bg-slate-50 transition-all duration-200 focus-within:bg-white focus-within:ring-4 dark:bg-white/[0.04] dark:focus-within:bg-white/[0.07] ${borderClass} ${className}`}
    >
      <div className="relative min-w-0 border-r border-slate-200 dark:border-white/10">
        <label htmlFor={`${inputId}-country`} className="sr-only">
          Indicatif pays
        </label>
        <select
          id={`${inputId}-country`}
          value={countryCode}
          disabled={disabled}
          onChange={(e) => handleCountryChange(e.target.value)}
          className={`w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent text-center ${fieldPad} pl-2 pr-7 ${fieldText} font-semibold text-slate-900 outline-none dark:text-white`}
        >
          {PHONE_COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.dial}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 dark:text-white/40">
          ▾
        </span>
      </div>

      <div className="relative min-w-0">
        <label htmlFor={inputId} className="sr-only">
          Numéro de téléphone
        </label>
        <input
          id={inputId}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          disabled={disabled}
          value={formatNationalDisplay(nationalDigits, countryCode)}
          onChange={(e) => handleNationalChange(e.target.value)}
          placeholder={country.placeholder}
          className={`w-full min-w-0 bg-transparent ${fieldPad} pl-3 pr-4 ${fieldText} text-slate-900 placeholder:text-slate-400 outline-none dark:text-white dark:placeholder:text-white/30`}
        />
      </div>
    </div>
  );
}
