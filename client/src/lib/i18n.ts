import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./locales/en";

// Tamakan is English-only. RTL/Arabic support has been removed.
i18n.use(initReactI18next).init({
  resources: { en },
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

document.documentElement.setAttribute("lang", "en");
document.documentElement.setAttribute("dir", "ltr");

export default i18n;
