// Lightweight i18n runtime for my-attorney.net
// Language is fixed per page-load (switching reloads the page), so translations
// resolve correctly whether a string is evaluated at module-load or during render.
import data from './translations.json'

export type Lang = 'he' | 'ar' | 'en' | 'ru'

const S: Record<string, Record<string, string>> = (data as any).strings
const T: Record<string, Record<string, string[]>> = (data as any).templates

export const LANGS: { code: Lang; label: string; dir: 'rtl' | 'ltr'; short: string }[] = [
  { code: 'he', label: 'עברית', dir: 'rtl', short: 'עב' },
  { code: 'ar', label: 'العربية', dir: 'rtl', short: 'ع' },
  { code: 'en', label: 'English', dir: 'ltr', short: 'EN' },
  { code: 'ru', label: 'Русский', dir: 'ltr', short: 'RU' },
]

export function dirFor(l: Lang): 'rtl' | 'ltr' {
  return l === 'he' || l === 'ar' ? 'rtl' : 'ltr'
}

function detectLang(): Lang {
  try {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('lang')
    if (q && ['he', 'ar', 'en', 'ru'].includes(q)) return q as Lang
    const saved = window.localStorage.getItem('site_lang')
    if (saved && ['he', 'ar', 'en', 'ru'].includes(saved)) return saved as Lang
  } catch {
    /* ignore */
  }
  return 'he'
}

let CUR: Lang = detectLang()

export function getLang(): Lang {
  return CUR
}

export function setLang(l: Lang) {
  try {
    window.localStorage.setItem('site_lang', l)
  } catch {
    /* ignore */
  }
  // Reload so all content (including module-scope data) renders in the new language.
  try {
    const url = new URL(window.location.href)
    url.searchParams.delete('lang')
    window.location.href = url.toString()
  } catch {
    window.location.reload()
  }
}

// Apply direction/lang to <html> as early as possible (runs at import time).
try {
  document.documentElement.setAttribute('lang', CUR)
  document.documentElement.setAttribute('dir', dirFor(CUR))
} catch {
  /* SSR / non-browser */
}

// Translate a plain UI/legal string. Falls back to the Hebrew source.
export function t(he: string): string {
  if (CUR === 'he') return he
  const table = S[CUR]
  const v = table ? table[he] : undefined
  return v == null ? he : v
}

// Translate a template literal. Called as tt([quasi0, quasi1, ...], expr0, expr1, ...)
export function tt(quasis: string[], ...exprs: any[]): string {
  let parts = quasis
  if (CUR !== 'he') {
    const key = quasis.join('￿')
    const table = T[CUR]
    const tr = table ? table[key] : undefined
    if (tr && tr.length === quasis.length) parts = tr
  }
  let out = ''
  for (let i = 0; i < parts.length; i++) {
    out += parts[i]
    if (i < exprs.length) out += exprs[i] == null ? '' : String(exprs[i])
  }
  return out
}
