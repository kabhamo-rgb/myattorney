import express from 'express'
import cors from 'cors'
import multer from 'multer'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/* ------------------------------------------------------------------ *
 * MyAttorney / קו-הדין — Unified backend
 * Merges Version A (back-office: leads, calendar, hearings, tasks,
 * staff auth, settings, audit) with Version B (public site + client
 * portal: documents, dispatches). Single deployable Node service that
 * also serves the built frontend.
 * ------------------------------------------------------------------ */

// DATA_DIR lets a single persistent volume (e.g. Railway/Docker) hold both the
// JSON store and uploaded files. Falls back to the server folder for local dev.
const persistBase = process.env.DATA_DIR || __dirname
const dataDir = path.join(persistBase, 'data')
const uploadsDirPath = path.join(persistBase, 'uploads')
const frontendDist = path.join(__dirname, '..', 'app', 'dist')

for (const dir of [dataDir, uploadsDirPath]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

const files = {
  leads: path.join(dataDir, 'leads.json'),
  events: path.join(dataDir, 'events.json'),
  hearings: path.join(dataDir, 'hearings.json'),
  tasks: path.join(dataDir, 'tasks.json'),
  settings: path.join(dataDir, 'settings.json'),
  staffUsers: path.join(dataDir, 'staff-users.json'),
  documents: path.join(dataDir, 'documents.json'),
  dispatches: path.join(dataDir, 'dispatches.json'),
  audit: path.join(dataDir, 'audit-log.json'),
}

/* ------------------------------ ids ------------------------------- */
function genId(prefix = 'id') {
  return `${prefix}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
}

// One-way, salted PIN hash (replaces the old reversible base64 scheme).
const PIN_PEPPER = process.env.PIN_SALT || process.env.SESSION_SECRET || 'mya-pepper-v1'
const hashPin = (pin) => crypto.createHash('sha256').update(`${PIN_PEPPER}:${String(pin)}`).digest('hex')

/* ----------------------------- storage ---------------------------- */
const readJson = (filePath, fallback) => {
  if (!fs.existsSync(filePath)) return fallback
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const writeJson = (filePath, value) => {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf8')
}

const load = (key, fallback = []) => readJson(files[key], fallback)
const save = (key, value) => writeJson(files[key], value)

/* --------------------------- seed data ---------------------------- */
// Derived from lawofficebackup20260729.json so continuity is preserved.
const seedIfMissing = () => {
  if (!fs.existsSync(files.leads)) {
    save('leads', [
      { id: genId('lead'), name: 'דניאל מזרחי', phone: '0501234567', email: '', topic: 'הוצאה לפועל', urgency: 'גבוהה (עד 24 שעות)', message: 'קיבלתי אזהרה בהוצאה לפועל וצריך ייצוג דחוף.', status: 'active', owner: 'עו"ד יעל שלו', source: 'ייבוא', createdAt: '2026-07-29T01:29:42.550Z' },
      { id: genId('lead'), name: 'עדי כהן', phone: '050-5551234', email: '', topic: 'הוצאה לפועל', urgency: 'גבוהה', message: '', status: 'new', owner: 'עו"ד נועה ברק', source: 'ייבוא', createdAt: '2026-07-29T01:27:58.799Z' },
      { id: genId('lead'), name: 'רון לוי', phone: '052-7778844', email: '', topic: 'דיני עבודה', urgency: 'רגילה', message: '', status: 'active', owner: 'עו"ד תום אדר', source: 'ייבוא', createdAt: '2026-07-29T01:27:58.799Z' },
      { id: genId('lead'), name: 'אורית פרץ', phone: '053-4123412', email: '', topic: 'ליטיגציה אזרחית', urgency: 'רגילה', message: '', status: 'booked', owner: 'עו"ד יעל שלו', source: 'ייבוא', createdAt: '2026-07-29T01:27:58.799Z' },
    ])
  }

  if (!fs.existsSync(files.events)) {
    save('events', [
      { id: genId('evt'), title: 'הגשת התנגדות - תיק 22991', date: '2026-07-30', type: 'הגשה', done: false },
      { id: genId('evt'), title: 'דיון קדם משפט - ת"א 48231', date: '2026-08-04', type: 'דיון', done: false },
    ])
  }

  if (!fs.existsSync(files.hearings)) {
    save('hearings', [
      {
        id: genId('hrg'),
        caseRef: 'תא 55321-11-26 מזרחי נגד בנק',
        date: '2026-08-12',
        court: 'מחוזי',
        docs: [
          { name: 'טיוטת טיעון', ok: false },
          { name: 'נספחים', ok: false },
          { name: 'אימות לקוח', ok: false },
        ],
      },
    ])
  }

  if (!fs.existsSync(files.tasks)) save('tasks', [])

  if (!fs.existsSync(files.settings)) {
    save('settings', {
      officeName: 'משרד עו"ד קו-הדין',
      brandName: 'MyAttorney',
      alertDays: 5,
      notificationsEnabled: false,
      dailyDigestEnabled: true,
      autoLockMinutes: 15,
      sessionMinutes: 480,
      reportSignature: '',
      reportLogoUrl: '',
      contactEmail: 'hello@myattorney.co',
      contactPhone: '+972 54 000 0000',
    })
  }

  if (!fs.existsSync(files.staffUsers)) {
    // No known default PIN. Use ADMIN_PIN if provided, otherwise generate a random one
    // (printed to the server log once) so there is never a guessable admin/1234 fallback.
    const seedPin = process.env.ADMIN_PIN || crypto.randomBytes(6).toString('hex')
    if (!process.env.ADMIN_PIN) console.warn('[security] No ADMIN_PIN set — generated random admin PIN:', seedPin)
    save('staffUsers', [
      { username: 'admin', role: 'admin', displayName: 'מנהל משרד', pinHash: hashPin(seedPin), failCount: 0, lockUntil: 0 },
    ])
  }
}

/* ----------------------------- audit ------------------------------ */
const appendAudit = (entry) => {
  const current = load('audit', [])
  const next = {
    id: genId('audit'),
    occurredAt: new Date().toISOString(),
    ...entry,
  }
  save('audit', [next, ...current].slice(0, 2000))
  return next
}

/* --------------------------- staff auth --------------------------- */
const sessions = new Map() // token -> { username, role, displayName, expiresAt }

const createSession = (user, sessionMinutes) => {
  const token = crypto.randomBytes(24).toString('hex')
  const expiresAt = Date.now() + Math.max(5, Number(sessionMinutes) || 480) * 60 * 1000
  sessions.set(token, { username: user.username, role: user.role, displayName: user.displayName, expiresAt })
  return { token, expiresAt }
}

const getSession = (req) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null
  const session = sessions.get(token)
  if (!session) return null
  if (session.expiresAt < Date.now()) {
    sessions.delete(token)
    return null
  }
  return { token, ...session }
}

const requireStaff = (req, res, next) => {
  const session = getSession(req)
  if (!session) {
    res.status(401).json({ error: 'לא מחובר' })
    return
  }
  req.staff = session
  next()
}

/* ----------------------------- app -------------------------------- */
seedIfMissing()

// Set/rotate the admin PIN from an env var (Railway Variable ADMIN_PIN) without
// editing files. Re-applied on every boot, so changing the variable changes the PIN.
if (process.env.ADMIN_PIN) {
  const users = load('staffUsers', [])
  const admin = users.find((u) => u.username === 'admin')
  if (admin) {
    admin.pinHash = hashPin(process.env.ADMIN_PIN)
    admin.failCount = 0
    admin.lockUntil = 0
    save('staffUsers', users)
  }
}

const app = express()
const port = process.env.PORT || 4000

app.use(cors())

// Stripe webhook — MUST receive the raw body, so it is registered before express.json().
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return res.status(200).end()
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(key)
    const whsec = process.env.STRIPE_WEBHOOK_SECRET
    let event
    if (whsec) {
      event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], whsec)
    } else {
      event = JSON.parse(req.body.toString('utf8'))
    }
    if (event.type === 'checkout.session.completed') {
      let s = event.data.object || {}
      // Thin/partial payloads: fetch the full session so we have email/amount/metadata.
      if ((!s.customer_details || s.amount_total == null) && s.id) {
        try { s = await stripe.checkout.sessions.retrieve(s.id) } catch { /* keep partial */ }
      }
      const email = (s.customer_details && s.customer_details.email) || ''
      const name = (s.customer_details && s.customer_details.name) || ''
      const amount = (s.amount_total || 0) / 100
      const desc = (s.metadata && s.metadata.itemName) || 'תשלום עבור שירות'
      appendAudit({ area: 'payments', action: 'payment_completed', actor: 'public', detail: `${desc} | ₪${amount} | ${email}` })
      const lead = {
        id: genId('pay'), type: 'payment', name: name || email || 'תשלום', email, phone: '',
        topic: 'תשלום טפסים', message: `${desc} · ₪${amount}`, amount, status: 'new', source: 'תשלום', createdAt: new Date().toISOString(),
      }
      const cur = load('leads', [])
      save('leads', [lead, ...cur])
      const inv = await issueInvoice({ name, email, amount, description: desc })
      if (inv && inv.docId) appendAudit({ area: 'payments', action: 'invoice_issued', actor: 'system', detail: `${desc} | ${inv.docId}`, refId: lead.id })
      if (email) {
        sendEmail(email, 'אישור תשלום וחשבונית — משרד עורכי דין מוחמד קבהא',
          `<div dir="rtl" style="font-family:Arial"><h3>שלום ${escapeHtml(name || '')},</h3>
          <p>קיבלנו את תשלומך על סך ₪${amount} עבור: ${escapeHtml(desc)}.</p>
          ${inv && inv.url ? `<p><b>חשבונית/קבלה:</b> <a href="${inv.url}">${inv.url}</a></p>` : '<p>חשבונית מס/קבלה תישלח אליך בנפרד.</p>'}
          <p>תודה,<br>משרד עורכי דין מוחמד מ. קבהא · מ.ר 67912 · 052-661-1866</p></div>`).catch(() => {})
      }
    }
    res.json({ received: true })
  } catch (e) {
    res.status(400).send(`Webhook Error: ${String(e?.message || e).slice(0, 120)}`)
  }
})

app.use(express.json({ limit: '2mb' }))
app.use('/uploads', express.static(uploadsDirPath))

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDirPath),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${Date.now()}-${safeName}`)
  },
})
const upload = multer({ storage })

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'myattorney-unified' }))

// Google Search Console site verification (served directly — robust to file-name issues).
app.get('/googlee0d6249170549ef6.html', (_req, res) =>
  res.type('text/html').send('google-site-verification: googlee0d6249170549ef6.html'),
)

