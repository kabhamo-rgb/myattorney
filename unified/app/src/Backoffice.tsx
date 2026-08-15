import { useCallback, useEffect, useMemo, useState } from 'react'
import './Backoffice.css'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const tokenKey = 'my-attorney-staff-token'

type StaffUser = { username: string; role: string; displayName: string }

type Lead = {
  id: string
  name: string
  phone?: string
  email?: string
  topic?: string
  urgency?: string
  message?: string
  status: string
  owner?: string
  source?: string
  createdAt?: string
  note?: string
  followUp?: string
  idNumber?: string
  type?: string
  refund?: { estimatedOverpaid?: number }
  signature?: string
  signedAt?: string
  powerOfAttorney?: boolean
  truthDeclared?: boolean
  attorney?: string
}

type Client = {
  profileId: string
  caseId: string
  name: string
  phone?: string
  email?: string
  code: string
  createdAt?: string
  fromLeadId?: string
}

type EventItem = { id: string; title: string; date: string; type: string; done: boolean }
type HearingDoc = { name: string; ok: boolean }
type Hearing = { id: string; caseRef: string; date: string; court: string; docs: HearingDoc[] }
type TaskItem = { id: string; title: string; due?: string; owner?: string; done: boolean }
type AuditItem = { id: string; area?: string; action: string; actor?: string; detail?: string; occurredAt: string }
type Settings = Record<string, string | number | boolean>

const leadStatusLabels: Record<string, string> = {
  new: 'חדש',
  active: 'בטיפול',
  booked: 'נקבעה פגישה',
  closed: 'סגור',
}
const leadStatusOrder = ['new', 'active', 'booked', 'closed']

const actionLabels: Record<string, string> = {
  lead_created: 'פנייה חדשה',
  lead_updated: 'עדכון פנייה',
  lead_deleted: 'מחיקת פנייה',
  event_created: 'נוסף מועד',
  event_updated: 'עדכון מועד',
  event_deleted: 'מחיקת מועד',
  hearing_created: 'נוסף דיון',
  hearing_updated: 'עדכון דיון',
  hearing_deleted: 'מחיקת דיון',
  task_created: 'נוספה משימה',
  settings_updated: 'עדכון הגדרות',
  export_csv: 'ייצוא CSV',
  login_success: 'התחברות',
  login_failed: 'כשלון התחברות',
  upload_document: 'העלאת מסמך',
  delete_document: 'מחיקת מסמך',
  status_update: 'עדכון סטטוס',
  dispatch_packet: 'שליחת סט טפסים',
}

const fmtDate = (iso?: string) => {
  if (!iso) return '-'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('he-IL')
}

