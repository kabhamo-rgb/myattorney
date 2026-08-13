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
    // pinHash is base64 of the PIN (matches original export format). Default admin PIN = 1234.
    save('staffUsers', [
      { username: 'admin', role: 'admin', displayName: 'מנהל משרד', pinHash: Buffer.from('1234').toString('base64'), failCount: 0, lockUntil: 0 },
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
    admin.pinHash = Buffer.from(String(process.env.ADMIN_PIN)).toString('base64')
    admin.failCount = 0
    admin.lockUntil = 0
    save('staffUsers', users)
  }
}

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
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

/* ===================== PUBLIC: refund requests =================== */
// Registered + consented request that the FIRM handles. Does not file anything
// with any authority automatically. Stored as a lead so staff can act on it.
app.post('/api/refund-requests', (req, res) => {
  const { fullName, idNumber, phone, email, consent, details } = req.body || {}
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
    status: 'new',
    owner: '',
    source: 'בקשת החזר',
    createdAt: now,
  }
  const current = load('leads', [])
  save('leads', [lead, ...current])
  appendAudit({ area: 'leads', action: 'refund_request', actor: 'public', detail: `${lead.name} | החזר עיקול${lead.refund.estimatedOverpaid ? ` | ~₪${lead.refund.estimatedOverpaid}` : ''}`, refId: lead.id })
  res.status(201).json({ success: true, id: lead.id })
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

  const ok = Buffer.from(String(pin || '')).toString('base64') === user.pinHash
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
  const { status, owner } = req.body || {}
  const leads = load('leads', [])
  const lead = leads.find((l) => l.id === id)
  if (!lead) {
    res.status(404).json({ error: 'פנייה לא נמצאה' })
    return
  }
  const before = lead.status
  if (typeof status === 'string') lead.status = status
  if (typeof owner === 'string') lead.owner = owner
  lead.updatedAt = new Date().toISOString()
  save('leads', leads)
  appendAudit({ area: 'leads', action: 'lead_updated', actor: req.staff.username, detail: `${lead.name} | ${before} -> ${lead.status}`, refId: lead.id })
  res.json({ success: true, lead })
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