// Diagnostic: which AI provider is configured (never exposes the key).
app.get('/api/ai-status', (_req, res) => {
  const provider = process.env.GEMINI_API_KEY
    ? 'gemini'
    : process.env.ANTHROPIC_API_KEY
      ? 'anthropic'
      : process.env.OPENAI_API_KEY
        ? 'openai'
        : 'none'
  const model =
    provider === 'gemini'
      ? process.env.GEMINI_MODEL || 'gemini-2.0-flash'
      : provider === 'anthropic'
        ? process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest'
        : provider === 'openai'
          ? process.env.OPENAI_MODEL || 'gpt-4o-mini'
          : null
  res.json({ aiEnabled: provider !== 'none', provider, model })
})

// Diagnostic: run one live LLM call in the BACKGROUND (avoids client timeout).
// GET ?run=1 starts it; GET with no param returns the last stored result.
let lastAiTest = null
app.get('/api/ai-test', (req, res) => {
  if (req.query.run === '1') {
    lastAiTest = { pending: true, startedAt: new Date().toISOString() }
    ;(async () => {
      const result = await callLLM(
        'אתה עוזר משפטי בישראל. החזר JSON תקין בלבד.',
        'שאלה: קיבלתי עיקול בהוצאה לפועל ונגבה יותר מדי — מה לעשות? החזר {"caseDecoding":"...","legalAnalysis":"...","steps":["..."],"remedies":["..."],"riskLevel":"בינוני","disclaimer":"..."}',
      )
      const parsedOk = !!parseJsonLoose(result.text)
      lastAiTest = {
        ok: !!result.text,
        provider: result.provider || null,
        model: result.model || null,
        error: result.error || null,
        status: result.status || null,
        detail: result.detail ? String(result.detail).slice(0, 300) : null,
        parsedOk,
        textLen: result.text ? String(result.text).length : 0,
        textSnippet: result.text ? String(result.text).slice(0, 500) : null,
        finishedAt: new Date().toISOString(),
      }
    })()
    res.json({ started: true, note: 'קרא שוב /api/ai-test (בלי run) בעוד ~15 שניות' })
    return
  }
  res.json({ last: lastAiTest || { note: 'עדיין לא הורץ — קרא עם ?run=1' } })
})

/* ===================== PUBLIC: leads (contact) ==================== */
app.post('/api/leads', (req, res) => {
  const { name, phone, email, topic, urgency, message } = req.body || {}
  if (!name || !(phone || email)) {
    res.status(400).json({ error: 'נדרש שם וטלפון או דוא"ל' })
    return
  }
  const lead = {
    id: genId('lead'),
    name: String(name).trim(),
    phone: String(phone || '').trim(),
    email: String(email || '').trim(),
    topic: String(topic || 'כללי').trim(),
    urgency: String(urgency || 'רגילה').trim(),
    message: String(message || '').trim(),
    status: 'new',
    owner: '',
    source: 'אתר',
    createdAt: new Date().toISOString(),
  }
  const current = load('leads', [])
  save('leads', [lead, ...current])
  appendAudit({ area: 'leads', action: 'lead_created', actor: 'public', detail: `${lead.name} | ${lead.topic}`, refId: lead.id })
  res.status(201).json({ success: true, lead })
})

/* ===================== PUBLIC: AI legal analysis ================ */
// Real "decoding": extracts document text, sends it to Claude grounded on free
// public sources, returns a targeted non-binding analysis + steps + remedies.
const uploadMem = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } })

const extractDocText = async (file, providedText) => {
  if (providedText && String(providedText).trim()) return String(providedText).trim()
  if (!file || !file.buffer) return ''
  const name = (file.originalname || '').toLowerCase()
  const mime = file.mimetype || ''
  try {
    if (name.endsWith('.txt') || name.endsWith('.md') || mime.startsWith('text/')) return file.buffer.toString('utf8')
    if (name.endsWith('.pdf') || mime === 'application/pdf') {
      const pdf = (await import('pdf-parse/lib/pdf-parse.js')).default
      const data = await pdf(file.buffer)
      return data.text || ''
    }
    if (name.endsWith('.docx')) {
      const mammoth = await import('mammoth')
      const r = await mammoth.extractRawText({ buffer: file.buffer })
      return r.value || ''
    }
  } catch {
    return ''
  }
  return ''
}

// ===== Legal source registry (multi-source) — "automation proposes, a lawyer decides" =====
// Free official/public sources are enabled and citable. Commercial databases (Nevo, Takdin)
// require a paid license + API key, so they are kept as disabled ADAPTER SEAMS until licensed.
// To connect a real source, implement fetchLegalSource() against its authorized API. No
// auto-fetched legal rule takes effect in the product until an attorney approves it.
const LEGAL_SOURCES = [
  { id: 'legislation', name: 'מאגר החקיקה הלאומי', tier: 'primary', free: true, enabled: true, requiresLicense: false,
    note: 'הנוסח הרשמי של חוקי מדינת ישראל. גובר על כל מקור אחר במקרה של סתירה.',
    url: 'https://www.gov.il/he/service/the_laws_of_the_state_of_israel_in_the_national_legislation_database' },
  { id: 'enforcement', name: 'רשות האכיפה והגבייה (הוצאה לפועל)', tier: 'primary', free: true, enabled: true, requiresLicense: false,
    note: 'נהלים, טפסים ומועדים תפעוליים של ההוצאה לפועל.',
    url: 'https://go.gov.il/ecamain' },
  { id: 'kolzchut', name: 'כל זכות', tier: 'secondary', free: true, enabled: true, requiresLicense: false,
    note: 'מדריכי זכויות מבוססי חקיקה ופסיקה, בשפה נגישה.', url: 'https://www.kolzchut.org.il/he/' },
  { id: 'courts', name: 'הרשות השופטת — פסיקה פומבית', tier: 'secondary', free: true, enabled: true, requiresLicense: false,
    note: 'החלטות ופסקי דין פומביים של בתי המשפט.', url: 'https://www.court.gov.il/' },
  { id: 'nevo', name: 'נבו', tier: 'secondary', free: false, enabled: false, requiresLicense: true,
    note: 'מאגר חקיקה ופסיקה מסחרי — דורש רישיון ומפתח API. מוכן לחיבור.', endpoint: '[API — דורש רישיון]' },
  { id: 'takdin', name: 'תקדין', tier: 'secondary', free: false, enabled: false, requiresLicense: true,
    note: 'מאגר פסיקה מסחרי — דורש רישיון. כבוי עד להסדרה.', endpoint: '[API — דורש רישיון]' },
]

// ADAPTER SEAM — a real connector goes here (authorized API per source). Returns a
// simulated marker until a licensed connector is implemented. Automation proposes; a
// lawyer approves before anything is presented as verified.
async function fetchLegalSource(/* sourceId, query */) {
  return { simulated: true, note: 'connector not implemented — requires an authorized API / license' }
}

// Free, citable deep links fed to the answer engine (built to prefer official sources).
const SOURCE_HINTS = `מקורות ציבוריים חינמיים מהם ניתן לצטט (העדף קישורים אלה כשהם רלוונטיים):
- כל זכות — הוצאה לפועל וגבייה: https://www.kolzchut.org.il/he/הוצאה_לפועל_וגבייה
- כל זכות — נכסים וכספים שאסור לעקל בהוצאה לפועל: https://www.kolzchut.org.il/he/נכסים_וכספים_שאסור_לעקל_בהוצאה_לפועל
- כל זכות — שכר עבודה שלא ניתן לעקל או לשעבד: https://www.kolzchut.org.il/he/שכר_עבודה_שלא_ניתן_לעקל_או_לשעבד
- כל זכות — טענת פרעתי של חייב בהוצאה לפועל (סעיף 19 לחוק): https://www.kolzchut.org.il/he/טענת_"פרעתי"_של_חייב_בהוצאה_לפועל
- כל זכות — מדריך בנושא פיטורים: https://www.kolzchut.org.il/he/מדריך_בנושא_פיטורים
- כל זכות — פיצויי פיטורים לעובד שפוטר: https://www.kolzchut.org.il/he/פיצויי_פיטורים_לעובד_שפוטר
- כל זכות — זכויות עובדים (מדריך כללי): https://www.kolzchut.org.il/he/זכויות_עובדים
- כל זכות — שימוע לפני פיטורים: https://www.kolzchut.org.il/he/שימוע_לפני_פיטורים
- כל זכות — פיצויי הלנת שכר: https://www.kolzchut.org.il/he/פיצויי_הלנת_שכר
- כל זכות — הודעה מוקדמת לפיטורים או התפטרות: https://www.kolzchut.org.il/he/הודעה_מוקדמת_לפיטורים_או_התפטרות
- מאגר החקיקה הלאומי (חוקי מדינת ישראל): https://www.gov.il/he/service/the_laws_of_the_state_of_israel_in_the_national_legislation_database
- רשות האכיפה והגבייה (הוצאה לפועל): https://go.gov.il/ecamain
הערה: מאגרים מסחריים (נבו, תקדין) אינם זמינים לציטוט עד להסדרת רישיון — אל תצטט מהם ואל תמציא מספרי תיקים.`

// Tolerant JSON parse — handles code fences and truncated trailing content.
const parseJsonLoose = (text) => {
  if (!text) return null
  let s = String(text).trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
  try { return JSON.parse(s) } catch { /* try substring */ }
  const a = s.indexOf('{')
  const b = s.lastIndexOf('}')
  if (a >= 0 && b > a) {
    try { return JSON.parse(s.slice(a, b + 1)) } catch { /* fall through */ }
  }
  return null
}

