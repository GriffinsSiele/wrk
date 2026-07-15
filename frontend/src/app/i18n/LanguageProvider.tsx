"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import fr from "./locales/fr.json";
import es from "./locales/es.json";
import zh from "./locales/zh.json";

type Messages = typeof en;
export type Locale = "en" | "ar" | "fr" | "es" | "zh";
const DEFAULT_LOCALE: Locale = "en";
const RTL_LOCALES: Locale[] = ["ar"];
const SUPPORTED_LOCALES: Locale[] = ["en", "ar", "fr", "es", "zh"];

interface LanguageContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  supportedLocales: Locale[];
  t: (key: string) => string;
}

const locales: Record<Locale, Messages> = { en, ar, fr, es, zh };

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj) as string ?? path;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("locale", locale);
    }
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    if (!SUPPORTED_LOCALES.includes(nextLocale)) return;
    setLocaleState(nextLocale);
  }, []);

  const t = useCallback(
    (key: string) => getNestedValue(locales[locale] as unknown as Record<string, unknown>, key),
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, supportedLocales: SUPPORTED_LOCALES, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
