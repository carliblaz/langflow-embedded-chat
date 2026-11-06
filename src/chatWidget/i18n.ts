import { useEffect, useState } from "react";

/**
 * Text options accept either a plain string or a JSON object keyed by language:
 *   welcome_message='{"en":"Hi!","sl":"Živjo!","de":"Hallo!"}'
 * Starter prompts accept the same per language, with an array (or "a|b") per key:
 *   starter_prompts='{"en":["Opening hours?"],"sl":["Delovni čas?"]}'
 */
export type Localizable<T> = T | Record<string, T>;

/** Language the widget should use: explicit `language`, else <html lang>, else the browser. */
function detectLanguage(explicit?: string): string {
  if (explicit && explicit.trim() !== "") return explicit.trim();
  const htmlLang = document.documentElement.getAttribute("lang");
  if (htmlLang && htmlLang.trim() !== "") return htmlLang.trim();
  return navigator.language || "en";
}

/**
 * Current language. Follows changes to <html lang> (sites that switch language
 * without a reload) unless `language` is set on the widget.
 */
export function useLanguage(explicit?: string): string {
  const [lang, setLang] = useState(() => detectLanguage(explicit));
  useEffect(() => {
    setLang(detectLanguage(explicit));
    if (explicit) return;
    const observer = new MutationObserver(() => setLang(detectLanguage()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    return () => observer.disconnect();
  }, [explicit]);
  return lang;
}

/** Parses a value that may be a JSON language map passed as an HTML attribute string. */
function asMap(value: unknown): Record<string, unknown> | null {
  let v = value;
  if (typeof v === "string") {
    const t = v.trim();
    if (!t.startsWith("{")) return null;
    try {
      v = JSON.parse(t);
    } catch {
      return null; // a plain string that happens to start with "{"
    }
  }
  if (v && typeof v === "object" && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

/**
 * Picks the entry for `lang`: exact match ("sl-SI"), then the base language
 * ("sl"), then `fallback`, then "en", then the first entry. Non-map values are
 * returned unchanged.
 */
export function pickLanguage<T>(value: unknown, lang: string, fallback?: string): T | undefined {
  const map = asMap(value);
  if (!map) return value as T | undefined;
  const keys = Object.keys(map);
  if (keys.length === 0) return undefined;
  const find = (wanted?: string) =>
    wanted ? keys.find((k) => k.toLowerCase() === wanted.toLowerCase()) : undefined;
  const base = lang.split(/[-_]/)[0];
  const key =
    find(lang) ??
    find(base) ??
    keys.find((k) => k.toLowerCase().split(/[-_]/)[0] === base.toLowerCase()) ??
    find(fallback) ??
    find("en") ??
    keys[0];
  return map[key] as T;
}