const fetchWithTimeout = async (url, opts, ms = 15000) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { ...opts, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

// Provider-agnostic LLM call. Uses whichever API key is configured:
// GEMINI_API_KEY (free, no card) → ANTHROPIC_API_KEY → OPENAI_API_KEY.
// Ask the Gemini API which models THIS key can actually use (model names change and old
// ones get retired — hardcoding leads to 404s). Cached 1h. Ranked: newest flash first.
let _geminiModelsCache = { at: 0, models: [] }
async function discoverGeminiModels(key) {
  const now = Date.now()
  if (_geminiModelsCache.models.length && now - _geminiModelsCache.at < 60 * 60 * 1000) return _geminiModelsCache.models
  try {
    const r = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}&pageSize=200`, {}, 8000)
    if (!r.ok) return []
    const j = await r.json()
    const usable = (j.models || [])
      .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
      .map((m) => String(m.name || '').replace(/^models\//, ''))
      .filter((m) => /gemini/i.test(m) && !/embedding|aqa|imagen|tts|thinking|live/i.test(m))
    const rank = (m) => {
      let s = 0
      if (/flash/i.test(m)) s += 10
      const ver = parseFloat((m.match(/gemini-(\d+\.?\d*)/i) || [])[1] || '0')
      s += ver
      if (/-latest$/i.test(m)) s += 0.3
      if (/1\.5|1\.0/.test(m)) s -= 30 // retired
      if (/-\d{2,}$/.test(m)) s -= 0.2 // dated snapshots slightly lower than aliases
      return s
    }
    usable.sort((a, b) => rank(b) - rank(a))
    _geminiModelsCache = { at: now, models: usable }
    return usable
  } catch {
    return []
  }
}

const callLLM = async (system, userContent, images = []) => {
  const geminiKey = process.env.GEMINI_API_KEY
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  try {
    if (geminiKey) {
      // Auto-discover models this key supports, then fall back to known names. Deduped.
      const discovered = await discoverGeminiModels(geminiKey)
      const seen = new Set()
      const candidates = [
        process.env.GEMINI_MODEL,
        ...discovered,
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-flash-latest',
      ].filter((m) => m && !seen.has(m) && seen.add(m)).slice(0, 6)
      let lastErr = { error: 'api_error', provider: 'gemini', detail: 'no model responded' }
      for (const model of candidates) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`
        let resp
        try {
          resp = await fetchWithTimeout(url, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: system }] },
              contents: [{ role: 'user', parts: [{ text: userContent }, ...images.map((im) => ({ inlineData: { mimeType: im.mimeType, data: im.base64 } }))] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 6500, responseMimeType: 'application/json' },
            }),
          }, 45000)
        } catch (e) {
          return { error: 'network', detail: String(e).slice(0, 200) }
        }
        if (resp.ok) {
          const data = await resp.json()
          const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('\n').trim()
          if (text) return { text, provider: 'gemini', model }
          lastErr = { error: 'empty', provider: 'gemini', model }
          continue
        }
        const t = await resp.text().catch(() => '')
        lastErr = { error: 'api_error', provider: 'gemini', model, status: resp.status, detail: t.slice(0, 300) }
        // 401/403 = key problem → stop trying more models
        if (resp.status === 401 || resp.status === 403) break
      }
      return lastErr
    }

    if (anthropicKey) {
      const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-latest'
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model, max_tokens: 3600, system, messages: [{ role: 'user', content: userContent }] }),
      })
      if (!resp.ok) {
        const t = await resp.text().catch(() => '')
        return { error: 'api_error', provider: 'anthropic', status: resp.status, detail: t.slice(0, 400) }
      }
      const data = await resp.json()
      const text = (data.content || []).map((b) => b.text || '').join('\n').trim()
      return { text }
    }

    if (openaiKey) {
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { authorization: `Bearer ${openaiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: system }, { role: 'user', content: userContent }],
          response_format: { type: 'json_object' },
          max_tokens: 3600,
        }),
      })
      if (!resp.ok) {
        const t = await resp.text().catch(() => '')
        return { error: 'api_error', provider: 'openai', status: resp.status, detail: t.slice(0, 400) }
      }
      const data = await resp.json()
      const text = (data.choices?.[0]?.message?.content || '').trim()
      return { text }
    }
  } catch (e) {
    return { error: 'network', detail: String(e).slice(0, 200) }
  }

  return { error: 'no_key' }
}

app.post('/api/legal-analyze', uploadMem.single('file'), async (req, res) => {
  try {
    const question = (req.body?.question || '').toString().trim()
    const file = req.file
    const mime = file?.mimetype || ''
    const isImage = mime.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif|gif|bmp)$/i.test(file?.originalname || '')

    let images = []
    let docText = ''
    if (isImage && file?.buffer) {
      // Photographed / scanned document — send the image to the vision model directly.
      images = [{ mimeType: mime || 'image/jpeg', base64: file.buffer.toString('base64') }]
    } else {
      docText = await extractDocText(file, req.body?.text)
    }
    if (!question && !docText && images.length === 0) {
      res.status(400).json({ error: 'לא סופקה שאלה או מסמך קריא' })
      return
    }

    const system = `אתה עוזר משפטי מקצועי בישראל, המבסס תשובות על הדין הישראלי ועל מקורות ציבוריים חינמיים. עליך לפענח את המקרה מהמסמך/השאלה, ולהסביר אותו בשתי רמות: (א) בשפה פשוטה ויומיומית עבור מי שאינו בקיא במשפטים, ו-(ב) בניתוח מקצועי. בנוסף הצע צעדים וסעדים — הכל כמידע כללי שאינו ייעוץ משפטי מחייב.
${SOURCE_HINTS}
כללים: בסס עצמך על הדין הישראלי ועל עקרונות פסיקה מקובלים; ב-legalAnalysis ציין במדויק את שמות החוקים והסעיפים הרלוונטיים (למשל: חוק ההוצאה לפועל, התשכ״ז-1967 — סעיף 19 (טענת פרעתי); חוק הגנת השכר, התשי״ח-1958 ותקנותיו (תקרת עיקול משכורת); חוק פיצויי פיטורים, התשכ״ג-1963; חוק הודעה מוקדמת לפיטורים ולהתפטרות, התשס״א-2001; חוק עבודת נשים, התשי״ד-1954 (הגנה על עובדת בהיריון); חוק שעות עבודה ומנוחה, התשי״א-1951; חוק שכר מינימום, התשמ״ז-1987; חוק ההתיישנות, התשי״ח-1958), אך אל תמציא מספרי תיקים או ציטוטי פסיקה ספציפיים; אם בדיקה מעמיקה במאגר פסיקה מסחרי (כגון נבו) עשויה לחדד — ציין זאת כצעד; אם המידע חלקי — ציין מה חסר; שמור על טון מקצועי, אמפתי ומכבד; ב-plainSummary אסור להשתמש בז'רגון משפטי — הסבר כמו לחבר; ודא שה-JSON שלם וסגור.
זיהוי מסמך — חובה: אם צורף מסמך או תמונה, קרא תחילה את כל הטקסט שבו (גם אם צולם/סרוק), וזהה במדויק את סוג המסמך (למשל: אזהרה/מכתב מההוצאה לפועל, צו עיקול, דרישת תשלום, מכתב פיטורים, זימון לשימוע, הסכם שכירות, חוזה, כתב תביעה, פסק דין, תלוש שכר). חלץ את הפרטים המרכזיים שמופיעים בו: מי הגורם השולח, תאריכים ומועדים, סכומים, מספר תיק/אסמכתא, והצדדים. בסס את כל הניתוח על מה שכתוב בפועל במסמך. אם התמונה מטושטשת או חלקית — ציין זאת ב-documentType ובקש צילום ברור יותר, אך נתח את מה שכן קריא.
חשוב — תן ללקוח כמה שיותר מידע מהותי, ברור ופרקטי. מלא כל שדה שרלוונטי למקרה (אל תשאיר ריק אם יש מה לומר). תן פירוט אמיתי: שמות חוקים וסעיפים מדויקים, תקרות וסכומים כשידועים (למשל תקרת עיקול שכר, סכומי קצבה מוגנים), מועדים קונקרטיים (מועדי תגובה, תקופות התיישנות), ורשימות מלאות ולא חלקיות.
מגבלות אורך: bottomLine — משפט אחד; plainSummary — 2 עד 4 משפטים; caseDecoding, legalAnalysis, whatToExpect — עד ~120 מילים כל אחד; פריטי רשימה — משפט עד שניים. תן לפחות 3–5 פריטים בכל רשימה רלוונטית.
החזר אך ורק JSON תקין במבנה הבא (ללא טקסט נוסף):
{"documentType":"סוג המסמך שזוהה (או ריק אם זו שאלה בלבד ללא מסמך)","keyDetails":["פרט מרכזי שחולץ מהמסמך: גורם שולח / תאריך / סכום / מספר תיק","פרט נוסף"],"bottomLine":"משפט אחד ברור עם השורה התחתונה — מה המצב ומה כדאי לעשות","plainSummary":"הסבר בשפה פשוטה וברורה, 2-4 משפטים, למי שלא מבין במשפטים — מה קרה, מה זה אומר עבורו ומדוע זה חשוב, בלי מונחים משפטיים","caseDecoding":"פענוח מקצועי וממוקד של המקרה","legalAnalysis":"ניתוח משפטי מקצועי המבוסס על חוק ועקרונות פסיקה","relevantLaws":[{"law":"שם החוק המדויק + שנה + מספר סעיף","explanation":"מה הסעיף קובע ואיך הוא חל על המקרה, בשפה פשוטה"}],"rights":["זכות קונקרטית שיש ללקוח במצב זה","זכות נוספת"],"steps":["צעד מעשי 1","צעד מעשי 2","צעד מעשי 3","צעד מעשי 4"],"documentsNeeded":["מסמך שכדאי לאסוף 1","מסמך 2","מסמך 3"],"deadlines":["מועד/תקופה קריטית שחשוב לשים לב אליה (למשל מועד תגובה, התיישנות)"],"whatToExpect":"מה צפוי בתהליך ובאילו שלבים ולוחות זמן כלליים","remedies":["סעד אפשרי 1","סעד אפשרי 2"],"commonMistakes":["טעות נפוצה שכדאי להימנע ממנה 1","טעות 2"],"faq":[{"q":"שאלה נפוצה רלוונטית","a":"תשובה קצרה וברורה"},{"q":"שאלה נוספת","a":"תשובה"}],"sources":[{"title":"שם המקור","url":"קישור"}],"riskLevel":"נמוך/בינוני/גבוה","disclaimer":"מידע כללי בלבד, אינו ייעוץ משפטי מחייב."}`

    const userContent = images.length > 0
      ? `שאלת/פניית המשתמש: ${question || '(המשתמש צילם/העלה תמונת מסמך לבדיקה)'}

מצורפת תמונה של מסמך (ייתכן שצולם בטלפון). בצע OCR: קרא בעיון את כל הטקסט הנראה בתמונה, כולל כותרות, גופי הטקסט, מספרים, תאריכים וחתימות. זהה את סוג המסמך (documentType) וחלץ את הפרטים המרכזיים (keyDetails). ואז פענח את המקרה ונתח אותו לפי תוכנו בפועל. אם חלקים אינם קריאים — נתח את הקריא וציין מה חסר.`
      : `שאלת/פניית המשתמש: ${question || '(המשתמש העלה מסמך לבדיקה)'}

תוכן המסמך שחולץ (עד 12000 תווים):
${(docText || '(לא חולץ טקסט מהמסמך)').slice(0, 12000)}`

    const result = await callLLM(system, userContent, images)
    if (result.error === 'no_key') {
      res.json({ needsKey: true })
      return
    }
    if (result.error) {
      res.json({ aiError: true, status: result.status || 0, detail: result.detail || result.error })
      return
    }
    const parsed = parseJsonLoose(result.text)
    if (!parsed) {
      res.json({ raw: result.text || '' })
      return
    }
    appendAudit({ area: 'analyze', action: 'ai_analyze', actor: 'public', detail: (question || 'ניתוח מסמך').slice(0, 80) })
    res.json({ analysis: parsed, extractedChars: (docText || '').length })
  } catch (e) {
    res.json({ aiError: true, detail: String(e).slice(0, 200) })
  }
})

// Public: legal-source registry (transparency + ready for a UI). Shows which databases
// power the answers, and which commercial ones (Nevo/Takdin) await a license.
app.get('/api/legal-sources', (_req, res) => {
  res.json({
    model: 'ריבוי מקורות — אוטומציה מציעה, עורך דין מאשר',
    sources: LEGAL_SOURCES.map((s) => ({
      id: s.id, name: s.name, tier: s.tier, free: !!s.free, enabled: !!s.enabled,
      requiresLicense: !!s.requiresLicense, note: s.note, url: s.url || null,
    })),
  })
})

/* ===================== PUBLIC: legal news / updates =================== */
// Hybrid feed: a curated multilingual base (always relevant + translated) + a live
// augmentation pulled from gov.il (filtered by relevance keywords, cached). If the live
// fetch fails or yields nothing relevant, the curated list is served on its own — so the
// banner is never empty and never shows irrelevant content.
const NEWS_SRC_LABEL = { he: 'מקור רשמי', ar: 'مصدر رسمي', en: 'Official source', ru: 'Офиц. источник' }
const NEWS_KEYWORDS = ['עיקול', 'הוצאה לפועל', 'הוצל', 'חוב', 'חדלות פירעון', 'פשיטת רגל', 'גבייה', 'זכויות עובד', 'פיטורים', 'שכר מינימום', 'הלנת שכר', 'מזונות', 'צרכנ', 'ביטוח לאומי', 'נזיק']
const NEWS_CURATED = [
  { id: 'min-wage', date: '2026-04-01', url: 'https://www.kolzchut.org.il/he/%D7%A9%D7%9B%D7%A8_%D7%9E%D7%99%D7%A0%D7%99%D7%9E%D7%95%D7%9D',
    title: { he: 'שכר המינימום עודכן ל-6,443.85 ₪', ar: 'تحديث الحد الأدنى للأجور إلى 6,443.85 ₪', en: 'Minimum wage updated to ₪6,443.85', ru: 'Минимальная зарплата обновлена до 6 443,85 ₪' },
    summary: { he: 'החל מ-1 באפריל 2026 עלה שכר המינימום החודשי ל-6,443.85 ₪. מי שקיבל פחות — זכאי להפרשי שכר.', ar: 'اعتباراً من 1 أبريل 2026 ارتفع الحد الأدنى الشهري للأجور إلى 6,443.85 ₪. من تقاضى أقل — يستحق فروق الأجر.', en: 'As of April 1, 2026, the monthly minimum wage rose to ₪6,443.85. Anyone paid less is entitled to the difference.', ru: 'С 1 апреля 2026 года месячная минимальная зарплата выросла до 6 443,85 ₪. Кто получил меньше — вправе требовать разницу.' } },
  { id: 'vat-18', date: '2025-01-01', url: 'https://www.kolzchut.org.il/he/%D7%9E%D7%A1_%D7%A2%D7%A8%D7%9A_%D7%9E%D7%95%D7%A1%D7%A3',
    title: { he: 'מע״מ עומד על 18%', ar: 'ضريبة القيمة المضافة 18%', en: 'VAT stands at 18%', ru: 'НДС составляет 18%' },
    summary: { he: 'מאז ינואר 2025 שיעור המע״מ בישראל הוא 18%. חשוב לוודא שחיובים וחשבוניות מחושבים לפי השיעור הנכון.', ar: 'منذ يناير 2025 نسبة ضريبة القيمة المضافة في إسرائيل 18%. من المهم التأكد من احتساب الفواتير والرسوم وفق النسبة الصحيحة.', en: "Since January 2025, Israel's VAT rate is 18%. Make sure charges and invoices use the correct rate.", ru: 'С января 2025 года ставка НДС в Израиле — 18%. Важно проверять, что счета рассчитаны по правильной ставке.' } },
  { id: 'insolvency', url: 'https://www.kolzchut.org.il/he/%D7%97%D7%93%D7%9C%D7%95%D7%AA_%D7%A4%D7%99%D7%A8%D7%A2%D7%95%D7%9F',
    title: { he: 'מסלול שיקום כלכלי לחייבים', ar: 'مسار إعادة التأهيل الاقتصادي للمدينين', en: 'Economic rehabilitation path for debtors', ru: 'Путь экономической реабилитации для должников' },
    summary: { he: 'חוק חדלות פירעון ושיקום כלכלי מאפשר לחייבים הליך מוסדר להפטר ולשיקום כלכלי, במקום פשיטת רגל.', ar: 'قانون الإعسار وإعادة التأهيل الاقتصادي يتيح للمدينين إجراءً منظماً للإبراء وإعادة التأهيل بدلاً من إشهار الإفلاس.', en: 'The Insolvency and Economic Rehabilitation Law offers debtors an orderly path to discharge and rehabilitation instead of bankruptcy.', ru: 'Закон о несостоятельности и экономической реабилитации даёт должникам упорядоченный путь к освобождению от долгов вместо банкротства.' } },
  { id: 'pareti', url: 'https://www.kolzchut.org.il/he/%D7%98%D7%A2%D7%A0%D7%AA_%22%D7%A4%D7%A8%D7%A2%D7%AA%D7%99%22_%D7%A9%D7%9C_%D7%97%D7%99%D7%99%D7%91_%D7%91%D7%94%D7%95%D7%A6%D7%90%D7%94_%D7%9C%D7%A4%D7%95%D7%A2%D7%9C',
    title: { he: 'שילמת חוב? טענת "פרעתי"', ar: 'سدّدت الدين؟ دعوى «الوفاء»', en: 'Paid your debt? The "paid" claim', ru: 'Погасили долг? Заявление «Парети»' },
    summary: { he: 'סעיף 19 לחוק ההוצאה לפועל מאפשר לחייב ששילם — כולו או חלקו — לעצור גבייה שאינה מוצדקת.', ar: 'المادة 19 من قانون دائرة الإجراء تتيح للمدين الذي سدّد — كلياً أو جزئياً — وقف تحصيل غير مبرَّر.', en: 'Section 19 of the Execution Law lets a debtor who already paid — in full or part — stop unjustified collection.', ru: 'Статья 19 Закона об исполнительном производстве позволяет должнику, уже оплатившему долг, остановить необоснованное взыскание.' } },
  { id: 'protected', url: 'https://www.kolzchut.org.il/he/%D7%A0%D7%9B%D7%A1%D7%99%D7%9D_%D7%95%D7%9B%D7%A1%D7%A4%D7%99%D7%9D_%D7%A9%D7%90%D7%A1%D7%95%D7%A8_%D7%9C%D7%A2%D7%A7%D7%9C_%D7%91%D7%94%D7%95%D7%A6%D7%90%D7%94_%D7%9C%D7%A4%D7%95%D7%A2%D7%9C',
    title: { he: 'יש כספים שאסור לעקל', ar: 'هناك أموال يُمنع حجزها', en: 'Some funds cannot be garnished', ru: 'Некоторые средства нельзя арестовать' },
    summary: { he: 'חלק מהשכר, קצבאות ביטוח לאומי ודמי מזונות מוגנים מעיקול. אם עוקלו — ייתכן שניתן להשיבם.', ar: 'جزء من الأجر، مخصصات التأمين الوطني والنفقة محمية من الحجز. إذا حُجزت — قد يمكن استردادها.', en: 'Part of wages, National Insurance allowances and alimony are protected from garnishment. If garnished, they may be recoverable.', ru: 'Часть зарплаты, пособия «Битуах Леуми» и алименты защищены от ареста. Если арестованы — возможно, их можно вернуть.' } },
  { id: 'hearing', url: 'https://www.kolzchut.org.il/he/%D7%A9%D7%99%D7%9E%D7%95%D7%A2_%D7%9C%D7%A4%D7%A0%D7%99_%D7%A4%D7%99%D7%98%D7%95%D7%A8%D7%99%D7%9D',
    title: { he: 'פיטורים? מגיע לך שימוע', ar: 'فصل من العمل؟ يحق لك جلسة استماع', en: "Dismissed? You're entitled to a hearing", ru: 'Увольнение? Вам положено слушание' },
    summary: { he: 'לפי הפסיקה, מעסיק חייב לערוך שימוע הוגן לפני פיטורים. היעדר שימוע כדין עשוי לזכות בפיצוי.', ar: 'وفق الاجتهاد القضائي، على صاحب العمل إجراء جلسة استماع عادلة قبل الفصل. غياب الاستماع القانوني قد يخوّل تعويضاً.', en: 'Case law requires a fair hearing before dismissal. The absence of a proper hearing may entitle you to compensation.', ru: 'По судебной практике работодатель обязан провести справедливое слушание перед увольнением. Его отсутствие может дать право на компенсацию.' } },
]
let liveNewsCache = { at: 0, items: [] }
async function fetchLiveNews() {
  const now = Date.now()
  if (liveNewsCache.items.length && now - liveNewsCache.at < 3 * 60 * 60 * 1000) return liveNewsCache.items
  try {
    const url = process.env.LEGAL_NEWS_API || 'https://www.gov.il/he/api/PublicationApi/index?limit=40&skip=0'
    const r = await fetchWithTimeout(url, { headers: { accept: 'application/json' } }, 9000)
    const j = await r.json().catch(() => null)
    const arr = (j && (j.results || j.Results || j.data || j.items)) || []
    const items = arr
      .map((x) => ({
        title: String(x.Title || x.title || '').trim(),
        url: x.Url ? (String(x.Url).startsWith('http') ? x.Url : 'https://www.gov.il' + x.Url) : (x.url || ''),
        date: String(x.DocPublishedDate || x.DocUpdateDate || x.date || '').slice(0, 10),
        source: 'gov.il', live: true,
      }))
      .filter((it) => it.title && NEWS_KEYWORDS.some((k) => it.title.includes(k)))
      .slice(0, 4)
    liveNewsCache = { at: now, items }
    return items
  } catch {
    return liveNewsCache.items || []
  }
}
app.get('/api/legal-news', async (req, res) => {
  const lang = ['he', 'ar', 'en', 'ru'].includes(String(req.query.lang)) ? String(req.query.lang) : 'he'
  const srcLabel = NEWS_SRC_LABEL[lang]
  const curated = NEWS_CURATED.map((n) => ({
    id: n.id, date: n.date || '', url: n.url, source: srcLabel,
    title: (n.title && (n.title[lang] || n.title.he)) || '',
    summary: (n.summary && (n.summary[lang] || n.summary.he)) || '',
  }))
  let live = []
  try { live = await fetchLiveNews() } catch { live = [] }
  const items = [...live, ...curated].slice(0, 8)
  res.json({ updatedAt: new Date().toISOString(), items })
})

/* ===================== PUBLIC: refund requests =================== */
// Registered + consented request that the FIRM handles. Does not file anything
// with any authority automatically. Stored as a lead so staff can act on it.
app.post('/api/refund-requests', (req, res) => {
  const { fullName, idNumber, phone, email, consent, feeConsent, truthDeclared, powerOfAttorney, privacyConsent, agreementVersion, consentTextsSigned, attorney, feeAgreement, signature, details } = req.body || {}
  if (!fullName || !(phone || email)) {
    res.status(400).json({ error: 'נדרש שם מלא וטלפון או דוא"ל' })
    return
  }
  if (!consent) {
    res.status(400).json({ error: 'נדרש אישור מפורש לשליחת הבקשה בשמך' })
    return
  }
  const now = new Date().toISOString()
  const snapshot = details && typeof details === 'object' ? details : {}
  const summaryLine = snapshot.summary ? String(snapshot.summary) : 'בקשת בדיקת החזר עיקול'
  // Electronic signature: accept a small PNG data-URL only.
  const sig = typeof signature === 'string' && /^data:image\/png;base64,/.test(signature) && signature.length < 400000 ? signature : ''
  const signerIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim()
  const signatureHash = sig ? crypto.createHash('sha256').update(sig).digest('hex') : null
  const userAgent = (req.headers['user-agent'] || '').toString().slice(0, 300)
  const lead = {
    id: genId('refund'),
    type: 'refund',
    name: String(fullName).trim(),
    idNumber: String(idNumber || '').trim(),
    phone: String(phone || '').trim(),
    email: String(email || '').trim(),
    topic: 'עיקול / בקשת החזר',
    urgency: 'גבוהה',
    message: summaryLine,
    refund: {
      estimatedOverpaid: snapshot.estimatedOverpaid ?? null,
      originalDebt: snapshot.originalDebt ?? null,
      totalCollected: snapshot.totalCollected ?? null,
      incomeType: snapshot.incomeType ?? null,
      verdict: snapshot.verdict ?? null,
    },
    consentAt: now,
    // Separate, individually-recorded consents (audit-friendly)
    feeConsent: !!(feeConsent ?? consent),
    powerOfAttorney: !!powerOfAttorney,
    truthDeclared: !!truthDeclared,
    truthDeclaredAt: truthDeclared ? now : null,
    privacyConsent: !!privacyConsent,
    agreementVersion: String(agreementVersion || ''),
    consentTexts: consentTextsSigned && typeof consentTextsSigned === 'object' ? consentTextsSigned : null,
    attorney: String(attorney || 'עו״ד מוחמד מ׳ קבהא, מ.ר 67912'),
    feeAgreement: String(feeAgreement || '25%+VAT success-fee, no win no fee'),
    feeAgreedAt: now,
    // Electronic signature evidence bundle
    signature: sig,
    signedAt: sig ? now : null,
    signerIp: sig ? signerIp : null,
    signatureHash: signatureHash,
    signerUserAgent: sig ? userAgent : null,
    status: 'new',
    owner: '',
    source: 'בקשת החזר',
    createdAt: now,
  }
  const current = load('leads', [])
  save('leads', [lead, ...current])
  appendAudit({ area: 'leads', action: 'refund_request', actor: 'public', detail: `${lead.name} | החזר עיקול${lead.refund.estimatedOverpaid ? ` | ~₪${lead.refund.estimatedOverpaid}` : ''}`, refId: lead.id })
  // Best-effort notifications (activate by setting RESEND_API_KEY).
  const est = lead.refund.estimatedOverpaid ? `~₪${Number(lead.refund.estimatedOverpaid).toLocaleString('he-IL')}` : 'לא צוין'
  sendEmail(OFFICE_EMAIL, `בקשת החזר/הרשאה חדשה — ${lead.name}`,
    `<div dir="rtl" style="font-family:Arial">
      <h3>בקשת החזר/הרשאה חדשה</h3>
      <p><b>שם:</b> ${escapeHtml(lead.name)}<br><b>ת"ז:</b> ${escapeHtml(lead.idNumber || '-')}<br>
      <b>טלפון:</b> ${escapeHtml(lead.phone || '-')}<br><b>מייל:</b> ${escapeHtml(lead.email || '-')}<br>
      <b>הערכת החזר:</b> ${est}<br><b>ייפוי כוח:</b> ${lead.powerOfAttorney ? 'כן ✓' : 'לא'} · <b>הצהרה:</b> ${lead.truthDeclared ? 'כן ✓' : 'לא'} · <b>חתימה:</b> ${lead.signature ? 'התקבלה ✓' : 'אין'}<br>
      <b>מספר פנייה:</b> ${lead.id}</p>
    </div>`).catch(() => {})
  if (lead.email) {
    sendEmail(lead.email, 'קיבלנו את בקשתך — משרד עורכי דין מוחמד קבהא',
      `<div dir="rtl" style="font-family:Arial">
        <h3>שלום ${escapeHtml(lead.name)},</h3>
        <p>קיבלנו את הבקשה וההרשאה שלך לטיפול בעניין השבת כספים שנגבו ביתר. נציג מהמשרד יחזור אליך בהקדם.</p>
        <p><b>מספר פנייה:</b> ${lead.id}</p>
        <p>הבדיקה חינם; שכר טרחה של 25% + מע״מ ייגבה רק אם וכאשר יתקבל החזר בפועל.</p>
        <p>משרד עורכי דין מוחמד מ. קבהא · מ.ר 67912 · 052-661-1866 · info@my-attorney.net</p>
      </div>`).catch(() => {})
  }
  res.status(201).json({ success: true, id: lead.id })
})

/* ===================== CLIENT: private area login =============== */
// Separate, gated client login (kept fully apart from the public site + admin).
// Demo records that must never survive into production (backdoor risk).
const DEMO_CLIENT_CASEIDS = ['MY-20481', 'MY-20492', 'MY-20510']
const DEMO_CLIENT_CODES = ['2481', '2492', '2510']
const seedClients = () => {
  const f = path.join(dataDir, 'clients.json')
  if (!fs.existsSync(f)) {
    // Production starts with NO clients — real clients are created via the CRM.
    writeJson(f, [])
    return
  }
  // One-time purge: remove the old demo clients left on the persistent volume.
  const existing = readJson(f, [])
  const cleaned = existing.filter(
    (c) => !(DEMO_CLIENT_CASEIDS.includes(c.caseId) && DEMO_CLIENT_CODES.includes(String(c.code))),
  )
  if (cleaned.length !== existing.length) writeJson(f, cleaned)
}
seedClients()

// ---- Client identity generators (real, non-guessable) ----
function genProfileId() {
  return 'c_' + crypto.randomBytes(5).toString('hex')
}
function genCaseId() {
  const clients = readJson(path.join(dataDir, 'clients.json'), [])
  let max = 20500
  for (const c of clients) {
    const m = String(c.caseId || '').match(/(\d{4,})/)
    if (m) max = Math.max(max, parseInt(m[1], 10))
  }
  return 'MY-' + (max + 1)
}
function genAccessCode() {
  // 8 chars, unambiguous alphabet (no 0/O/1/I/L) — safe to read out to a client.
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
  const bytes = crypto.randomBytes(8)
  let out = ''
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length]
  return out
}
const clientSessions = new Map()
app.post('/api/client/login', (req, res) => {
  const { caseId, code } = req.body || {}
  const clients = readJson(path.join(dataDir, 'clients.json'), [])
  const client = clients.find(
    (c) => String(c.caseId).toLowerCase() === String(caseId || '').trim().toLowerCase() && String(c.code).toUpperCase() === String(code || '').trim().toUpperCase(),
  )
  if (!client) {
    appendAudit({ area: 'client', action: 'client_login_failed', actor: 'client', detail: String(caseId || '') })
    res.status(401).json({ error: 'מספר תיק או קוד גישה שגויים' })
    return
  }
  const token = crypto.randomBytes(20).toString('hex')
  clientSessions.set(token, { profileId: client.profileId, expiresAt: Date.now() + 60 * 60 * 1000 })
  appendAudit({ area: 'client', action: 'client_login', actor: 'client', profileId: client.profileId, detail: client.name })
  res.json({ token, profileId: client.profileId, name: client.name, caseId: client.caseId })
})

/* -------- Quick login helpers (phone OTP + Google) -------- */
// Normalize an Israeli phone to its 9 significant digits (drop +972 / leading 0).
function phoneKey(p) {
  let d = String(p || '').replace(/\D/g, '')
  if (d.startsWith('972')) d = d.slice(3)
  return d.replace(/^0+/, '').slice(-9)
}
function issueClientSession(res, client, via, isNew) {
  const token = crypto.randomBytes(20).toString('hex')
  clientSessions.set(token, { profileId: client.profileId, expiresAt: Date.now() + 60 * 60 * 1000 })
  appendAudit({ area: 'client', action: 'client_login', actor: 'client', profileId: client.profileId, detail: `${client.name} (${via})` })
  res.json({ token, profileId: client.profileId, name: client.name, caseId: client.caseId, isNew: !!isNew, ...(isNew ? { code: client.code } : {}) })
}

// Self-registration: auto-create a CRM client (case number + access code) on first login.
function createClientAuto({ name, phone, email }) {
  const f = path.join(dataDir, 'clients.json')
  const clients = readJson(f, [])
  const digits = String(phone || '').replace(/\D/g, '')
  const client = {
    profileId: genProfileId(),
    caseId: genCaseId(),
    name: (name && String(name).trim()) || (digits ? 'לקוח ' + digits.slice(-4) : 'לקוח חדש'),
    phone: String(phone || '').trim(),
    email: String(email || '').trim(),
    code: genAccessCode(),
    createdAt: new Date().toISOString(),
    selfRegistered: true,
  }
  clients.unshift(client)
  writeJson(f, clients)
  appendAudit({ area: 'client', action: 'client_selfregister', actor: 'client', profileId: client.profileId, detail: `${client.name} | ${client.caseId}` })
  return client
}

// ── SMS provider adapter ─────────────────────────────────────────────
// Supports (auto-detected by which env vars are set, or force with SMS_PROVIDER):
//   • sms4free  — Israeli gateway, fast signup, low cost (recommended for IL launch)
//   • twilio    — global standard (needs a pre-registered IL sender ID, ~1 week)
//   • generic   — any provider via SMS_API_URL + SMS_API_KEY (POST {to,text})
// Returns true only if the message was actually accepted by the provider.
const SMS_PROVIDER = (process.env.SMS_PROVIDER || '').toLowerCase() || (
  process.env.SMS4FREE_KEY ? 'sms4free' :
  process.env.TWILIO_ACCOUNT_SID ? 'twilio' :
  process.env.SMS_API_KEY ? 'generic' : ''
)
const SMS_CONFIGURED = !!SMS_PROVIDER
let lastSmsError = '' // diagnostic: last provider failure detail (no secrets)

// Normalize an Israeli number to E.164 (05X-XXXXXXX → +9725XXXXXXXX) for international APIs.
function toE164IL(phone) {
  let p = String(phone == null ? '' : phone).replace(/[^\d+]/g, '')
  if (p.startsWith('+')) return p
  if (p.startsWith('00')) return '+' + p.slice(2)
  if (p.startsWith('972')) return '+' + p
  if (p.startsWith('0')) return '+972' + p.slice(1)
  return '+972' + p
}

async function sendSms(phone, text) {
  if (!SMS_CONFIGURED || !phone) return false
  try {
    if (SMS_PROVIDER === 'sms4free') {
      // https://www.sms4free.co.il — JSON API. Sender must be pre-approved in the account.
      const r = await fetchWithTimeout('https://api.sms4free.co.il/ApiSMS/v2/SendSMS', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: process.env.SMS4FREE_KEY,
          user: process.env.SMS4FREE_USER,
          pass: process.env.SMS4FREE_PASS,
          sender: process.env.SMS4FREE_SENDER || 'MyAttorney',
          recipient: String(phone).replace(/\D/g, ''),
          msg: text,
        }),
      }, 10000)
      const raw = await r.text().catch(() => '')
      let j = {}
      try { j = JSON.parse(raw) } catch { /* non-JSON response */ }
      const status = Number(j && j.status)
      // sms4free returns status > 0 (number of messages sent) on success; ≤ 0 is an error code.
      if (r.ok && status > 0) return true
      lastSmsError = `sms4free http=${r.status} status=${j && j.status !== undefined ? j.status : '?'} msg=${(j && j.message) || raw.slice(0, 140)}`
      return false
    }
    if (SMS_PROVIDER === 'twilio') {
      const sid = process.env.TWILIO_ACCOUNT_SID
      const token = process.env.TWILIO_AUTH_TOKEN
      const from = process.env.TWILIO_FROM // Twilio number or pre-registered IL alphanumeric sender
      if (!sid || !token || !from) return false
      const r = await fetchWithTimeout(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ To: toE164IL(phone), From: from, Body: text }).toString(),
      }, 10000)
      return r.ok
    }
    if (SMS_PROVIDER === 'generic') {
      const url = process.env.SMS_API_URL
      if (!url) return false
      const r = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.SMS_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: toE164IL(phone), text }),
      }, 10000)
      return r.ok
    }
  } catch {
    return false
  }
  return false
}

// Email hook — activates when RESEND_API_KEY is set (https://resend.com, free tier).
const EMAIL_ENABLED = !!process.env.RESEND_API_KEY
const MAIL_FROM = process.env.MAIL_FROM || 'My-Attorney <info@my-attorney.net>'
const OFFICE_EMAIL = process.env.OFFICE_EMAIL || 'info@my-attorney.net'
function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
}
async function sendEmail(to, subject, html) {
  if (!EMAIL_ENABLED || !to) return false
  try {
    const r = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: MAIL_FROM, to: [to], subject, html }),
    }, 10000)
    return r.ok
  } catch {
    return false
  }
}

// Digital invoice hook — Morning / חשבונית ירוקה (greeninvoice).
// Issues a חשבונית מס/קבלה (type 320); the allocation number (מספר הקצאה) is handled
// by the Morning account when connected to the Tax Authority.
// Activates when MORNING_KEY_ID + MORNING_KEY_SECRET are set. Returns { docId, url } or null.
async function issueInvoice({ name, email, amount, description }) {
  const id = process.env.MORNING_KEY_ID
  const secret = process.env.MORNING_KEY_SECRET
  if (!id || !secret) return null
  try {
    const tr = await fetchWithTimeout('https://api.greeninvoice.co.il/api/v1/account/token', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, secret }),
    }, 10000)
    const tj = await tr.json()
    const token = tj && tj.token
    if (!token) return null
    const dr = await fetchWithTimeout('https://api.greeninvoice.co.il/api/v1/documents', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        type: 320, // חשבונית מס/קבלה
        lang: 'he',
        currency: 'ILS',
        client: { name: name || email || 'לקוח', emails: email ? [email] : [] },
        income: [{ description: description || 'שירות משפטי', quantity: 1, price: Number(amount) || 0, vatType: 0 }],
        remarks: 'תשלום עבור שירותי הכנת טפסים — משרד עו״ד מוחמד מ. קבהא',
      }),
    }, 12000)
    const dj = await dr.json()
    if (dr.ok && dj && (dj.id || dj.url)) {
      const url = dj.url && (dj.url.he || dj.url.origin || dj.url.en) ? (dj.url.he || dj.url.origin || dj.url.en) : ''
      return { docId: dj.id || String(dj.number || ''), url }
    }
    return null
  } catch {
    return null
  }
}

// Phone OTP: request a code (test mode returns it on screen until SMS provider is wired).
const otpStore = new Map() // phoneKey -> { code, expiresAt, profileId }
app.post('/api/client/otp/request', async (req, res) => {
  const key = phoneKey(req.body && req.body.phone)
  if (key.length < 8) {
    res.status(400).json({ error: 'מספר טלפון לא תקין' })
    return
  }
  const clients = readJson(path.join(dataDir, 'clients.json'), [])
  const client = clients.find((c) => phoneKey(c.phone) === key)
  const code = String(crypto.randomInt(100000, 1000000))
  otpStore.set(key, {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000,
    profileId: client ? client.profileId : null,
    phone: (req.body && req.body.phone) || '',
    name: (req.body && req.body.name) || '',
  })
  appendAudit({ area: 'client', action: 'otp_request', actor: 'client', profileId: client ? client.profileId : undefined, detail: client ? client.name : `חדש: ${key}` })
  const sent = await sendSms((client && client.phone) || (req.body && req.body.phone), `קוד הכניסה שלך ל-My-Attorney: ${code}`)
  if (SMS_CONFIGURED && !sent) {
    // A provider is configured but delivery failed — NEVER leak the code to screen in production.
    otpStore.delete(key)
    if (lastSmsError) console.warn('[sms] send failed:', lastSmsError) // server log only, not exposed to client
    res.status(502).json({ sent: false, error: 'שליחת הקוד נכשלה כרגע, נסה/י שוב בעוד רגע' })
    return
  }
  // Only when NO provider is configured (dev/test) do we expose the code on screen.
  res.json({ sent: true, testMode: !sent, ...(sent ? {} : { devCode: code }) })
})

app.post('/api/client/otp/verify', (req, res) => {
  const key = phoneKey(req.body && req.body.phone)
  const rec = otpStore.get(key)
  if (!rec || rec.expiresAt < Date.now()) {
    res.status(401).json({ error: 'הקוד פג תוקף — בקש/י קוד חדש' })
    return
  }
  if (String((req.body && req.body.code) || '').trim() !== rec.code) {
    res.status(401).json({ error: 'קוד שגוי' })
    return
  }
  otpStore.delete(key)
  const clients = readJson(path.join(dataDir, 'clients.json'), [])
  let client = rec.profileId ? clients.find((c) => c.profileId === rec.profileId) : null
  let isNew = false
  if (!client) {
    client = createClientAuto({ name: rec.name, phone: rec.phone || (req.body && req.body.phone), email: '' })
    isNew = true
  }
  issueClientSession(res, client, isNew ? 'טלפון · חדש' : 'טלפון', isNew)
})

// Google Sign-In: verify the ID token with Google, match by verified email.
app.post('/api/client/google', async (req, res) => {
  const credential = req.body && req.body.credential
  if (!credential) {
    res.status(400).json({ error: 'חסר טוקן Google' })
    return
  }
  try {
    const r = await fetchWithTimeout(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {}, 10000)
    const info = await r.json()
    if (process.env.GOOGLE_CLIENT_ID && info.aud !== process.env.GOOGLE_CLIENT_ID) {
      res.status(401).json({ error: 'טוקן Google לא תואם' })
      return
    }
    const email = String(info.email || '').toLowerCase()
    if (!email || info.email_verified === 'false') {
      res.status(401).json({ error: 'מייל Google לא מאומת' })
      return
    }
    const clients = readJson(path.join(dataDir, 'clients.json'), [])
    let client = clients.find((c) => String(c.email || '').toLowerCase() === email)
    let isNew = false
    if (!client) {
      client = createClientAuto({ name: info.name, phone: '', email })
      isNew = true
    }
    issueClientSession(res, client, isNew ? 'Google · חדש' : 'Google', isNew)
  } catch {
    res.status(500).json({ error: 'אימות Google נכשל' })
  }
})

// Public runtime config for the frontend (safe, non-secret values only).
app.get('/api/public-config', (_req, res) => {
  res.json({ googleClientId: process.env.GOOGLE_CLIENT_ID || '' })
})

// Bank transfer details — served on demand only (kept out of the public page source).
app.get('/api/payment-details', (_req, res) => {
  res.json({
    bank: {
      name: 'בנק לאומי',
      bankCode: '10',
      branch: '983',
      branchName: 'באקה',
      account: '2710621',
      owner: 'עו״ד מוחמד מ. קבהא',
    },
  })
})

/* ===================== PUBLIC: Stripe checkout ================== */
// Canonical price list (server-side, in ILS) — never trust client amounts.
// Amounts are the BASE price (excluding VAT); VAT is added at checkout.
const VAT_RATE = 0.18 // מע״מ בישראל, נכון ל-2026
const PRICING = {
  // בדיקת/החזר עיקול = חינם + עמלת הצלחה (25%+מע״מ) — לא נגבה מראש, לכן אינו כאן.
  'single-form': { name: 'הכנת טופס בודד + שליחה (לפי סוג התיק/הטופס)', amount: 399 },
  'form-set': { name: 'סט טפסים לתיק (לפי סוג התיק)', amount: 899 },
}
app.post('/api/create-checkout', async (req, res) => {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    res.json({ needsKey: true })
    return
  }
  const tier = String(req.body?.tier || '')
  const item = PRICING[tier]
  if (!item) {
    res.status(400).json({ error: 'שירות לא מזוהה' })
    return
  }
  try {
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(key)
    const origin = req.headers.origin || `https://${req.headers.host}`
    const gross = Math.round(item.amount * (1 + VAT_RATE) * 100) // base + 18% VAT, in agorot
    const vatPct = Math.round(VAT_RATE * 100)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'ils',
            product_data: { name: `${item.name} — ₪${item.amount} + מע״מ ${vatPct}%` },
            unit_amount: gross,
          },
          quantity: 1,
        },
      ],
      // Apple Pay / Google Pay appear automatically on Stripe's hosted Checkout.
      success_url: `${origin}/?paid=1#pricing`,
      cancel_url: `${origin}/#pricing`,
      metadata: { tier, itemName: item.name, baseAmount: String(item.amount), vatPct: String(vatPct) },
    })
    appendAudit({ area: 'payments', action: 'checkout_created', actor: 'public', detail: `${item.name} | ₪${item.amount}+מע״מ` })
    res.json({ url: session.url })
  } catch (e) {
    res.json({ error: 'stripe_error', detail: String(e?.message || e).slice(0, 200) })
  }
})