function Backoffice() {
  const [token, setToken] = useState<string | null>(() => window.localStorage.getItem(tokenKey))
  const [user, setUser] = useState<StaffUser | null>(null)
  const [loginData, setLoginData] = useState({ username: 'admin', pin: '' })
  const [loginError, setLoginError] = useState('')
  const [tab, setTab] = useState<'dashboard' | 'leads' | 'refunds' | 'clients' | 'calendar' | 'hearings' | 'tasks' | 'audit' | 'settings'>('dashboard')

  const [leads, setLeads] = useState<Lead[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [hearings, setHearings] = useState<Hearing[]>([])
  const [tasks, setTasks] = useState<TaskItem[]>([])
  const [audit, setAudit] = useState<AuditItem[]>([])
  const [settings, setSettings] = useState<Settings>({})
  const [notice, setNotice] = useState('')
  const [overview, setOverview] = useState<any>(null)
  const [clients, setClients] = useState<Client[]>([])

  const authFetch = useCallback(
    async (path: string, options: RequestInit = {}) => {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        ...options,
        headers: {
          ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      })
      if (response.status === 401) {
        window.localStorage.removeItem(tokenKey)
        setToken(null)
        setUser(null)
        throw new Error('session-expired')
      }
      return response
    },
    [token],
  )

  const refreshAll = useCallback(async () => {
    if (!token) return
    try {
      const [l, e, h, t, a, s, ov, cl] = await Promise.all([
        authFetch('/api/leads').then((r) => r.json()),
        authFetch('/api/events').then((r) => r.json()),
        authFetch('/api/hearings').then((r) => r.json()),
        authFetch('/api/tasks').then((r) => r.json()),
        authFetch('/api/audit?limit=80').then((r) => r.json()),
        authFetch('/api/settings').then((r) => r.json()),
        authFetch('/api/crm/overview').then((r) => r.json()).catch(() => null),
        authFetch('/api/crm/clients').then((r) => r.json()).catch(() => null),
      ])
      setClients(cl?.clients || [])
      setLeads(l.leads || [])
      setEvents(e.events || [])
      setHearings(h.hearings || [])
      setTasks(t.tasks || [])
      setAudit(a.logs || [])
      setSettings(s.settings || {})
      setOverview(ov || null)
    } catch {
      /* handled by authFetch (401) */
    }
  }, [authFetch, token])

  useEffect(() => {
    if (!token) return
    authFetch('/api/staff/me')
      .then((r) => r.json())
      .then((d) => setUser(d.user))
      .catch(() => undefined)
    refreshAll()
  }, [token, authFetch, refreshAll])

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoginError('')
    try {
      const response = await fetch(`${apiBaseUrl}/api/staff/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })
      const data = await response.json()
      if (!response.ok) {
        setLoginError(data.error || 'התחברות נכשלה')
        return
      }
      window.localStorage.setItem(tokenKey, data.token)
      setToken(data.token)
      setUser(data.user)
      setLoginData({ username: 'admin', pin: '' })
    } catch {
      setLoginError('השרת אינו זמין כרגע')
    }
  }

  const handleLogout = async () => {
    try {
      await authFetch('/api/staff/logout', { method: 'POST' })
    } catch {
      /* ignore */
    }
    window.localStorage.removeItem(tokenKey)
    setToken(null)
    setUser(null)
  }

  const flash = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2500)
  }

  /* ---- Lead actions ---- */
  const updateLead = async (id: string, patch: Partial<Lead>) => {
    await authFetch(`/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
    refreshAll()
  }
  const deleteLead = async (id: string) => {
    await authFetch(`/api/leads/${id}`, { method: 'DELETE' })
    refreshAll()
    flash('הפנייה נמחקה')
  }
  const exportCsv = async () => {
    const response = await authFetch('/api/reports/leads.csv')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'leads.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  /* ---- Client actions ---- */
  const [clientForm, setClientForm] = useState({ name: '', phone: '', email: '' })
  const addClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientForm.name.trim()) return
    const res = await authFetch('/api/crm/clients', { method: 'POST', body: JSON.stringify(clientForm) })
    if (res.ok) {
      const data = await res.json()
      setClientForm({ name: '', phone: '', email: '' })
      await refreshAll()
      flash(`נוצר לקוח: תיק ${data.client.caseId} · קוד ${data.client.code}`)
    }
  }
  const convertLead = async (id: string) => {
    const res = await authFetch(`/api/crm/leads/${id}/convert`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      await refreshAll()
      flash(`הפנייה הומרה ללקוח: תיק ${data.client.caseId} · קוד ${data.client.code}`)
    }
  }
  const regenerateCode = async (profileId: string) => {
    const res = await authFetch(`/api/crm/clients/${profileId}/regenerate-code`, { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      await refreshAll()
      flash(`קוד גישה חדש: ${data.client.code}`)
    }
  }
  const deleteClient = async (profileId: string) => {
    await authFetch(`/api/crm/clients/${profileId}`, { method: 'DELETE' })
    refreshAll()
    flash('הלקוח הוסר')
  }
  const copyText = (text: string) => {
    try { navigator.clipboard?.writeText(text) } catch { /* ignore */ }
    flash('הועתק')
  }

  /* ---- Event actions ---- */
  const [eventForm, setEventForm] = useState({ title: '', date: '', type: 'דיון' })
  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventForm.title || !eventForm.date) return
    await authFetch('/api/events', { method: 'POST', body: JSON.stringify(eventForm) })
    setEventForm({ title: '', date: '', type: 'דיון' })
    refreshAll()
  }
  const toggleEvent = async (ev: EventItem) => {
    await authFetch(`/api/events/${ev.id}`, { method: 'PATCH', body: JSON.stringify({ done: !ev.done }) })
    refreshAll()
  }
  const deleteEvent = async (id: string) => {
    await authFetch(`/api/events/${id}`, { method: 'DELETE' })
    refreshAll()
  }

  /* ---- Hearing actions ---- */
  const [hearingForm, setHearingForm] = useState({ caseRef: '', date: '', court: 'מחוזי', docs: 'טיוטת טיעון, נספחים, אימות לקוח' })
  const addHearing = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hearingForm.caseRef || !hearingForm.date) return
    const docs = hearingForm.docs.split(',').map((n) => ({ name: n.trim(), ok: false })).filter((d) => d.name)
    await authFetch('/api/hearings', { method: 'POST', body: JSON.stringify({ ...hearingForm, docs }) })
    setHearingForm({ caseRef: '', date: '', court: 'מחוזי', docs: 'טיוטת טיעון, נספחים, אימות לקוח' })
    refreshAll()
  }
  const toggleHearingDoc = async (h: Hearing, docIndex: number) => {
    await authFetch(`/api/hearings/${h.id}`, { method: 'PATCH', body: JSON.stringify({ docIndex, docOk: !h.docs[docIndex].ok }) })
    refreshAll()
  }
  const deleteHearing = async (id: string) => {
    await authFetch(`/api/hearings/${id}`, { method: 'DELETE' })
    refreshAll()
  }

  /* ---- Task actions ---- */
  const [taskForm, setTaskForm] = useState({ title: '', due: '', owner: '' })
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskForm.title) return
    await authFetch('/api/tasks', { method: 'POST', body: JSON.stringify(taskForm) })
    setTaskForm({ title: '', due: '', owner: '' })
    refreshAll()
  }
  const toggleTask = async (t: TaskItem) => {
    await authFetch(`/api/tasks/${t.id}`, { method: 'PATCH', body: JSON.stringify({ done: !t.done }) })
    refreshAll()
  }
  const deleteTask = async (id: string) => {
    await authFetch(`/api/tasks/${id}`, { method: 'DELETE' })
    refreshAll()
  }

  /* ---- Settings ---- */
  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const response = await authFetch('/api/settings', { method: 'PUT', body: JSON.stringify(settings) })
    if (response.ok) flash('ההגדרות נשמרו')
    else {
      const d = await response.json().catch(() => ({}))
      flash(d.error || 'שמירה נכשלה')
    }
  }

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    return {
      newLeads: leads.filter((l) => l.status === 'new').length,
      activeLeads: leads.filter((l) => l.status === 'active').length,
      todayEvents: events.filter((e) => e.date === today && !e.done).length,
      upcomingHearings: hearings.filter((h) => h.date >= today).length,
      openTasks: tasks.filter((t) => !t.done).length,
    }
  }, [leads, events, hearings, tasks])

  /* -------------------- Login screen -------------------- */
  if (!token) {
    return (
      <div className="bo-login-shell" dir="rtl">
        <div className="bo-login-card">
          <div className="bo-login-brand">קו-הדין · אזור צוות</div>
          <h1>כניסת צוות המשרד</h1>
          <p className="bo-login-sub">מערכת ניהול פניות, יומן, דיונים והגדרות משרד.</p>
          <form onSubmit={handleLogin}>
            <label>
              שם משתמש
              <input value={loginData.username} onChange={(e) => setLoginData((c) => ({ ...c, username: e.target.value }))} autoComplete="username" />
            </label>
            <label>
              קוד גישה (PIN)
              <input type="password" value={loginData.pin} onChange={(e) => setLoginData((c) => ({ ...c, pin: e.target.value }))} autoComplete="current-password" />
            </label>
            {loginError && <p className="bo-error">{loginError}</p>}
            <button type="submit" className="bo-btn bo-btn-primary">כניסה</button>
          </form>
          <a className="bo-back-link" href="#top" onClick={() => { window.location.hash = ''; window.location.reload() }}>חזרה לאתר →</a>
        </div>
      </div>
    )
  }

  /* -------------------- Authenticated app -------------------- */
  const refundLeads = leads.filter((l) => (l as any).type === 'refund' || l.source === 'בקשת החזר')
  const tabs: Array<[typeof tab, string]> = [
    ['dashboard', 'לוח בקרה'],
    ['leads', `פניות (${leads.length})`],
    ['refunds', `בקשות החזר (${refundLeads.length})`],
    ['clients', `לקוחות (${clients.length})`],
    ['calendar', 'יומן'],
    ['hearings', 'דיונים'],
    ['tasks', 'משימות'],
    ['audit', 'פעילות'],
    ['settings', 'הגדרות'],
  ]

  return (
    <div className="bo-shell" dir="rtl">
      <aside className="bo-sidebar">
        <div className="bo-logo">{String(settings.officeName || 'קו-הדין')}</div>
        <nav>
          {tabs.map(([key, label]) => (
            <button key={key} className={tab === key ? 'bo-navitem active' : 'bo-navitem'} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="bo-user">
          <div>{user?.displayName || user?.username}</div>
          <div className="bo-role">{user?.role === 'admin' ? 'מנהל משרד' : 'עורך דין'}</div>
          <button className="bo-btn bo-btn-ghost" onClick={handleLogout}>יציאה</button>
          <a className="bo-btn bo-btn-ghost" href="#top" onClick={() => { window.location.hash = '' }}>לאתר הציבורי</a>
        </div>
      </aside>

      <main className="bo-main">
        {notice && <div className="bo-notice">{notice}</div>}

        {tab === 'dashboard' && (
          <section>
            <h2>לוח בקרה — CRM</h2>
            {overview && (() => {
              const estTotal = Number(overview.refunds?.estimatedTotal || 0)
              const revenuePotential = Math.round(estTotal * 0.25)
              const signedCount = refundLeads.filter((l) => (l as any).signature).length
              const authorizedCount = refundLeads.filter((l) => (l as any).powerOfAttorney).length
              const total = overview.leads?.total ?? 0
              const refundsCount = overview.refunds?.count ?? 0
              const closedCount = (overview.leads?.booked ?? 0) + (overview.leads?.closed ?? 0)
              const funnel = [
                { label: 'פניות', value: total, color: '#1d4ed8' },
                { label: 'בקשות החזר', value: refundsCount, color: '#0ea5e9' },
                { label: 'הרשאות חתומות', value: signedCount, color: '#16a34a' },
                { label: 'הוגשו / נסגרו', value: closedCount, color: '#7c3aed' },
              ]
              const maxV = Math.max(1, ...funnel.map((f) => f.value))
              return (
                <>
                  <h3>מדדים עסקיים</h3>
                  <div className="bo-stat-grid">
                    <div className="bo-stat"><strong>{total}</strong><span>סה"כ פניות</span></div>
                    <div className="bo-stat"><strong>{overview.aiAnalyses ?? 0}</strong><span>בדיקות AI</span></div>
                    <div className="bo-stat highlight"><strong>{refundsCount}</strong><span>בקשות החזר</span></div>
                    <div className="bo-stat"><strong>{signedCount}</strong><span>הרשאות חתומות</span></div>
                    <div className="bo-stat highlight"><strong>{'₪' + estTotal.toLocaleString('he-IL')}</strong><span>סכום החזר פוטנציאלי</span></div>
                    <div className="bo-stat revenue"><strong>{'₪' + revenuePotential.toLocaleString('he-IL')}</strong><span>שכ"ט פוטנציאלי (25%)</span></div>
                    <div className="bo-stat"><strong>{overview.conversionRate ?? 0}%</strong><span>שיעור המרה</span></div>
                    <div className="bo-stat"><strong>{authorizedCount}</strong><span>ייפויי כוח</span></div>
                  </div>

                  <h3>משפך המרה</h3>
                  <div className="bo-funnel">
                    {funnel.map((f) => (
                      <div key={f.label} className="bo-funnel-row">
                        <span className="bo-funnel-label">{f.label}</span>
                        <div className="bo-funnel-track">
                          <div className="bo-funnel-bar" style={{ width: `${Math.round((f.value / maxV) * 100)}%`, background: f.color }}>
                            <span>{f.value}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )
            })()}
            <h3>סטטוס עבודה</h3>
            <div className="bo-stat-grid">
              <div className="bo-stat"><strong>{stats.newLeads}</strong><span>פניות חדשות</span></div>
              <div className="bo-stat"><strong>{stats.activeLeads}</strong><span>פניות בטיפול</span></div>
              <div className="bo-stat"><strong>{stats.todayEvents}</strong><span>מועדים היום</span></div>
              <div className="bo-stat"><strong>{stats.upcomingHearings}</strong><span>דיונים קרובים</span></div>
              <div className="bo-stat"><strong>{stats.openTasks}</strong><span>משימות פתוחות</span></div>
            </div>
            <h3>פעילות אחרונה</h3>
            <ul className="bo-feed">
              {audit.slice(0, 8).map((a) => (
                <li key={a.id}>
                  <span className="bo-feed-action">{actionLabels[a.action] || a.action}</span>
                  <span className="bo-feed-detail">{a.detail}</span>
                  <span className="bo-feed-time">{fmtDate(a.occurredAt)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === 'leads' && (
          <section>
            <div className="bo-section-head">
              <h2>פניות ולידים</h2>
              <button className="bo-btn bo-btn-ghost" onClick={exportCsv}>ייצוא CSV</button>
            </div>
            <table className="bo-table">
              <thead>
                <tr><th>שם</th><th>טלפון</th><th>נושא</th><th>דחיפות</th><th>מקור</th><th>סטטוס</th><th>אחראי</th><th></th><th></th></tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td>{l.name}</td>
                    <td>{l.phone || l.email}</td>
                    <td>{l.topic}</td>
                    <td>{l.urgency}</td>
                    <td>{l.source}</td>
                    <td>
                      <select value={l.status} onChange={(e) => updateLead(l.id, { status: e.target.value })}>
                        {leadStatusOrder.map((s) => <option key={s} value={s}>{leadStatusLabels[s]}</option>)}
                      </select>
                    </td>
                    <td>
                      <input className="bo-owner" defaultValue={l.owner || ''} onBlur={(e) => e.target.value !== (l.owner || '') && updateLead(l.id, { owner: e.target.value })} placeholder="שיוך" />
                    </td>
                    <td><button className="bo-btn bo-btn-ghost" onClick={() => convertLead(l.id)} title="צור לקוח עם קוד גישה">→ לקוח</button></td>
                    <td><button className="bo-btn-x" onClick={() => deleteLead(l.id)}>✕</button></td>
                  </tr>
                ))}
                {leads.length === 0 && <tr><td colSpan={9} className="bo-empty">אין פניות עדיין</td></tr>}
              </tbody>
            </table>
          </section>
        )}

        {tab === 'refunds' && (
          <section>
            <div className="bo-section-head">
              <h2>בקשות החזר עיקול 💸</h2>
              <span className="bo-badge">פוטנציאל: ₪{Number(overview?.refunds?.estimatedTotal || 0).toLocaleString('he-IL')}</span>
            </div>
            <table className="bo-table">
              <thead>
                <tr><th>שם</th><th>ת"ז</th><th>טלפון</th><th>הערכת החזר</th><th>אישור + חתימה</th><th>סטטוס</th><th>מעקב</th><th>הערה</th></tr>
              </thead>
              <tbody>
                {refundLeads.map((l) => (
                  <tr key={l.id}>
                    <td>{l.name}</td>
                    <td>{(l as any).idNumber || '-'}</td>
                    <td>{l.phone || l.email}</td>
                    <td><strong>{(l as any).refund?.estimatedOverpaid ? '₪' + Number((l as any).refund.estimatedOverpaid).toLocaleString('he-IL') : '-'}</strong></td>
                    <td>
                      <div className="bo-consents">
                        {l.powerOfAttorney && <span className="bo-ok-tag">ייפוי כוח ✓</span>}
                        {l.truthDeclared && <span className="bo-ok-tag">הצהרה ✓</span>}
                        {l.signature ? (
                          <a href={l.signature} target="_blank" rel="noopener noreferrer" download={`signature-${l.name}.png`} title="פתח/הורד חתימה">
                            <img src={l.signature} alt="חתימה" className="bo-sig-thumb" />
                          </a>
                        ) : <span className="bo-no-tag">אין חתימה</span>}
                        {l.signedAt && <span className="bo-sig-time">{fmtDate(l.signedAt)}</span>}
                      </div>
                    </td>
                    <td>
                      <select value={l.status} onChange={(e) => updateLead(l.id, { status: e.target.value })}>
                        <option value="new">חדש</option>
                        <option value="active">בטיפול</option>
                        <option value="booked">הוגש</option>
                        <option value="closed">הוחזר / נסגר</option>
                      </select>
                    </td>
                    <td><input type="date" defaultValue={(l as any).followUp || ''} onBlur={(e) => updateLead(l.id, { followUp: e.target.value })} /></td>
                    <td><input className="bo-note" defaultValue={(l as any).note || ''} onBlur={(e) => updateLead(l.id, { note: e.target.value })} placeholder="הערה / סיכום שיחה" /></td>
                  </tr>
                ))}
                {refundLeads.length === 0 && <tr><td colSpan={8} className="bo-empty">אין בקשות החזר עדיין</td></tr>}
              </tbody>
            </table>
          </section>
        )}

        {tab === 'clients' && (
          <section>
            <div className="bo-section-head">
              <h2>לקוחות — קודי גישה לאזור האישי 🔐</h2>
              <span className="bo-badge">{clients.length} לקוחות פעילים</span>
            </div>
            <p className="bo-login-hint" style={{ marginBottom: 14 }}>
              יצירת לקוח מפיקה <strong>מספר תיק</strong> ו<strong>קוד גישה מאובטח</strong> אקראי. מסרו ללקוח את שני הפרטים — איתם הוא נכנס לאזור האישי (#client). ניתן להפיק קוד חדש בכל עת.
            </p>
            <form className="bo-inline-form" onSubmit={addClient}>
              <input value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} placeholder="שם הלקוח *" />
              <input value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} placeholder="טלפון" />
              <input value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} placeholder="אימייל" />
              <button className="bo-btn bo-btn-primary" type="submit">+ צור לקוח וקוד גישה</button>
            </form>
            <table className="bo-table">
              <thead>
                <tr><th>שם</th><th>מספר תיק</th><th>קוד גישה</th><th>טלפון</th><th>נוצר</th><th></th><th></th></tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.profileId}>
                    <td>{c.name}</td>
                    <td>
                      <code>{c.caseId}</code>{' '}
                      <button className="bo-btn-x" title="העתק" onClick={() => copyText(c.caseId)}>⧉</button>
                    </td>
                    <td>
                      <code style={{ fontWeight: 700, letterSpacing: '0.05em' }}>{c.code}</code>{' '}
                      <button className="bo-btn-x" title="העתק" onClick={() => copyText(c.code)}>⧉</button>
                    </td>
                    <td>{c.phone || c.email || '-'}</td>
                    <td className="bo-date">{fmtDate(c.createdAt)}</td>
                    <td><button className="bo-btn bo-btn-ghost" onClick={() => regenerateCode(c.profileId)} title="הפק קוד גישה חדש">קוד חדש</button></td>
                    <td><button className="bo-btn-x" onClick={() => deleteClient(c.profileId)}>✕</button></td>
                  </tr>
                ))}
                {clients.length === 0 && <tr><td colSpan={7} className="bo-empty">עדיין אין לקוחות — צרו לקוח ראשון למעלה, או המירו פנייה מלשונית "פניות"</td></tr>}
              </tbody>
            </table>
          </section>
        )}

        {tab === 'calendar' && (
          <section>
            <h2>יומן ומועדים</h2>
            <form className="bo-inline-form" onSubmit={addEvent}>
              <input placeholder="כותרת מועד" value={eventForm.title} onChange={(e) => setEventForm((c) => ({ ...c, title: e.target.value }))} />
              <input type="date" value={eventForm.date} onChange={(e) => setEventForm((c) => ({ ...c, date: e.target.value }))} />
              <select value={eventForm.type} onChange={(e) => setEventForm((c) => ({ ...c, type: e.target.value }))}>
                <option>דיון</option><option>הגשה</option><option>פגישה</option><option>תזכורת</option>
              </select>
              <button className="bo-btn bo-btn-primary" type="submit">הוסף</button>
            </form>
            <ul className="bo-list">
              {[...events].sort((a, b) => a.date.localeCompare(b.date)).map((ev) => (
                <li key={ev.id} className={ev.done ? 'done' : ''}>
                  <label><input type="checkbox" checked={ev.done} onChange={() => toggleEvent(ev)} /> <strong>{ev.title}</strong></label>
                  <span className="bo-badge">{ev.type}</span>
                  <span className="bo-date">{ev.date}</span>
                  <button className="bo-btn-x" onClick={() => deleteEvent(ev.id)}>✕</button>
                </li>
              ))}
              {events.length === 0 && <li className="bo-empty">אין מועדים</li>}
            </ul>
          </section>
        )}

        {tab === 'hearings' && (
          <section>
            <h2>דיונים ומוכנות תיק</h2>
            <form className="bo-inline-form" onSubmit={addHearing}>
              <input placeholder="מספר תיק / תיאור" value={hearingForm.caseRef} onChange={(e) => setHearingForm((c) => ({ ...c, caseRef: e.target.value }))} />
              <input type="date" value={hearingForm.date} onChange={(e) => setHearingForm((c) => ({ ...c, date: e.target.value }))} />
              <input placeholder="ערכאה" value={hearingForm.court} onChange={(e) => setHearingForm((c) => ({ ...c, court: e.target.value }))} />
              <input placeholder="מסמכים (מופרד בפסיק)" value={hearingForm.docs} onChange={(e) => setHearingForm((c) => ({ ...c, docs: e.target.value }))} />
              <button className="bo-btn bo-btn-primary" type="submit">הוסף</button>
            </form>
            <div className="bo-cards">
              {hearings.map((h) => {
                const ready = h.docs.filter((d) => d.ok).length
                return (
                  <div key={h.id} className="bo-card">
                    <div className="bo-card-head">
                      <strong>{h.caseRef}</strong>
                      <button className="bo-btn-x" onClick={() => deleteHearing(h.id)}>✕</button>
                    </div>
                    <div className="bo-card-meta">{h.court} · {h.date} · מוכנות {ready}/{h.docs.length}</div>
                    <ul className="bo-checklist">
                      {h.docs.map((d, i) => (
                        <li key={i}>
                          <label><input type="checkbox" checked={d.ok} onChange={() => toggleHearingDoc(h, i)} /> {d.name}</label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
              {hearings.length === 0 && <p className="bo-empty">אין דיונים</p>}
            </div>
          </section>
        )}

        {tab === 'tasks' && (
          <section>
            <h2>משימות</h2>
            <form className="bo-inline-form" onSubmit={addTask}>
              <input placeholder="משימה" value={taskForm.title} onChange={(e) => setTaskForm((c) => ({ ...c, title: e.target.value }))} />
              <input type="date" value={taskForm.due} onChange={(e) => setTaskForm((c) => ({ ...c, due: e.target.value }))} />
              <input placeholder="אחראי" value={taskForm.owner} onChange={(e) => setTaskForm((c) => ({ ...c, owner: e.target.value }))} />
              <button className="bo-btn bo-btn-primary" type="submit">הוסף</button>
            </form>
            <ul className="bo-list">
              {tasks.map((t) => (
                <li key={t.id} className={t.done ? 'done' : ''}>
                  <label><input type="checkbox" checked={t.done} onChange={() => toggleTask(t)} /> <strong>{t.title}</strong></label>
                  {t.owner && <span className="bo-badge">{t.owner}</span>}
                  {t.due && <span className="bo-date">{t.due}</span>}
                  <button className="bo-btn-x" onClick={() => deleteTask(t.id)}>✕</button>
                </li>
              ))}
              {tasks.length === 0 && <li className="bo-empty">אין משימות</li>}
            </ul>
          </section>
        )}

        {tab === 'audit' && (
          <section>
            <h2>יומן פעילות מאוחד</h2>
            <table className="bo-table">
              <thead><tr><th>פעולה</th><th>פרטים</th><th>מבצע</th><th>אזור</th><th>מתי</th></tr></thead>
              <tbody>
                {audit.map((a) => (
                  <tr key={a.id}>
                    <td>{actionLabels[a.action] || a.action}</td>
                    <td>{a.detail}</td>
                    <td>{a.actor}</td>
                    <td>{a.area}</td>
                    <td>{fmtDate(a.occurredAt)}</td>
                  </tr>
                ))}
                {audit.length === 0 && <tr><td colSpan={5} className="bo-empty">אין פעילות</td></tr>}
              </tbody>
            </table>
          </section>
        )}

        {tab === 'settings' && (
          <section>
            <h2>הגדרות משרד</h2>
            {user?.role !== 'admin' && <p className="bo-error">נדרשת הרשאת מנהל לעריכת הגדרות.</p>}
            <form className="bo-settings" onSubmit={saveSettings}>
              <label>שם המשרד<input value={String(settings.officeName || '')} onChange={(e) => setSettings((c) => ({ ...c, officeName: e.target.value }))} /></label>
              <label>שם מותג (אתר)<input value={String(settings.brandName || '')} onChange={(e) => setSettings((c) => ({ ...c, brandName: e.target.value }))} /></label>
              <label>דוא"ל ליצירת קשר<input value={String(settings.contactEmail || '')} onChange={(e) => setSettings((c) => ({ ...c, contactEmail: e.target.value }))} /></label>
              <label>טלפון<input value={String(settings.contactPhone || '')} onChange={(e) => setSettings((c) => ({ ...c, contactPhone: e.target.value }))} /></label>
              <label>התראה לפני מועד (ימים)<input type="number" value={Number(settings.alertDays || 0)} onChange={(e) => setSettings((c) => ({ ...c, alertDays: Number(e.target.value) }))} /></label>
              <label>אורך סשן (דקות)<input type="number" value={Number(settings.sessionMinutes || 0)} onChange={(e) => setSettings((c) => ({ ...c, sessionMinutes: Number(e.target.value) }))} /></label>
              <label className="bo-check"><input type="checkbox" checked={!!settings.dailyDigestEnabled} onChange={(e) => setSettings((c) => ({ ...c, dailyDigestEnabled: e.target.checked }))} /> תקציר יומי</label>
              <label className="bo-check"><input type="checkbox" checked={!!settings.notificationsEnabled} onChange={(e) => setSettings((c) => ({ ...c, notificationsEnabled: e.target.checked }))} /> התראות</label>
              <button className="bo-btn bo-btn-primary" type="submit" disabled={user?.role !== 'admin'}>שמירה</button>
            </form>
          </section>
        )}
      </main>
    </div>
  )
}

export default Backoffice
