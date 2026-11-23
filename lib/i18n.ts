"use client";

import { create } from "zustand";
import type { Locale } from "@/data/portfolio";

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

export const useI18n = create<I18nStore>((set) => ({
  locale: "es",
  setLocale: (locale) => set({ locale }),
  toggleLocale: () =>
    set((state) => ({ locale: state.locale === "es" ? "en" : "es" })),
}));