/* ===================== STAFF: authentication ===================== */
app.post('/api/staff/login', (req, res) => {
  const { username, pin } = req.body || {}
  const settings = load('settings', {})
  const users = load('staffUsers', [])
  const user = users.find((u) => u.username.toLowerCase() === String(username || '').toLowerCase())

  const logSecurity = (action, detail) =>
    appendAudit({ area: 'security', action, actor: 'staff', username: String(username || ''), detail })

  if (!user) {
    logSecurity('login_failed', 'משתמש לא קיים')
    res.status(401).json({ error: 'שם משתמש או קוד שגויים' })
    return
  }
  if (user.lockUntil && user.lockUntil > Date.now()) {
    res.status(423).json({ error: 'המשתמש נעול זמנית עקב ניסיונות כושלים' })
    return
  }

  const ok = hashPin(pin) === user.pinHash
  if (!ok) {
    user.failCount = (user.failCount || 0) + 1
    if (user.failCount >= 5) user.lockUntil = Date.now() + 10 * 60 * 1000
    save('staffUsers', users)
    logSecurity('login_failed', `קוד שגוי (${user.failCount})`)
    res.status(401).json({ error: 'שם משתמש או קוד שגויים' })
    return
  }

  user.failCount = 0
  user.lockUntil = 0
  save('staffUsers', users)
  const { token, expiresAt } = createSession(user, settings.sessionMinutes)
  logSecurity('login_success', `${user.username} נכנס למערכת`)
  res.json({ token, expiresAt, user: { username: user.username, role: user.role, displayName: user.displayName || user.username } })
})

app.post('/api/staff/logout', requireStaff, (req, res) => {
  sessions.delete(req.staff.token)
  res.json({ success: true })
})

app.get('/api/staff/me', requireStaff, (req, res) => {
  res.json({ user: { username: req.staff.username, role: req.staff.role, displayName: req.staff.displayName } })
})

/* ===================== STAFF: leads management =================== */
app.get('/api/leads', requireStaff, (req, res) => {
  const status = req.query.status
  let leads = load('leads', [])
  if (status && status !== 'all') leads = leads.filter((l) => l.status === status)
  res.json({ leads })
})

app.patch('/api/leads/:id', requireStaff, (req, res) => {
  const { id } = req.params
  const { status, owner, note, followUp } = req.body || {}
  const leads = load('leads', [])
  const lead = leads.find((l) => l.id === id)
  if (!lead) {
    res.status(404).json({ error: 'פנייה לא נמצאה' })
    return
  }
  const before = lead.status
  if (typeof status === 'string') lead.status = status
  if (typeof owner === 'string') lead.owner = owner
  if (typeof note === 'string') lead.note = note
  if (typeof followUp === 'string') lead.followUp = followUp
  lead.updatedAt = new Date().toISOString()
  save('leads', leads)
  appendAudit({ area: 'leads', action: 'lead_updated', actor: req.staff.username, detail: `${lead.name} | ${before} -> ${lead.status}`, refId: lead.id })
  res.json({ success: true, lead })
})

// CRM overview — funnel metrics for the dashboard.
app.get('/api/crm/overview', requireStaff, (_req, res) => {
  const leads = load('leads', [])
  const audit = load('audit', [])
  const byStatus = (s) => leads.filter((l) => l.status === s).length
  const refunds = leads.filter((l) => l.type === 'refund' || l.source === 'בקשת החזר')
  const overpaidTotal = refunds.reduce((sum, l) => sum + (Number(l.refund?.estimatedOverpaid) || 0), 0)
  const payments = audit.filter((a) => a.action === 'checkout_created')
  const analyses = audit.filter((a) => a.action === 'ai_analyze').length
  const total = leads.length
  const closed = byStatus('closed')
  const converted = leads.filter((l) => l.status === 'booked' || l.status === 'closed').length
  res.json({
    leads: { total, new: byStatus('new'), active: byStatus('active'), booked: byStatus('booked'), closed },
    conversionRate: total ? Math.round((converted / total) * 100) : 0,
    refunds: { count: refunds.length, estimatedTotal: overpaidTotal },
    payments: { count: payments.length },
    aiAnalyses: analyses,
    fromSite: leads.filter((l) => l.source === 'אתר').length,
  })
})

// Refund requests (a filtered leads view for the CRM).
app.get('/api/crm/refunds', requireStaff, (_req, res) => {
  const leads = load('leads', [])
  res.json({ refunds: leads.filter((l) => l.type === 'refund' || l.source === 'בקשת החזר') })
})

// Payments feed (from audit).
app.get('/api/crm/payments', requireStaff, (_req, res) => {
  const audit = load('audit', [])
  res.json({ payments: audit.filter((a) => ['checkout_created', 'payment_completed', 'invoice_issued'].includes(a.action)).slice(0, 100) })
})

app.delete('/api/leads/:id', requireStaff, (req, res) => {
  const { id } = req.params
  const leads = load('leads', [])
  const target = leads.find((l) => l.id === id)
  if (!target) {
    res.status(404).json({ error: 'פנייה לא נמצאה' })
    return
  }
  save('leads', leads.filter((l) => l.id !== id))
  appendAudit({ area: 'leads', action: 'lead_deleted', actor: req.staff.username, detail: target.name, refId: id })
  res.json({ success: true })
})

/* ===================== STAFF: client management ================ */
// Real clients (with access codes) — created here, never seeded as demo.
app.get('/api/crm/clients', requireStaff, (_req, res) => {
  const clients = readJson(path.join(dataDir, 'clients.json'), [])
  res.json({ clients })
})

app.post('/api/crm/clients', requireStaff, (req, res) => {
  const { name, phone, email } = req.body || {}
  if (!name || !String(name).trim()) {
    res.status(400).json({ error: 'נדרש שם לקוח' })
    return
  }
  const f = path.join(dataDir, 'clients.json')
  const clients = readJson(f, [])
  const client = {
    profileId: genProfileId(),
    caseId: genCaseId(),
    name: String(name).trim(),
    phone: String(phone || '').trim(),
    email: String(email || '').trim(),
    code: genAccessCode(),
    createdAt: new Date().toISOString(),
  }
  clients.unshift(client)
  writeJson(f, clients)
  appendAudit({ area: 'client', action: 'client_created', actor: req.staff.username, profileId: client.profileId, detail: `${client.name} | ${client.caseId}` })
  res.status(201).json({ client })
})

// Convert an existing lead into a client (creates access code, marks lead booked).
app.post('/api/crm/leads/:id/convert', requireStaff, (req, res) => {
  const leads = load('leads', [])
  const lead = leads.find((l) => l.id === req.params.id)
  if (!lead) {
    res.status(404).json({ error: 'פנייה לא נמצאה' })
    return
  }
  const f = path.join(dataDir, 'clients.json')
  const clients = readJson(f, [])
  const client = {
    profileId: genProfileId(),
    caseId: genCaseId(),
    name: lead.name,
    phone: lead.phone || '',
    email: lead.email || '',
    code: genAccessCode(),
    createdAt: new Date().toISOString(),
    fromLeadId: lead.id,
  }
  clients.unshift(client)
  writeJson(f, clients)
  lead.status = 'booked'
  save('leads', leads)
  appendAudit({ area: 'client', action: 'client_converted', actor: req.staff.username, profileId: client.profileId, detail: `${client.name} | ${client.caseId}` })
  res.status(201).json({ client })
})

app.post('/api/crm/clients/:profileId/regenerate-code', requireStaff, (req, res) => {
  const f = path.join(dataDir, 'clients.json')
  const clients = readJson(f, [])
  const client = clients.find((c) => c.profileId === req.params.profileId)
  if (!client) {
    res.status(404).json({ error: 'לקוח לא נמצא' })
    return
  }
  client.code = genAccessCode()
  writeJson(f, clients)
  appendAudit({ area: 'client', action: 'client_code_regenerated', actor: req.staff.username, profileId: client.profileId, detail: client.name })
  res.json({ client })
})

app.delete('/api/crm/clients/:profileId', requireStaff, (req, res) => {
  const f = path.join(dataDir, 'clients.json')
  const clients = readJson(f, [])
  const idx = clients.findIndex((c) => c.profileId === req.params.profileId)
  if (idx === -1) {
    res.status(404).json({ error: 'לקוח לא נמצא' })
    return
  }
  const [removed] = clients.splice(idx, 1)
  writeJson(f, clients)
  appendAudit({ area: 'client', action: 'client_deleted', actor: req.staff.username, profileId: removed.profileId, detail: removed.name })
  res.json({ success: true })
})

/* ===================== STAFF: calendar events =================== */
app.get('/api/events', requireStaff, (_req, res) => res.json({ events: load('events', []) }))

app.post('/api/events', requireStaff, (req, res) => {
  const { title, date, type } = req.body || {}
  if (!title || !date) {
    res.status(400).json({ error: 'נדרשים כותרת ותאריך' })
    return
  }
  const event = { id: genId('evt'), title: String(title), date: String(date), type: String(type || 'משימה'), done: false }
  const events = load('events', [])
  save('events', [event, ...events])
  appendAudit({ area: 'events', action: 'event_created', actor: req.staff.username, detail: `${event.title} | ${event.date}`, refId: event.id })
  res.status(201).json({ success: true, event })
})

app.patch('/api/events/:id', requireStaff, (req, res) => {
  const { id } = req.params
  const events = load('events', [])
  const event = events.find((e) => e.id === id)
  if (!event) {
    res.status(404).json({ error: 'מועד לא נמצא' })
    return
  }
  if (typeof req.body?.done === 'boolean') event.done = req.body.done
  if (typeof req.body?.title === 'string') event.title = req.body.title
  if (typeof req.body?.date === 'string') event.date = req.body.date
  if (typeof req.body?.type === 'string') event.type = req.body.type
  save('events', events)
  appendAudit({ area: 'events', action: 'event_updated', actor: req.staff.username, detail: event.title, refId: event.id })
  res.json({ success: true, event })
})

app.delete('/api/events/:id', requireStaff, (req, res) => {
  const { id } = req.params
  const events = load('events', [])
  if (!events.some((e) => e.id === id)) {
    res.status(404).json({ error: 'מועד לא נמצא' })
    return
  }
  save('events', events.filter((e) => e.id !== id))
  appendAudit({ area: 'events', action: 'event_deleted', actor: req.staff.username, detail: id, refId: id })
  res.json({ success: true })
})

/* ===================== STAFF: hearings ========================== */
app.get('/api/hearings', requireStaff, (_req, res) => res.json({ hearings: load('hearings', []) }))

app.post('/api/hearings', requireStaff, (req, res) => {
  const { caseRef, date, court, docs } = req.body || {}
  if (!caseRef || !date) {
    res.status(400).json({ error: 'נדרשים מספר תיק ותאריך' })
    return
  }
  const hearing = {
    id: genId('hrg'),
    caseRef: String(caseRef),
    date: String(date),
    court: String(court || ''),
    docs: Array.isArray(docs) ? docs.map((d) => ({ name: String(d.name || d), ok: !!d.ok })) : [],
  }
  const hearings = load('hearings', [])
  save('hearings', [hearing, ...hearings])
  appendAudit({ area: 'hearings', action: 'hearing_created', actor: req.staff.username, detail: `${hearing.caseRef} | ${hearing.date} | ${hearing.court}`, refId: hearing.id })
  res.status(201).json({ success: true, hearing })
})

app.patch('/api/hearings/:id', requireStaff, (req, res) => {
  const { id } = req.params
  const hearings = load('hearings', [])
  const hearing = hearings.find((h) => h.id === id)
  if (!hearing) {
    res.status(404).json({ error: 'דיון לא נמצא' })
    return
  }
  const { docIndex, docOk, caseRef, date, court } = req.body || {}
  if (typeof docIndex === 'number' && hearing.docs[docIndex]) hearing.docs[docIndex].ok = !!docOk
  if (typeof caseRef === 'string') hearing.caseRef = caseRef
  if (typeof date === 'string') hearing.date = date
  if (typeof court === 'string') hearing.court = court
  save('hearings', hearings)
  appendAudit({ area: 'hearings', action: 'hearing_updated', actor: req.staff.username, detail: hearing.caseRef, refId: hearing.id })
  res.json({ success: true, hearing })
})

app.delete('/api/hearings/:id', requireStaff, (req, res) => {
  const { id } = req.params
  const hearings = load('hearings', [])
  if (!hearings.some((h) => h.id === id)) {
    res.status(404).json({ error: 'דיון לא נמצא' })
    return
  }
  save('hearings', hearings.filter((h) => h.id !== id))
  appendAudit({ area: 'hearings', action: 'hearing_deleted', actor: req.staff.username, detail: id, refId: id })
  res.json({ success: true })
})

/* ===================== STAFF: tasks ============================= */
app.get('/api/tasks', requireStaff, (_req, res) => res.json({ tasks: load('tasks', []) }))

app.post('/api/tasks', requireStaff, (req, res) => {
  const { title, due, owner } = req.body || {}
  if (!title) {
    res.status(400).json({ error: 'נדרשת כותרת' })
    return
  }
  const task = { id: genId('task'), title: String(title), due: String(due || ''), owner: String(owner || ''), done: false, createdAt: new Date().toISOString() }
  const tasks = load('tasks', [])
  save('tasks', [task, ...tasks])
  appendAudit({ area: 'tasks', action: 'task_created', actor: req.staff.username, detail: task.title, refId: task.id })
  res.status(201).json({ success: true, task })
})

app.patch('/api/tasks/:id', requireStaff, (req, res) => {
  const { id } = req.params
  const tasks = load('tasks', [])
  const task = tasks.find((t) => t.id === id)
  if (!task) {
    res.status(404).json({ error: 'משימה לא נמצאה' })
    return
  }
  if (typeof req.body?.done === 'boolean') task.done = req.body.done
  if (typeof req.body?.title === 'string') task.title = req.body.title
  if (typeof req.body?.due === 'string') task.due = req.body.due
  if (typeof req.body?.owner === 'string') task.owner = req.body.owner
  save('tasks', tasks)
  res.json({ success: true, task })
})

app.delete('/api/tasks/:id', requireStaff, (req, res) => {
  const { id } = req.params
  const tasks = load('tasks', [])
  save('tasks', tasks.filter((t) => t.id !== id))
  res.json({ success: true })
})

/* ===================== STAFF: settings ========================= */
app.get('/api/settings', requireStaff, (_req, res) => res.json({ settings: load('settings', {}) }))

app.put('/api/settings', requireStaff, (req, res) => {
  if (req.staff.role !== 'admin') {
    res.status(403).json({ error: 'נדרשת הרשאת מנהל' })
    return
  }
  const current = load('settings', {})
  const allowed = ['officeName', 'brandName', 'alertDays', 'notificationsEnabled', 'dailyDigestEnabled', 'autoLockMinutes', 'sessionMinutes', 'reportSignature', 'reportLogoUrl', 'contactEmail', 'contactPhone']
  const next = { ...current }
  for (const key of allowed) {
    if (key in (req.body || {})) next[key] = req.body[key]
  }
  save('settings', next)
  appendAudit({ area: 'settings', action: 'settings_updated', actor: req.staff.username, detail: 'עודכנו הגדרות משרד' })
  res.json({ success: true, settings: next })
})

// Public: office contact info for the site footer/contact section.
app.get('/api/public/office', (_req, res) => {
  const s = load('settings', {})
  res.json({ officeName: s.officeName || '', brandName: s.brandName || 'MyAttorney', contactEmail: s.contactEmail || '', contactPhone: s.contactPhone || '' })
})

/* ===================== STAFF: reports (CSV) ===================== */
app.get('/api/reports/leads.csv', requireStaff, (_req, res) => {
  const leads = load('leads', [])
  const header = ['name', 'phone', 'email', 'topic', 'urgency', 'status', 'owner', 'source', 'createdAt']
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = leads.map((l) => header.map((h) => escape(l[h])).join(','))
  const csv = '﻿' + [header.join(','), ...rows].join('\n')
  appendAudit({ area: 'reports', action: 'export_csv', actor: 'staff', detail: `דוח פניות (${leads.length})` })
  res.setHeader('Content-Type', 'text/csv; charset=utf-8')
  res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"')
  res.send(csv)
})

/* ===================== Unified audit feed ====================== */
app.get('/api/audit', requireStaff, (req, res) => {
  const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 50))
  const area = req.query.area
  let logs = load('audit', [])
  if (area && area !== 'all') logs = logs.filter((l) => l.area === area)
  res.json({ logs: logs.slice(0, limit) })
})

/* =============================================================== *
 * CLIENT PORTAL (Version B) — documents, dispatches, per-profile
 * =============================================================== */
app.get('/api/dispatches/:profileId', (req, res) => {
  const { profileId } = req.params
  const dispatches = load('dispatches', []).filter((item) => item.profileId === profileId)
  res.json({ dispatches })
})

app.get('/api/documents/:profileId', (req, res) => {
  const { profileId } = req.params
  const documents = load('documents', [])
    .filter((item) => item.profileId === profileId)
    .map((item) => ({
      id: item.id,
      profileId: item.profileId,
      caseId: item.caseId,
      category: item.category,
      status: item.status || 'חדש',
      createdAt: item.createdAt,
      documentName: item.documentName,
      storedFileName: item.storedFileName,
      mimeType: item.mimeType,
      size: item.size,
      uploadedAt: item.uploadedAt,
      fileUrl: `/uploads/${item.storedFileName}`,
    }))
  res.json({ documents })
})

// Per-profile audit (client portal view) — reads from unified audit by profileId.
app.get('/api/audit/:profileId', (req, res) => {
  const { profileId } = req.params
  const limit = Math.max(1, Number(req.query.limit) || 20)
  const logs = load('audit', [])
    .filter((item) => item.profileId === profileId)
    .slice(0, limit)
  res.json({ logs })
})

app.post('/api/documents/status', (req, res) => {
  const { profileId, documentIds, status } = req.body || {}
  if (!profileId || !Array.isArray(documentIds) || documentIds.length === 0 || !status) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }
  const current = load('documents', [])
  let updatedCount = 0
  const next = current.map((item) => {
    if (item.profileId !== profileId || !documentIds.includes(item.id)) return item
    updatedCount += 1
    return { ...item, status, statusUpdatedAt: new Date().toISOString() }
  })
  if (updatedCount === 0) {
    res.status(404).json({ error: 'Documents not found' })
    return
  }
  save('documents', next)
  appendAudit({ area: 'documents', profileId, action: 'status_update', actor: 'client', documentIds, status, note: `Updated ${updatedCount} documents to ${status}` })
  res.json({ success: true, updatedCount })
})

app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params
  const profileId = typeof req.query.profileId === 'string' ? req.query.profileId : ''
  if (!id || !profileId) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }
  const current = load('documents', [])
  const target = current.find((item) => item.id === id && item.profileId === profileId)
  if (!target) {
    res.status(404).json({ error: 'Document not found' })
    return
  }
  save('documents', current.filter((item) => !(item.id === id && item.profileId === profileId)))
  if (target.storedFileName) {
    const filePath = path.join(uploadsDirPath, target.storedFileName)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
  appendAudit({ area: 'documents', profileId, action: 'delete_document', actor: 'client', documentId: id, documentName: target.documentName, status: target.status || 'חדש' })
  res.json({ success: true, id })
})

app.post('/api/documents', upload.single('file'), (req, res) => {
  const { profileId, caseId, category, profileName } = req.body || {}
  const { file } = req
  if (!profileId || !caseId || !file) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }
  const now = new Date().toISOString()
  const documentRecord = {
    id: genId(profileId),
    profileId,
    caseId,
    category: category || 'אחר',
    status: 'חדש',
    documentName: file.originalname,
    storedFileName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date(now).toLocaleString('he-IL'),
    createdAt: now,
  }
  const current = load('documents', [])
  save('documents', [documentRecord, ...current])
  appendAudit({ area: 'documents', profileId, action: 'upload_document', actor: 'client', documentId: documentRecord.id, documentName: documentRecord.documentName, status: documentRecord.status, note: profileName || '' })
  res.status(201).json({ documentName: documentRecord.documentName, document: { ...documentRecord, fileUrl: `/uploads/${documentRecord.storedFileName}` } })
})

app.post('/api/dispatches', (req, res) => {
  const { profileId, profileName, caseId, packet } = req.body || {}
  if (!profileId || !caseId || !packet || !packet.title) {
    res.status(400).json({ error: 'Missing required fields' })
    return
  }
  const now = new Date().toISOString()
  const dispatch = {
    id: genId(profileId),
    profileId,
    profileName: profileName || '',
    caseId,
    title: packet.title,
    sentAt: new Date(now).toLocaleString('he-IL'),
    status: 'נשלח למשרד',
    createdAt: now,
    packet,
  }
  const current = load('dispatches', [])
  save('dispatches', [dispatch, ...current])
  appendAudit({ area: 'dispatches', profileId, action: 'dispatch_packet', actor: 'client', dispatchId: dispatch.id, status: dispatch.status, note: dispatch.title })
  res.status(201).json({ dispatch })
})

/* ===================== Serve built frontend ==================== */
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health') return next()
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`MyAttorney unified API + site listening on http://localhost:${port}`)
})
