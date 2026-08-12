import { useEffect, useMemo, useState } from 'react'
import './App.css'

const services = [
  {
    title: 'מיזוגים ורכישות',
    description: 'ליווי מלא בתהליך העסקה, מסמכי המו"מ, בדיקות נאותות והבטחת זכויותיך בכל שלב.',
    accent: '01',
    label: 'עסקאות וחוזים',
  },
  {
    title: 'דיני עבודה',
    description: 'ייצוג עובדים ועסקים מול סכסוכי העסקה, פיטורים, גמול, פיצויים והסכמים.',
    accent: '02',
    label: 'הגנה על זכויות',
  },
  {
    title: 'נזיקין ותאונות',
    description: 'מציאת דרך משפטית אפקטיבית להחזרת זכויותיך, פיצוי והגנה על האינטרסים שלך.',
    accent: '03',
    label: 'פיצויים ותביעות',
  },
  {
    title: 'משפחה וירושה',
    description: 'סיום סכסוכים, הסדרים, צוואות, עיזבונות וניהול הליכים רגישים עם כלים מקצועיים.',
    accent: '04',
    label: 'ייעוץ רגיש ויסודי',
  },
]

const stats = [
  { value: '15+', label: 'שנות ניסיון' },
  { value: '1,200+', label: 'לקוחות מרוצים' },
  { value: '94%', label: 'הצלחה ביישוב סכסוכים' },
  { value: '24/7', label: 'ייעוץ דחוף' },
]

const steps = [
  'פגישה ראשונית והבנת המקרה',
  'ניתוח המשפטי ותכנון פעולה',
  'ייצוג מקצועי מול הצד השני',
  'מענה עד לסיום ההליך',
]

const team = [
  { name: 'עו"ד רועי כהן', role: 'מנהל המשרד', bio: 'מתמקד בדיני חברות, עסקים ומיזוגים.' },
  { name: 'עו"ד ליאור אשר', role: 'סכסוכי עבודה', bio: 'מלווה עובדים ועסקים בייצוג מבוקר ותקיף.' },
  { name: 'עו"ד נטע דביר', role: 'משפחה וירושה', bio: 'מייצגת לקוחות במצבים רגישים עם רגישות גבוהה.' },
]

const testimonials = [
  {
    quote:
      'קיבלנו מענה מקצועי, מהיר וענייני. כל צעד היה שקוף ושמרנו על שליטה מלאה על ההליך.',
    name: 'רותם ש.',
    role: 'מנהל חברה',
  },
  {
    quote:
      'העמידה שלנו מול הצד השני הייתה חדה ומדויקת. הצוות ענה לכל שאלה בזמן אמת והביא תוצאות.',
    name: 'שירה א.',
    role: 'עובדת רפואית',
  },
]

const faqs = [
  {
    question: 'האם ניתן לקבוע פגישה ראשונית ללא התחייבות?',
    answer: 'כן. אנו מקיימים פגישות ייעוץ ראשוניות ללא התחייבות, במטרה להכיר את המקרה ולהציע מסלול פעולה מתאים.',
  },
  {
    question: 'האם אתם מייצגים גם חברות וארגונים?',
    answer: 'כן. אנו מספקים ליווי משפטי לחברות, בעלי עסקים, מנהלים ועמותות, הן במישור האסטרטגי והן במישור המשפטי.',
  },
  {
    question: 'כמה זמן לוקח להגיש תביעה או לנהל הליך?',
    answer: 'הזמן משתנה בהתאם למורכבות המקרה, אך אנו עובדים על תחילת טיפול מהירה, ניתוח מהיר של הראיות והתאמת זמן הליך.',
  },
]

const initialForm = {
  name: '',
  email: '',
  phone: '',
  message: '',
}

const initialLegalReview = {
  documentType: 'הסכם',
  documentCategory: 'הסכם/חוזה',
  caseType: 'חיוב חריג',
  requestType: 'בדיקת חיוב חריג',
  amount: '',
  summary: '',
  authority: 'משרד הכלכלה',
  jurisdiction: 'ישראל',
}

const buildPacketForCase = (category: string, summary: string) => {
  const normalized = category || 'אחר'

  const packetMap: Record<string, string[]> = {
    'הסכם/חוזה': ['טופס עיון בהסכם', 'מכתב דרישה לבירור סעיפים', 'טופס בקשה למסמכים משלימים'],
    שכירות: ['טופס דרישת פירוט חיוב', 'מכתב התראה על הפרת חוזה', 'טופס בקשה לעיון בחוזה'],
    'דרישת תשלום': ['טופס דרישת פירוט חיוב', 'מכתב תשלום', 'הודעת בקשה להסבר והסרת חיוב'],
    'חיוב חריג': ['טופס השגה על חיוב', 'מכתב דרישה לפירוט חיוב', 'בקשת בדיקה חוזרת של החשבון'],
    פיטורים: ['טופס פנייה לשימוע', 'בקשה לעיון בחוזה/הסכם', 'טופס דרישה לפיצויים'],
    'דיני עבודה': ['טופס בקשת שימוע', 'מכתב דרישה לתשלום שכר', 'טופס עיון במסמכי העסקה'],
    'תביעה/כתב תביעה': ['טופס הכנת כתב תביעה', 'בקשה למתן סעד', 'טופס צירוף ראיות'],
    'ירושה/צוואה': ['טופס בקשה לעיון בצוואה', 'מכתב דרישה לבירור עיזבון', 'טופס תצהיר מסמכים'],
    'נזיקין/תאונה': ['טופס דרישת פיצוי', 'בקשה למסמכי רפואה', 'טופס עיון בתיעוד התאונה'],
    אחר: ['טופס פנייה ראשונית', 'טופס בקשה לעיון במסמכים', 'מכתב תיאור מקרה'],
  }

  const packet = packetMap[normalized] || packetMap['אחר']

  return {
    title: `סט טפסים ל-${normalized}`,
    summary:
      summary || 'הסט הופק על סמך סוג המקרה והמסמכים שזוהו, לפי ניתוח ראשוני של ההליך.',
    forms: packet,
    generatedAt: new Date().toLocaleString('he-IL'),
  }
}

const buildImmediateDocumentAssessment = (file: File, rawText = '') => {
  const fileName = file.name.toLowerCase()
  const text = `${rawText} ${fileName}`.toLowerCase()

  const categories = [
    { label: 'הסכם/חוזה', keywords: ['הסכם', 'חוזה', 'מסגרת', 'התחייבות', 'מכר', 'השכרה', 'שירות'] },
    { label: 'חיוב חריג', keywords: ['חיוב', 'עמלה', 'ריבית', 'כסף', 'חיוב חריג', 'סכום', 'תשלום'] },
    { label: 'דיני עבודה', keywords: ['פיטורים', 'שכר', 'העסקה', 'עבודה', 'שימוע', 'פיצויים'] },
    { label: 'תביעה/כתב תביעה', keywords: ['תביעה', 'דרישה', 'כתב תביעה', 'בקשה', 'סעד'] },
    { label: 'נזיקין/תאונה', keywords: ['נזק', 'תאונה', 'פגיעה', 'אחריות', 'רפואה', 'פיצוי'] },
    { label: 'ירושה/צוואה', keywords: ['צוואה', 'ירושה', 'עיזבון', 'יורש'] },
    { label: 'משפחה', keywords: ['גירושין', 'משמורת', 'מזונות', 'משפחה', 'ילד', 'בן זוג'] },
  ]

  const matchedCategories = categories
    .filter(({ keywords }) => keywords.some((keyword) => text.includes(keyword)))
    .slice(0, 2)

  const riskSignals = [
    'חיוב',
    'עמלה',
    'ריבית',
    'פיטורים',
    'פיצוי',
    'תביעה',
    'דרישה',
    'איום',
    'התראה',
  ].filter((signal) => text.includes(signal))

  const findings = [
    matchedCategories.length > 0
      ? `זוהתה קטגוריה עיקרית: ${matchedCategories[0].label}.`
      : 'לא זוהתה קטגוריה ברורה; המסמך נבחן כטקסט כללי.',
    riskSignals.length > 0
      ? `נמצאו סמנים של ${riskSignals.slice(0, 3).join(', ')} הדורשים עיון יקרתי.`
      : 'לא נמצאו סמנים חריגים מיידיים, אך יש לבצע בדיקה מלאה של פרטי החיוב/ההתחייבות.',
    'המסמך נבדק באמצעות עקרונות של זיהוי סוג מסמך, תוכן, דרישה וסיכון ראשוני.',
  ]

  const recommendations = [
    'לאמת האם יש סעיף של חיוב, עמלות, ריבית, פיצוי או דרישה כספית.',
    'בדוק את תוקפו, מועדיו, התחייבויותיו ונספחיו של ההסכם או המסמך.',
    'לברר אם נדרשת תגובה בכתב, שימוע, פנייה, דרישה או הגשת מסמך נוסף.',
  ]

  const riskLevel = riskSignals.length > 0 ? 'סיכון בינוני-גבוה' : 'סיכון נמוך-בינוני'

  const summary = matchedCategories.length > 0
    ? `המסמך נראה קשור בעיקר ל-${matchedCategories[0].label.toLowerCase()} והערכת הסיכון הראשונית היא ${riskLevel}.`
    : 'המסמך אינו מצביע בבירור על קטגוריה אחת, ולכן ההערכה הראשונית נערכת לפי תוכן כללי של מסמך ודרישה משפטית אפשרית.'

  return {
    title: 'דוח בדיקה ראשוני',
    summary,
    findings,
    recommendations,
    riskLevel,
    nextStep: 'הדוח הוא הערכה ראשונית מקצועית בלבד ולא ייעוץ משפטי מחייב. לפרטים מדויקים יש צורך בבדיקה מעמיקה יותר.',
  }
}

const clientProfiles = [
  {
    id: 'oren',
    name: 'אורן לוי',
    caseId: 'MY-20481',
    phase: 'ניטור מקרה פעיל',
    nextAction: 'השלמת מסמכים תומכים',
    status: 'ממתין לאישור מסמכים',
  },
  {
    id: 'liya',
    name: 'ליה כהן',
    caseId: 'MY-20492',
    phase: 'הגשת תביעה',
    nextAction: 'אימות מסמכים רפואיים',
    status: 'בחינת ראיות',
  },
  {
    id: 'daniel',
    name: 'דניאל רז',
    caseId: 'MY-20510',
    phase: 'הסדרת הסכם',
    nextAction: 'חתימה על נוסח סופי',
    status: 'משא ומתן פעיל',
  },
]

type AssistantMessage = {
  sender: 'assistant' | 'user'
  text: string
}

type GeneratedPacket = {
  title: string
  summary: string
  forms: string[]
  generatedAt: string
}

type DispatchRecord = {
  id: string
  title: string
  sentAt: string
  status: string
}

type DocumentRecord = {
  id: string
  documentName: string
  category?: string
  status?: string
  createdAt?: string
  uploadedAt?: string
  fileUrl?: string
}

type AuditLogRecord = {
  id: string
  action: string
  occurredAt: string
  actor?: string
  note?: string
  status?: string
  documentName?: string
}

type ProfilePortalState = {
  documents: DocumentRecord[]
  assistantMessages: AssistantMessage[]
  generatedPacket: GeneratedPacket | null
  dispatches: DispatchRecord[]
  auditLogs: AuditLogRecord[]
  lastDispatchNotice: string
}

const defaultAssistantMessages: AssistantMessage[] = [
  { sender: 'assistant', text: 'שלום, אני הסוכן החכם של המשרד. אפשר לעזור לכם בהבנת ההליך, בסטטוס התיק או בהכנת מסמכים.' },
  { sender: 'assistant', text: 'לדוגמה: כמה זמן לוקח לרוב להגיש בקשה? מה צריך לצרף למסמך? איך מקבלים סט טפסים?' },
]

const portalStorageKey = 'my-attorney-portal-state'
const selectedProfileStorageKey = 'my-attorney-selected-profile'
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const createInitialPortalState = (): ProfilePortalState => ({
  documents: [
    { id: 'seed-1', documentName: 'הסכם עבודה.pdf', category: 'דיני עבודה', status: 'מקומי' },
    { id: 'seed-2', documentName: 'דרישת תשלום.docx', category: 'דרישת תשלום', status: 'מקומי' },
  ],
  assistantMessages: defaultAssistantMessages,
  generatedPacket: null,
  dispatches: [],
  auditLogs: [],
  lastDispatchNotice: '',
})

const createDefaultPortalStateMap = () =>
  Object.fromEntries(clientProfiles.map((profile) => [profile.id, createInitialPortalState()])) as Record<string, ProfilePortalState>

const isValidProfileId = (value: string | null): value is string =>
  !!value && clientProfiles.some((profile) => profile.id === value)

const getProfileFromUrl = () => {
  const params = new URLSearchParams(window.location.search)
  const id = params.get('client')
  return isValidProfileId(id) ? (id as string) : null
}

const loadInitialProfileId = () => {
  const fromUrl = getProfileFromUrl()
  if (fromUrl) return fromUrl

  const saved = window.localStorage.getItem(selectedProfileStorageKey)
  if (isValidProfileId(saved)) return saved

  return clientProfiles[0].id
}

const loadPortalStateMap = () => {
  const fallback = createDefaultPortalStateMap()
  const raw = window.localStorage.getItem(portalStorageKey)

  if (!raw) return fallback

  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<ProfilePortalState>>
    return Object.fromEntries(
      clientProfiles.map((profile) => {
        const current = parsed[profile.id]
        const safeState: ProfilePortalState = {
          documents: Array.isArray(current?.documents)
            ? current.documents
                .map((doc, index) => {
                  if (typeof doc === 'string') {
                    return {
                      id: `${profile.id}-legacy-${index}`,
                      documentName: doc,
                    } as DocumentRecord
                  }

                  if (doc && typeof doc === 'object' && typeof doc.documentName === 'string') {
                    return {
                      id: typeof doc.id === 'string' ? doc.id : `${profile.id}-doc-${index}`,
                      documentName: doc.documentName,
                      category: typeof doc.category === 'string' ? doc.category : undefined,
                      status: typeof doc.status === 'string' ? doc.status : undefined,
                      createdAt: typeof doc.createdAt === 'string' ? doc.createdAt : undefined,
                      uploadedAt: typeof doc.uploadedAt === 'string' ? doc.uploadedAt : undefined,
                      fileUrl: typeof doc.fileUrl === 'string' ? doc.fileUrl : undefined,
                    } as DocumentRecord
                  }

                  return null
                })
                .filter((doc): doc is DocumentRecord => doc !== null)
            : fallback[profile.id].documents,
          assistantMessages: Array.isArray(current?.assistantMessages)
            ? current.assistantMessages
                .filter((message) => message && typeof message === 'object')
                .map((message) => ({
                  sender: message.sender === 'user' ? 'user' : 'assistant',
                  text: typeof message.text === 'string' ? message.text : '',
                }))
                .filter((message) => message.text.length > 0)
                .map((message) => ({ sender: message.sender, text: message.text } as AssistantMessage))
            : fallback[profile.id].assistantMessages,
          generatedPacket:
            current?.generatedPacket &&
            typeof current.generatedPacket.title === 'string' &&
            typeof current.generatedPacket.summary === 'string' &&
            Array.isArray(current.generatedPacket.forms) &&
            typeof current.generatedPacket.generatedAt === 'string'
              ? {
                  title: current.generatedPacket.title,
                  summary: current.generatedPacket.summary,
                  forms: current.generatedPacket.forms.filter((item) => typeof item === 'string'),
                  generatedAt: current.generatedPacket.generatedAt,
                }
              : null,
          dispatches: Array.isArray(current?.dispatches)
            ? current.dispatches
                .filter((dispatch) => dispatch && typeof dispatch === 'object')
                .map((dispatch, index) => ({
                  id: typeof dispatch.id === 'string' ? dispatch.id : `${profile.id}-dispatch-${index}`,
                  title: typeof dispatch.title === 'string' ? dispatch.title : 'סט טפסים',
                  sentAt: typeof dispatch.sentAt === 'string' ? dispatch.sentAt : '-',
                  status: typeof dispatch.status === 'string' ? dispatch.status : 'בטיפול',
                }))
            : [],
          auditLogs: Array.isArray(current?.auditLogs)
            ? current.auditLogs
                .filter((log) => log && typeof log === 'object')
                .map((log, index) => ({
                  id: typeof log.id === 'string' ? log.id : `${profile.id}-audit-${index}`,
                  action: typeof log.action === 'string' ? log.action : 'unknown',
                  occurredAt: typeof log.occurredAt === 'string' ? log.occurredAt : new Date().toISOString(),
                  actor: typeof log.actor === 'string' ? log.actor : undefined,
                  note: typeof log.note === 'string' ? log.note : undefined,
                  status: typeof log.status === 'string' ? log.status : undefined,
                  documentName: typeof log.documentName === 'string' ? log.documentName : undefined,
                }))
            : [],
          lastDispatchNotice: typeof current?.lastDispatchNotice === 'string' ? current.lastDispatchNotice : '',
        }

        return [profile.id, safeState]
      }),
    ) as Record<string, ProfilePortalState>
  } catch {
    return fallback
  }
}

const updateQueryProfile = (profileId: string) => {
  const url = new URL(window.location.href)
  url.searchParams.set('client', profileId)
  window.history.replaceState({}, '', url.toString())
}

const getDocumentTimestamp = (doc: DocumentRecord) => {
  if (doc.createdAt) {
    const parsed = new Date(doc.createdAt).getTime()
    if (!Number.isNaN(parsed)) return parsed
  }

  const fallback = Number(doc.id.split('-').pop())
  return Number.isNaN(fallback) ? 0 : fallback
}

const getAuditActionLabel = (action: string) => {
  if (action === 'upload_document') return 'העלאת מסמך'
  if (action === 'delete_document') return 'מחיקת מסמך'
  if (action === 'status_update') return 'עדכון סטטוס'
  if (action === 'dispatch_packet') return 'שליחת סט טפסים'
  return 'פעולה במערכת'
}

const getAuditActorLabel = (actor?: string) => {
  if (actor === 'client') return 'לקוח'
  if (actor === 'office') return 'משרד'
  if (actor === 'system') return 'מערכת'
  return 'לא צוין'
}

function App() {
  const [formData, setFormData] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [reviewResult, setReviewResult] = useState<{
    title: string
    summary: string
    findings: string[]
    recommendations: string[]
    riskLevel: string
    nextStep: string
  } | null>(null)
  const [legalForm, setLegalForm] = useState(initialLegalReview)
  const [legalReview, setLegalReview] = useState<{
    status: string
    summary: string
    checks: string[]
    requests: string[]
    nextStep: string
  } | null>(null)
  const [assistantInput, setAssistantInput] = useState('')
  const [portalStateByProfile, setPortalStateByProfile] = useState<Record<string, ProfilePortalState>>(
    loadPortalStateMap,
  )
  const [selectedProfileId, setSelectedProfileId] = useState(loadInitialProfileId)
  const [isSendingPacket, setIsSendingPacket] = useState(false)
  const [isUploadingDocument, setIsUploadingDocument] = useState(false)
  const [isDeletingDocumentId, setIsDeletingDocumentId] = useState<string | null>(null)
  const [documentSearchTerm, setDocumentSearchTerm] = useState('')
  const [documentCategoryFilter, setDocumentCategoryFilter] = useState('all')
  const [documentSortBy, setDocumentSortBy] = useState<'newest' | 'oldest' | 'name'>('newest')
  const [documentsPage, setDocumentsPage] = useState(1)
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([])
  const [bulkStatusValue, setBulkStatusValue] = useState('בטיפול')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [auditActionFilter, setAuditActionFilter] = useState<'all' | 'upload_document' | 'delete_document' | 'status_update' | 'dispatch_packet'>('all')
  const [auditDateRange, setAuditDateRange] = useState<'all' | '7' | '30'>('all')
  const [pendingDeleteDocument, setPendingDeleteDocument] = useState<DocumentRecord | null>(null)
  const [pendingBulkDelete, setPendingBulkDelete] = useState(false)

  useEffect(() => {
    window.localStorage.setItem(selectedProfileStorageKey, selectedProfileId)
    updateQueryProfile(selectedProfileId)
  }, [selectedProfileId])

  useEffect(() => {
    window.localStorage.setItem(portalStorageKey, JSON.stringify(portalStateByProfile))
  }, [portalStateByProfile])

  const activeProfile = clientProfiles.find((profile) => profile.id === selectedProfileId) ?? clientProfiles[0]
  const activePortalState = portalStateByProfile[activeProfile.id] ?? createInitialPortalState()
  const personalPortalLink = `${window.location.origin}${window.location.pathname}?client=${activeProfile.id}#portal`
  const filteredDocuments = useMemo(() => {
    const filtered = activePortalState.documents.filter((doc) => {
      const matchesName = doc.documentName.toLowerCase().includes(documentSearchTerm.trim().toLowerCase())
      const matchesCategory =
        documentCategoryFilter === 'all' ||
        (doc.category ? doc.category === documentCategoryFilter : false)
      return matchesName && matchesCategory
    })

    const sorted = [...filtered]
    if (documentSortBy === 'name') {
      sorted.sort((a, b) => a.documentName.localeCompare(b.documentName, 'he'))
      return sorted
    }

    sorted.sort((a, b) => {
      const aScore = getDocumentTimestamp(a)
      const bScore = getDocumentTimestamp(b)
      return documentSortBy === 'oldest' ? aScore - bScore : bScore - aScore
    })
    return sorted
  }, [activePortalState.documents, documentSearchTerm, documentCategoryFilter, documentSortBy])

  const documentCategories = useMemo(
    () => Array.from(new Set(activePortalState.documents.map((doc) => doc.category).filter(Boolean) as string[])),
    [activePortalState.documents],
  )

  const documentsPageSize = 5
  const totalDocumentPages = Math.max(1, Math.ceil(filteredDocuments.length / documentsPageSize))
  const paginatedDocuments = filteredDocuments.slice(
    (documentsPage - 1) * documentsPageSize,
    documentsPage * documentsPageSize,
  )

  const filteredAuditLogs = useMemo(() => {
    const now = Date.now()
    const maxAgeMs = auditDateRange === 'all' ? 0 : Number(auditDateRange) * 24 * 60 * 60 * 1000

    return activePortalState.auditLogs.filter((log) => {
      const byAction = auditActionFilter === 'all' || log.action === auditActionFilter
      if (!byAction) return false
      if (maxAgeMs === 0) return true

      const logTs = new Date(log.occurredAt).getTime()
      if (Number.isNaN(logTs)) return false
      return now - logTs <= maxAgeMs
    })
  }, [activePortalState.auditLogs, auditActionFilter, auditDateRange])

  useEffect(() => {
    setDocumentsPage(1)
    setSelectedDocumentIds([])
  }, [documentSearchTerm, documentCategoryFilter, documentSortBy, activeProfile.id])

  useEffect(() => {
    if (documentsPage > totalDocumentPages) {
      setDocumentsPage(totalDocumentPages)
    }
  }, [documentsPage, totalDocumentPages])

  useEffect(() => {
    const syncProfileFromUrl = () => {
      const fromUrl = getProfileFromUrl()
      if (fromUrl && fromUrl !== selectedProfileId) {
        setSelectedProfileId(fromUrl)
      }
    }

    window.addEventListener('popstate', syncProfileFromUrl)
    return () => window.removeEventListener('popstate', syncProfileFromUrl)
  }, [selectedProfileId])

  useEffect(() => {
    const controller = new AbortController()

    const loadDispatches = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/dispatches/${activeProfile.id}`, {
          signal: controller.signal,
        })

        if (!response.ok) return

        const payload = (await response.json()) as { dispatches?: DispatchRecord[] }
        const apiDispatches = payload.dispatches ?? []
        if (!Array.isArray(apiDispatches)) return

        setPortalStateByProfile((current) => {
          const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
          const normalizedDispatches = apiDispatches
            .filter((item) => item && typeof item.id === 'string')
            .map((item) => ({
              id: item.id,
              title: item.title || 'סט טפסים',
              sentAt: item.sentAt || '-',
              status: item.status || 'בטיפול',
            }))

          return {
            ...current,
            [activeProfile.id]: {
              ...currentProfileState,
              dispatches: normalizedDispatches,
            },
          }
        })
      } catch {
        // Keep local state if API is unavailable.
      }
    }

    loadDispatches()
    return () => controller.abort()
  }, [activeProfile.id])

  useEffect(() => {
    const controller = new AbortController()

    const loadDocuments = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/documents/${activeProfile.id}`, {
          signal: controller.signal,
        })

        if (!response.ok) return

        const payload = (await response.json()) as { documents?: Array<Partial<DocumentRecord>> }
        const apiDocuments = Array.isArray(payload.documents)
          ? payload.documents
              .filter((item) => item && typeof item.documentName === 'string')
              .map((item, index) => ({
                id: typeof item.id === 'string' ? item.id : `${activeProfile.id}-api-${index}`,
                documentName: item.documentName as string,
                category: typeof item.category === 'string' ? item.category : undefined,
                status: typeof item.status === 'string' ? item.status : undefined,
                createdAt: typeof item.createdAt === 'string' ? item.createdAt : undefined,
                uploadedAt: typeof item.uploadedAt === 'string' ? item.uploadedAt : undefined,
                fileUrl: typeof item.fileUrl === 'string' ? item.fileUrl : undefined,
              }))
          : []

        setPortalStateByProfile((current) => {
          const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
          return {
            ...current,
            [activeProfile.id]: {
              ...currentProfileState,
              documents: apiDocuments,
            },
          }
        })
      } catch {
        // Keep local document state if API is unavailable.
      }
    }

    loadDocuments()
    return () => controller.abort()
  }, [activeProfile.id])

  useEffect(() => {
    const controller = new AbortController()

    const loadAuditLogs = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/audit/${activeProfile.id}?limit=20`, {
          signal: controller.signal,
        })

        if (!response.ok) return

        const payload = (await response.json()) as { logs?: Array<Partial<AuditLogRecord>> }
        const apiLogs = Array.isArray(payload.logs)
          ? payload.logs
              .filter((item) => item && typeof item.id === 'string')
              .map((item, index) => ({
                id: typeof item.id === 'string' ? item.id : `${activeProfile.id}-audit-${index}`,
                action: typeof item.action === 'string' ? item.action : 'unknown',
                occurredAt: typeof item.occurredAt === 'string' ? item.occurredAt : new Date().toISOString(),
                actor: typeof item.actor === 'string' ? item.actor : undefined,
                note: typeof item.note === 'string' ? item.note : undefined,
                status: typeof item.status === 'string' ? item.status : undefined,
                documentName: typeof item.documentName === 'string' ? item.documentName : undefined,
              }))
          : []

        setPortalStateByProfile((current) => {
          const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
          return {
            ...current,
            [activeProfile.id]: {
              ...currentProfileState,
              auditLogs: apiLogs,
            },
          }
        })
      } catch {
        // Keep local audit logs if API is unavailable.
      }
    }

    loadAuditLogs()
    return () => controller.abort()
  }, [activeProfile.id])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setSubmitted(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      message: formData.message,
      topic: 'פנייה מהאתר',
      urgency: 'רגילה',
    }
    setSubmitted(true)
    setFormData(initialForm)
    try {
      await fetch(`${apiBaseUrl}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      // Lead is now visible to staff in the back-office pipeline.
    } catch {
      // Non-blocking: the confirmation is already shown to the visitor.
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      setUploadedFile(null)
      setReviewResult(null)
      return
    }

    setUploadedFile(file)

    let textPreview = ''
    try {
      if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        textPreview = await file.text()
      }
    } catch {
      textPreview = ''
    }

    const immediateAssessment = buildImmediateDocumentAssessment(file, textPreview)
    setReviewResult(immediateAssessment)
  }

  const handleDocumentReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!uploadedFile) {
      setReviewResult({
        title: 'לא נבחר קובץ',
        summary: 'יש לצרף מסמך לפני שליחת הבדיקה.',
        findings: ['לא הועלה מסמך'],
        recommendations: ['בחר קובץ Word, PDF, TXT או מסמך אחר והגש שוב.'],
        riskLevel: 'לא זמין',
        nextStep: 'המערכת אינה יכולה לבצע ניתוח מיידי ללא מסמך.',
      })
      return
    }

    const tempDocumentId = `${activeProfile.id}-${Date.now()}`
    let persistedDocument: DocumentRecord = {
      id: tempDocumentId,
      documentName: uploadedFile.name,
    }
    let savedByApi = false

    setIsUploadingDocument(true)
    try {
      const body = new FormData()
      body.append('file', uploadedFile)
      body.append('profileId', activeProfile.id)
      body.append('caseId', activeProfile.caseId)
      body.append('category', legalForm.documentCategory)

      const response = await fetch(`${apiBaseUrl}/api/documents`, {
        method: 'POST',
        body,
      })

      if (response.ok) {
        const payload = (await response.json()) as { document?: Partial<DocumentRecord>; documentName?: string }
        if (payload.document && typeof payload.document.documentName === 'string') {
          persistedDocument = {
            id: typeof payload.document.id === 'string' ? payload.document.id : tempDocumentId,
            documentName: payload.document.documentName,
            category: typeof payload.document.category === 'string' ? payload.document.category : legalForm.documentCategory,
            status: typeof payload.document.status === 'string' ? payload.document.status : 'חדש',
            createdAt: typeof payload.document.createdAt === 'string' ? payload.document.createdAt : new Date().toISOString(),
            uploadedAt: typeof payload.document.uploadedAt === 'string' ? payload.document.uploadedAt : undefined,
            fileUrl: typeof payload.document.fileUrl === 'string' ? payload.document.fileUrl : undefined,
          }
        } else if (payload.documentName) {
          persistedDocument = {
            ...persistedDocument,
            documentName: payload.documentName,
            category: legalForm.documentCategory,
            status: 'חדש',
            createdAt: new Date().toISOString(),
          }
        }
        savedByApi = true
      }
    } catch {
      savedByApi = false
    } finally {
      setIsUploadingDocument(false)
    }

    setPortalStateByProfile((current) => {
      const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
      return {
        ...current,
        [activeProfile.id]: {
          ...currentProfileState,
          documents: currentProfileState.documents.some((doc) => doc.documentName === persistedDocument.documentName)
            ? currentProfileState.documents
            : [...currentProfileState.documents, persistedDocument],
        },
      }
    })

    const safeName = uploadedFile.name.toLowerCase()
    const isLegal = /contract|agreement|employment|claim|settlement|lawsuit|document|פיטורים|הסכם|תביעה|נזיקין|שכר/i.test(safeName)

    const instantAssessment = buildImmediateDocumentAssessment(uploadedFile, uploadedFile.name)
    setReviewResult({
      title: 'המסמך נבדק מיידית',
      summary: isLegal
        ? `${instantAssessment.summary} המסמך נראה רלוונטי לייעוץ משפטי ראשוני, אך אינו מהווה חוות דעת מחייבת.`
        : `${instantAssessment.summary} המערכת בוחנת את המסמך באופן מיידי, ללא צורך להמתין לתגובה של צוות המשרד.`,
      findings: [
        'המסמך נקלט בהצלחה במערכת.',
        savedByApi
          ? 'המסמך נשמר גם בשרת ונקשר לתיק הלקוח.'
          : 'השרת אינו זמין כרגע, המסמך נשמר מקומית עד לחיבור מחדש.',
        'הניתוח המיידי מבוצע על פי סוג המסמך, תוכן ונושא ההליך.',
        'ההערכה היא ראשונית ולא מהווה ייעוץ משפטי מחייב.',
      ],
      recommendations: instantAssessment.recommendations,
      riskLevel: instantAssessment.riskLevel,
      nextStep: 'הערכת המסמך התבצעה באופן מיידי. ניתן להמשיך עם בדיקה מעמיקה יותר או לשלוח את הפרטים להמשך טיפול.',
    })
  }

  const handleLegalFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target
    setLegalForm((current) => ({ ...current, [name]: value }))
  }

  const handleAssistantSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = assistantInput.trim()
    if (!trimmed) return

    const reply = trimmed.includes('מסמך') || trimmed.includes('טופס')
      ? 'כדי לקבל סט טפסים מותאם, יש להעלות את המסמך ולאחר מכן לבחור באופציית “הפק טפסים”. המערכת תייצר רשימת טפסים לפי סוג המקרה.'
      : trimmed.includes('זמן') || trimmed.includes('כמה')
        ? 'בדרך כלל ההליך הראשון נמשך בין כמה ימים למספר שבועות, תלוי בסוג המקרה, מסמכים ותשובות הנדרשות.'
        : trimmed.includes('שאלה') || trimmed.includes('עזרה')
          ? 'אני יכול להסביר על סטטוס תיק, נדרשים מסמכים, דרכי הגשה, או להמליץ על הצעד הבא.'
          : 'בכדי לייעל את הטיפול, אני ממליץ להעלות את המסמך, לציין את סוג המקרה ולבחור באופציית הכנת הטפסים.'

    setPortalStateByProfile((current) => {
      const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
      return {
        ...current,
        [activeProfile.id]: {
          ...currentProfileState,
          assistantMessages: [
            ...currentProfileState.assistantMessages,
            { sender: 'user', text: trimmed },
            { sender: 'assistant', text: reply },
          ],
        },
      }
    })

    setAssistantInput('')
  }

  const handleLegalSubmission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const amount = Number(legalForm.amount) || 0
    const text = legalForm.summary.toLowerCase()
    const issue = legalForm.requestType
    const category = legalForm.documentCategory

    const checks: string[] = []
    const requests: string[] = []

    if (category === 'הסכם/חוזה' || category === 'שכירות' || category === 'עסקה מסחרית') {
      checks.push('בדיקת תקפות ההסכם, סעיפי החיוב, ביטול/ביצוע וחריגות מהתקנות')
      checks.push('בחינת חוק החוזים, דיני מכר, שכירות ומסמכים בינלאומיים/ישראלים')
      requests.push('טופס עיון בהסכם, נספחים והודעות צד ג')
      requests.push('טופס דרישה לבירור סעיפים והעמדת מסמכים')
    }

    if (category === 'דרישת תשלום' || category === 'חיוב חריג') {
      checks.push('בדיקת חוקיות חיוב, עמלות, ריבית, פרטים וחריגה מהדין')
      checks.push('בחינת חוק הגנת הצרכן, הוראות חיוב ותקנות מתאימות')
      requests.push('טופס דרישה לפירוט חיוב')
      requests.push('הודעת בקשה לבחינת חיוב חריג')
    }

    if (category === 'פיטורים' || category === 'דיני עבודה') {
      checks.push('בדיקת פיטורים, התראה, פיצויי פיטורים, זכויות והוראות עבודה')
      checks.push('סקירה לפי חוקי עבודה, פסיקה עדכנית והנחיות ממשלתיות')
      requests.push('טופס בקשה לעיון במסמכי עבודה ובשימוע')
      requests.push('טופס דרישה לתשלום פיצויים/שכר/הפרשות')
    }

    if (category === 'ירושה/צוואה' || category === 'משפחה') {
      checks.push('בדיקת צוואה, עיזבון, זכויות יורשים, חלוקת רכוש ומסמכים רלוונטיים')
      checks.push('בחינת הדין המשפחתי והירושות, פסיקה עדכנית ונהלי רישום')
      requests.push('טופס בקשה לעיון בנתונים וציוד נדרש')
      requests.push('טופס הכנת דרישה או תצהיר רלוונטי')
    }

    if (category === 'תביעה/כתב תביעה' || category === 'הגשת תביעה') {
      checks.push('בדיקת הליך תביעה, מועדים, עילות, ראיות ודרישות נוספות')
      checks.push('סקירה של הדין הרלוונטי, פסיקה והנחיות של בתי המשפט')
      requests.push('טופס הכנת כתב תביעה/בקשה למתן סעד')
      requests.push('טופס בקשה לראיות, חוות דעת או מסמכים')
    }

    if (category === 'נזיקין/תאונה') {
      checks.push('בדיקת עילת נזיקין, הוכחת נזק, אחריות והיקף הפיצוי')
      checks.push('בחינת דיני נזיקין, נסיבות התאונה ופסיקה רלוונטית')
      requests.push('טופס בקשה לגיבוי רפואי ומסמכי נזק')
      requests.push('טופס דרישת פיצוי/הגשת תביעה')
    }

    if (issue.includes('חיוב') || issue.includes('חריג') || text.includes('עמלה') || text.includes('ריבית')) {
      checks.push('בדיקת חוקיות חיוב, עמלות, ריבית והפרת הדין')
      checks.push('חוק הגנת הצרכן, התקנות והוראות ניהול חיוב')
      requests.push('טופס דרישה לפירוט חיוב')
      requests.push('הודעת בקשה לבחינת חיוב חריג')
    }

    if (issue.includes('הסכם') || text.includes('הסכם') || text.includes('חוזה')) {
      checks.push('בדיקת תקפות ההסכם, סעיפי החיוב וההתחייבויות')
      checks.push('בחינת פסיקה עדכנית בתחום החוזים וההתחייבויות')
      requests.push('טופס עיון בהסכם ובנספחים')
    }

    if (issue.includes('תביעה') || text.includes('תביעה') || text.includes('פיטורים') || text.includes('עבודה')) {
      checks.push('בדיקת הליך תביעה, מועדים, דרישות והסמכויות')
      checks.push('סקירה של הדין הרלוונטי, פסיקה והנחיות ממשלתיות')
      requests.push('טופס בקשה לשימוע/זימון/הגשת מסמכים')
    }

    if (legalForm.authority === 'משרד הכלכלה' || legalForm.authority === 'רשות התחרות' || legalForm.authority === 'משרד המשפטים') {
      checks.push('בדיקת מאגרי מידע ממשלתיים ורגולציה רלוונטית')
      checks.push('בחינת הרשות/המשרד הרלוונטי לצורך תיעוד ומענה')
    }

    if (checks.length === 0) {
      checks.push('בדיקת מסמכים, חוקים ותקנות רלוונטיים')
      checks.push('סקירת פסיקה עדכנית והנחיות של רשויות')
      requests.push('טופס פנייה ראשונית למשרד')
    }

    const uniqueChecks = [...new Set(checks)]
    const uniqueRequests = [...new Set(requests)]

    const riskLevel = amount >= 25000 || legalForm.caseType === 'חיוב חריג' || issue.includes('חריג')
      ? 'ערך סיכון גבוה'
      : amount >= 5000 ? 'ערך סיכון בינוני' : 'ערך סיכון נמוך'

    setLegalReview({
      status: riskLevel,
      summary: `בקטגוריה ${category} נבחן המקרה בהתאם לסוג המסמך, הסכום, הרשות וההקשר המשפטי. ${riskLevel.toLowerCase()} נראית באופן ראשוני, וניתן להמשיך בבדיקה מעמיקה מול מאגרי מידע ממשלתיים, חוקים, תקנות ופסיקה רלוונטיים.`,
      checks: uniqueChecks,
      requests: uniqueRequests,
      nextStep: 'כעת אפשר להגיש את הבקשה, לאסוף מסמכים נוספים, ולהמשיך עם בדיקה משפטית מסודרת מול המשרד.',
    })

    const generated = buildPacketForCase(category, legalForm.summary)
    setPortalStateByProfile((current) => {
      const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
      const defaultDocName = `${category}.pdf`
      return {
        ...current,
        [activeProfile.id]: {
          ...currentProfileState,
          generatedPacket: generated,
          documents: currentProfileState.documents.some((doc) => doc.documentName === defaultDocName)
            ? currentProfileState.documents
            : [
                ...currentProfileState.documents,
                {
                  id: `${activeProfile.id}-doc-${Date.now()}`,
                  documentName: defaultDocName,
                  category: legalForm.documentCategory,
                },
              ],
        },
      }
    })
  }

  const handleGeneratePacketFromPortal = () => {
    const casePacket = buildPacketForCase(legalForm.documentCategory, legalForm.summary)
    const defaultDocName = `${legalForm.documentCategory}.pdf`

    setPortalStateByProfile((current) => {
      const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
      return {
        ...current,
        [activeProfile.id]: {
          ...currentProfileState,
          generatedPacket: casePacket,
          documents: currentProfileState.documents.some((doc) => doc.documentName === defaultDocName)
            ? currentProfileState.documents
            : [
                ...currentProfileState.documents,
                {
                  id: `${activeProfile.id}-doc-${Date.now()}`,
                  documentName: defaultDocName,
                  category: legalForm.documentCategory,
                  status: 'מקומי',
                  createdAt: new Date().toISOString(),
                },
              ],
          lastDispatchNotice: '',
        },
      }
    })
  }

  const toggleSelectDocument = (documentId: string) => {
    setSelectedDocumentIds((current) =>
      current.includes(documentId)
        ? current.filter((id) => id !== documentId)
        : [...current, documentId],
    )
  }

  const toggleSelectAllVisibleDocuments = () => {
    const visibleIds = paginatedDocuments.map((doc) => doc.id)
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedDocumentIds.includes(id))

    if (allVisibleSelected) {
      setSelectedDocumentIds((current) => current.filter((id) => !visibleIds.includes(id)))
      return
    }

    setSelectedDocumentIds((current) => Array.from(new Set([...current, ...visibleIds])))
  }

  const executeDeleteDocuments = async (documentIds: string[]) => {
    if (documentIds.length === 0) return

    setIsDeletingDocumentId(documentIds[0])

    try {
      const settled = await Promise.allSettled(
        documentIds.map(async (documentId) => {
          const response = await fetch(
            `${apiBaseUrl}/api/documents/${documentId}?profileId=${encodeURIComponent(activeProfile.id)}`,
            { method: 'DELETE' },
          )
          if (!response.ok) {
            throw new Error('Delete request failed')
          }
          return documentId
        }),
      )

      const deletedIds = settled
        .filter((result): result is PromiseFulfilledResult<string> => result.status === 'fulfilled')
        .map((result) => result.value)

      if (deletedIds.length === 0) {
        throw new Error('No documents deleted')
      }

      setPortalStateByProfile((current) => {
        const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
        return {
          ...current,
          [activeProfile.id]: {
            ...currentProfileState,
            documents: currentProfileState.documents.filter((doc) => !deletedIds.includes(doc.id)),
            lastDispatchNotice:
              deletedIds.length === 1
                ? 'המסמך הוסר מהשרת ומהתיק בהצלחה.'
                : `${deletedIds.length} מסמכים הוסרו מהשרת ומהתיק בהצלחה.`,
          },
        }
      })

      setSelectedDocumentIds((current) => current.filter((id) => !deletedIds.includes(id)))
    } catch {
      setPortalStateByProfile((current) => {
        const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
        return {
          ...current,
          [activeProfile.id]: {
            ...currentProfileState,
            lastDispatchNotice: 'לא ניתן למחוק את המסמכים כרגע. נסה שוב בעוד רגע.',
          },
        }
      })
    } finally {
      setIsDeletingDocumentId(null)
    }
  }

  const handleBulkStatusUpdate = async () => {
    if (selectedDocumentIds.length === 0) return

    setIsUpdatingStatus(true)

    try {
      const response = await fetch(`${apiBaseUrl}/api/documents/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: activeProfile.id,
          documentIds: selectedDocumentIds,
          status: bulkStatusValue,
        }),
      })

      if (!response.ok) {
        throw new Error('Status update request failed')
      }

      const nowIso = new Date().toISOString()
      setPortalStateByProfile((current) => {
        const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
        return {
          ...current,
          [activeProfile.id]: {
            ...currentProfileState,
            documents: currentProfileState.documents.map((doc) =>
              selectedDocumentIds.includes(doc.id)
                ? { ...doc, status: bulkStatusValue, createdAt: doc.createdAt || nowIso }
                : doc,
            ),
            auditLogs: [
              {
                id: `audit-local-${Date.now()}`,
                action: 'status_update',
                occurredAt: nowIso,
                actor: 'client',
                status: bulkStatusValue,
                note: `עודכן סטטוס עבור ${selectedDocumentIds.length} מסמכים`,
              },
              ...currentProfileState.auditLogs,
            ],
            lastDispatchNotice: `סטטוס עודכן ל-${bulkStatusValue} עבור ${selectedDocumentIds.length} מסמכים.`,
          },
        }
      })
    } catch {
      setPortalStateByProfile((current) => {
        const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
        return {
          ...current,
          [activeProfile.id]: {
            ...currentProfileState,
            lastDispatchNotice: 'עדכון הסטטוס נכשל כרגע. נסה שוב בעוד רגע.',
          },
        }
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    await executeDeleteDocuments([documentId])
  }

  const handleConfirmDeleteDocument = async () => {
    if (pendingDeleteDocument) {
      await handleDeleteDocument(pendingDeleteDocument.id)
      setPendingDeleteDocument(null)
      return
    }

    if (pendingBulkDelete) {
      await executeDeleteDocuments(selectedDocumentIds)
      setPendingBulkDelete(false)
    }
  }

  const handleSendPacketToOffice = async () => {
    if (!activePortalState.generatedPacket) {
      setPortalStateByProfile((current) => {
        const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
        return {
          ...current,
          [activeProfile.id]: {
            ...currentProfileState,
            lastDispatchNotice: 'יש להפיק סט טפסים לפני שליחה למשרד.',
          },
        }
      })
      return
    }

    setIsSendingPacket(true)

    try {
      const response = await fetch(`${apiBaseUrl}/api/dispatches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileId: activeProfile.id,
          profileName: activeProfile.name,
          caseId: activeProfile.caseId,
          packet: activePortalState.generatedPacket,
        }),
      })

      if (!response.ok) {
        throw new Error('Dispatch request failed')
      }

      const payload = (await response.json()) as { dispatch?: DispatchRecord }
      const dispatchRecord = payload.dispatch ?? {
        id: `${activeProfile.id}-${Date.now()}`,
        title: activePortalState.generatedPacket.title,
        sentAt: new Date().toLocaleString('he-IL'),
        status: 'נשלח למשרד',
      }

      setPortalStateByProfile((current) => {
        const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
        return {
          ...current,
          [activeProfile.id]: {
            ...currentProfileState,
            dispatches: [dispatchRecord, ...currentProfileState.dispatches.filter((item) => item.id !== dispatchRecord.id)],
            lastDispatchNotice: `הבקשה נשלחה בהצלחה. מספר פנייה: ${dispatchRecord.id}`,
          },
        }
      })
    } catch {
      const fallbackDispatch: DispatchRecord = {
        id: `${activeProfile.id}-${Date.now()}`,
        title: activePortalState.generatedPacket.title,
        sentAt: new Date().toLocaleString('he-IL'),
        status: 'נשמר מקומית (API לא זמין)',
      }

      setPortalStateByProfile((current) => {
        const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
        return {
          ...current,
          [activeProfile.id]: {
            ...currentProfileState,
            dispatches: [fallbackDispatch, ...currentProfileState.dispatches],
            lastDispatchNotice: 'שרת השליחה לא זמין כרגע. הבקשה נשמרה מקומית ותישלח לאחר חיבור השרת.',
          },
        }
      })
    } finally {
      setIsSendingPacket(false)
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">M</div>
          <div>
            <p className="brand-name">MyAttorney</p>
            <p className="brand-subtitle">משרד עורכי דין</p>
          </div>
        </div>

        <nav className="main-nav" aria-label="כותרת עיקרית">
          <a href="#services">שירותים</a>
          <a href="#portal">אזור לקוח</a>
          <a href="#about">אודות</a>
          <a href="#team">צוות</a>
          <a href="#faq">שאלות נפוצות</a>
          <a href="#contact">צור קשר</a>
          <a href="#staff" className="staff-link">אזור צוות</a>
        </nav>

        <a className="primary-btn" href="#contact">
          ייעוץ ראשוני
        </a>
      </header>

      <main>
        <section className="hero section">
          <div className="hero-copy">
            <p className="eyebrow">משרד עורכי דין • ייעוץ פרואקטיבי</p>
            <h1>ליווי משפטי שמחזיר שליטה, ביטחון ויעילות לכל החלטה.</h1>
            <p className="hero-text">
              MyAttorney הוא משרד עורכי דין המלווה לקוחות פרטיים, חברות וארגונים בכל שלב של
              ההליך — משלב הייעוץ הראשוני, דרך ניהול המשא ומתן ועד לניהול הליכים מורכבים מול
              צדדים שונים ובתי משפט.
            </p>

            <div className="cta-row">
              <a className="primary-btn" href="#contact">
                קביעת פגישה
              </a>
              <a className="secondary-btn" href="#services">
                השירותים שלנו
              </a>
            </div>

            <div className="hero-meta">
              <span>עסקאות • נזיקין • משפחה • עבודה • הסכמים</span>
            </div>

            <div className="hero-pills" aria-label="תחומי מומחיות">
              <span>הסכמים</span>
              <span>תביעות</span>
              <span>שימוע</span>
              <span>ייעוץ עסקי</span>
            </div>
          </div>

          <div className="hero-panel" aria-label="כרטיס משרד">
            <div className="panel-card card-primary">
              <p className="panel-label">מקרה בולט</p>
              <h2>הסדר עסקי עם מענה מקצועי ופרואקטיבי</h2>
              <div className="progress-row">
                <span>התקדמות</span>
                <strong>92%</strong>
              </div>
              <div className="progress-bar">
                <span></span>
              </div>
              <div className="mini-tags">
                <span>דיני חברות</span>
                <span>הסכמים</span>
              </div>
            </div>

            <div className="panel-card card-floating">
              <p>ייעוץ דחוף</p>
              <strong>+972 54 000 0000</strong>
            </div>
          </div>
        </section>

        <section className="stats-bar section">
          {stats.map((item) => (
            <div key={item.label} className="stat-item">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </section>

        <section id="services" className="section services-section">
          <div className="section-header">
            <p className="eyebrow">תחומי עיסוק</p>
            <h2>פתרונות משפטיים שמותאמים לתחום שלך</h2>
          </div>

          <div className="services-grid">
            {services.map((service) => (
              <article key={service.title} className="service-card">
                <span className="service-number">{service.accent}</span>
                <span className="service-tag">{service.label}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section insight-section">
          <div className="insight-card">
            <p className="eyebrow">למה לבחור בנו</p>
            <h2>ליווי משפטי שמתחיל בתשומת לב ומסתיים בתוצאה.</h2>
          </div>
          <div className="insight-list">
            <div>
              <strong>גישה אישית</strong>
              <p>כל לקוח מקבל תכנון פרטני והבנה מעמיקה של הסיטואציה.</p>
            </div>
            <div>
              <strong>תיעוד ברור</strong>
              <p>נשמרת שקיפות מלאה בכל צעד, מהפגישה הראשונית ועד לסיום ההליך.</p>
            </div>
            <div>
              <strong>ניסיון מעשי</strong>
              <p>העבודה מול בתי משפט, צדדים נוספים ולקוחות מסחריים מביאה מענה אפקטיבי.</p>
            </div>
          </div>
        </section>

        <section id="about" className="section about-section">
          <div className="about-visual">
            <div className="about-box">
              <p className="eyebrow">הגישה שלנו</p>
              <h3>הליכים שמבוססים על תכנון, אמון ועמידה מול האתגרים.</h3>
            </div>
          </div>

          <div className="about-copy">
            <p className="eyebrow">אודות המשרד</p>
            <h2>חוות דעת משפטית שמביאה בהירות ויעילות לאורך כל הדרך.</h2>
            <p>
              אנו מאמינים שכל לקוח ראוי לליווי אישי, הבנה מעמיקה של הסיטואציה והתקדמות
              שקופה. לכן, כל תיק מנוהל בתשומת לב מקצועית, בשילוב בין ניתוח משפטי מעמיק לבין
              עמידה ברמה הגבוהה ביותר של שירות.
            </p>
            <ul>
              <li>סדרי עדיפויות שמתאימים למקרה הספציפי שלך</li>
              <li>תקשורת פתוחה וחדה לאורך כל ההליך</li>
              <li>ייצוג שקט ושקול, אך תקיף בכל שלב</li>
            </ul>
          </div>
        </section>

        <section id="team" className="section team-section">
          <div className="section-header">
            <p className="eyebrow">הצוות</p>
            <h2>עורכי דין שמבינים את המורכבות של המקרה שלך</h2>
          </div>

          <div className="team-grid">
            {team.map((person) => (
              <article key={person.name} className="team-card">
                <div className="avatar">{person.name.slice(0, 2)}</div>
                <h3>{person.name}</h3>
                <p className="role">{person.role}</p>
                <p>{person.bio}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="process" className="section process-section">
          <div className="section-header centered">
            <p className="eyebrow">איך עובדים איתנו</p>
            <h2>הליך פשוט, ברור וממוקד תוצאות</h2>
          </div>

          <div className="process-grid">
            {steps.map((step, index) => (
              <div key={step} className="process-card">
                <span className="step-number">0{index + 1}</span>
                <h3>{step}</h3>
              </div>
            ))}
          </div>
        </section>

        <section id="faq" className="section faq-section">
          <div className="section-header">
            <p className="eyebrow">שאלות נפוצות</p>
            <h2>הסברים חשובים לפני שמתחילים</h2>
          </div>

          <div className="faq-list">
            {faqs.map((item) => (
              <div key={item.question} className="faq-item">
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="reviews" className="section testimonials-section">
          <div className="section-header">
            <p className="eyebrow">לקוחות מספרים</p>
            <h2>אמון שנבנה על תוצאה והבנה</h2>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((item) => (
              <article key={item.name} className="testimonial-card">
                <p className="quote">“{item.quote}”</p>
                <div className="person-block">
                  <strong>{item.name}</strong>
                  <span>{item.role}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="contact-copy">
            <p className="eyebrow">צור קשר</p>
            <h2>בואו נדבר על המקרה שלכם.</h2>
            <p>
              נשמח ללוות אתכם מהשלב הראשון ועד לסיום ההליך. שלחו פרטים וכמתמחים בתחום,
              נחזור אליכם בהקדם.
            </p>
            <ul className="contact-list">
              <li>מייל: hello@myattorney.co</li>
              <li>טלפון: +972 54 000 0000</li>
              <li>שעות: ימים א'-ה', 09:00-18:00</li>
            </ul>
          </div>

          <form className="contact-form" onSubmit={handleSubmit} aria-label="טופס יצירת קשר">
            <label>
              שם מלא
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="הקלד את שמך"
              />
            </label>
            <label>
              דוא"ל
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
              />
            </label>
            <label>
              טלפון
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="050-000-0000"
              />
            </label>
            <label>
              תיאור המקרה
              <textarea
                rows={4}
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="ספר בקצרה על המקרה שלך"
              />
            </label>
            <button type="submit" className="primary-btn submit-btn">
              שלח בקשה
            </button>
            {submitted && <p className="success-message">הטופס נשלח בהצלחה. נחזור אליכם בהקדם.</p>}
          </form>
        </section>

        <section className="section upload-section" aria-label="העלאת מסמך לבדיקה">
          <div className="section-header">
            <p className="eyebrow">בדיקת מסמכים</p>
            <h2>העלה מסמך ותקבל תשובת בדיקה ראשונית</h2>
          </div>

          <form className="upload-form" onSubmit={handleDocumentReview}>
            <label className="file-upload-box">
              <span>בחר קובץ</span>
              <input type="file" accept=".pdf,.doc,.docx,.txt,.rtf" onChange={handleFileUpload} />
            </label>

            {uploadedFile ? (
              <div className="file-meta">
                <strong>הקובץ שנבחר:</strong>
                <span>{uploadedFile.name}</span>
              </div>
            ) : (
              <div className="file-meta muted">
                <strong>לא נבחר מסמך עדיין.</strong>
              </div>
            )}

            <button type="submit" className="primary-btn submit-btn" disabled={isUploadingDocument}>
              {isUploadingDocument ? 'מעלה ובודק...' : 'בדוק מסמך'}
            </button>

            {reviewResult && (
              <div className="review-result" aria-live="polite">
                <div className="report-header">
                  <h3>{reviewResult.title}</h3>
                  <span className="risk-pill">{reviewResult.riskLevel}</span>
                </div>
                <p>{reviewResult.summary}</p>

                <div className="result-block">
                  <strong>ממצאים</strong>
                  <ul>
                    {reviewResult.findings.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="result-block">
                  <strong>המלצות</strong>
                  <ul>
                    {reviewResult.recommendations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <strong>{reviewResult.nextStep}</strong>
              </div>
            )}
          </form>
        </section>

        <section id="portal" className="section portal-section" aria-label="לוח לקוח אישי">
          <div className="section-header">
            <p className="eyebrow">לוח לקוח</p>
            <h2>הדף האישי של {activeProfile.name}</h2>
            <p className="portal-link-hint">קישור אישי: {personalPortalLink}</p>
          </div>

          <div className="profile-switcher" aria-label="בחירת לקוח">
            {clientProfiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                className={`profile-pill ${selectedProfileId === profile.id ? 'active' : ''}`}
                onClick={() => setSelectedProfileId(profile.id)}
              >
                {profile.name}
              </button>
            ))}
          </div>

          <div className="portal-layout">
            <div className="portal-card summary-card">
              <div className="portal-headline">
                <span className="mini-tag">מספר תיק</span>
                <strong>{activeProfile.caseId}</strong>
              </div>
              <h3>{activeProfile.phase}</h3>
              <ul>
                <li>סטטוס: {activeProfile.status}</li>
                <li>הצעד הבא: {activeProfile.nextAction}</li>
                <li>עדכון אחרון: 12 באוגוסט 2026</li>
              </ul>
            </div>

            <div className="portal-card assistant-card">
              <div className="assistant-header">
                <strong>סוכן חכם</strong>
                <span>שאל תשובה</span>
              </div>

              <div className="assistant-chat" aria-live="polite">
                {activePortalState.assistantMessages.map((message, index) => (
                  <div key={`${message.sender}-${index}`} className={`bubble ${message.sender}`}>
                    {message.text}
                  </div>
                ))}
              </div>

              <form className="assistant-form" onSubmit={handleAssistantSubmit}>
                <input
                  type="text"
                  value={assistantInput}
                  onChange={(event) => setAssistantInput(event.target.value)}
                  placeholder="שאל על מסמך, סטטוס, טפסים או תהליך"
                />
                <button type="submit" className="primary-btn submit-btn">שלח</button>
              </form>
            </div>

            <div className="portal-card docs-card">
              <div className="assistant-header">
                <strong>מסמכים שהועלו</strong>
                <span>{activePortalState.documents.length} קבצים</span>
              </div>

              <div className="doc-bulk-toolbar">
                <label>
                  <input
                    type="checkbox"
                    checked={paginatedDocuments.length > 0 && paginatedDocuments.every((doc) => selectedDocumentIds.includes(doc.id))}
                    onChange={toggleSelectAllVisibleDocuments}
                  />
                  בחר את כל המסמכים בעמוד
                </label>

                <div className="doc-bulk-actions">
                  <select
                    className="doc-select doc-select-compact"
                    value={bulkStatusValue}
                    onChange={(event) => setBulkStatusValue(event.target.value)}
                  >
                    <option value="חדש">סטטוס: חדש</option>
                    <option value="בטיפול">סטטוס: בטיפול</option>
                    <option value="נבדק">סטטוס: נבדק</option>
                    <option value="הושלם">סטטוס: הושלם</option>
                  </select>
                  <button
                    type="button"
                    className="secondary-btn"
                    disabled={selectedDocumentIds.length === 0 || isUpdatingStatus}
                    onClick={handleBulkStatusUpdate}
                  >
                    {isUpdatingStatus ? 'מעדכן...' : `עדכן סטטוס (${selectedDocumentIds.length})`}
                  </button>
                  <button
                    type="button"
                    className="doc-delete-btn"
                    disabled={selectedDocumentIds.length === 0}
                    onClick={() => setPendingBulkDelete(true)}
                  >
                    מחק מסמכים נבחרים ({selectedDocumentIds.length})
                  </button>
                </div>
              </div>

              <div className="docs-tools">
                <input
                  type="search"
                  value={documentSearchTerm}
                  onChange={(event) => setDocumentSearchTerm(event.target.value)}
                  className="doc-search-input"
                  placeholder="חיפוש מהיר לפי שם מסמך"
                />
                <select
                  value={documentCategoryFilter}
                  onChange={(event) => setDocumentCategoryFilter(event.target.value)}
                  className="doc-select"
                >
                  <option value="all">כל הקטגוריות</option>
                  {documentCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  value={documentSortBy}
                  onChange={(event) => setDocumentSortBy(event.target.value as 'newest' | 'oldest' | 'name')}
                  className="doc-select"
                >
                  <option value="newest">מיון: חדש לישן</option>
                  <option value="oldest">מיון: ישן לחדש</option>
                  <option value="name">מיון: שם א-ת</option>
                </select>
              </div>

              <ul className="doc-list">
                {paginatedDocuments.map((doc) => (
                  <li key={doc.id}>
                    <label className="doc-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedDocumentIds.includes(doc.id)}
                        onChange={() => toggleSelectDocument(doc.id)}
                      />
                    </label>
                    <div className="doc-main">
                      {doc.fileUrl ? (
                        <a href={`${apiBaseUrl}${doc.fileUrl}`} target="_blank" rel="noreferrer">
                          {doc.documentName}
                        </a>
                      ) : (
                        <span>{doc.documentName}</span>
                      )}
                      <div className="doc-meta-row">
                        {doc.category && <small className="doc-category">{doc.category}</small>}
                        <span className={`doc-status status-${(doc.status || 'חדש').replace(/\s+/g, '-')}`}>
                          {doc.status || 'חדש'}
                        </span>
                      </div>
                      {doc.uploadedAt && <small>{doc.uploadedAt}</small>}
                    </div>
                    <button
                      type="button"
                      className="doc-delete-btn"
                      onClick={() => setPendingDeleteDocument(doc)}
                      disabled={isDeletingDocumentId === doc.id}
                    >
                      {isDeletingDocumentId === doc.id ? 'מוחק...' : 'הסר'}
                    </button>
                  </li>
                ))}
              </ul>

              {filteredDocuments.length === 0 && (
                <p className="doc-empty-message">לא נמצאו מסמכים מתאימים לסינון הנוכחי.</p>
              )}

              {filteredDocuments.length > 0 && (
                <div className="doc-pagination">
                  <span>
                    עמוד {documentsPage} מתוך {totalDocumentPages}
                  </span>
                  <div className="doc-pagination-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => setDocumentsPage((current) => Math.max(1, current - 1))}
                      disabled={documentsPage === 1}
                    >
                      קודם
                    </button>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => setDocumentsPage((current) => Math.min(totalDocumentPages, current + 1))}
                      disabled={documentsPage === totalDocumentPages}
                    >
                      הבא
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="primary-btn submit-btn"
                onClick={handleGeneratePacketFromPortal}
              >
                הפק סט טפסים
              </button>
            </div>
          </div>

          <div className="portal-card audit-card">
            <div className="assistant-header">
              <strong>יומן פעולות בתיק</strong>
              <span>{filteredAuditLogs.length} רשומות</span>
            </div>

            <div className="audit-filters">
              <select
                className="doc-select doc-select-compact"
                value={auditActionFilter}
                onChange={(event) =>
                  setAuditActionFilter(
                    event.target.value as 'all' | 'upload_document' | 'delete_document' | 'status_update' | 'dispatch_packet',
                  )
                }
              >
                <option value="all">כל הפעולות</option>
                <option value="upload_document">העלאות מסמכים</option>
                <option value="delete_document">מחיקות מסמכים</option>
                <option value="status_update">עדכוני סטטוס</option>
                <option value="dispatch_packet">שליחת סט טפסים</option>
              </select>

              <select
                className="doc-select doc-select-compact"
                value={auditDateRange}
                onChange={(event) => setAuditDateRange(event.target.value as 'all' | '7' | '30')}
              >
                <option value="all">כל התאריכים</option>
                <option value="7">7 ימים אחרונים</option>
                <option value="30">30 ימים אחרונים</option>
              </select>
            </div>

            <ul className="audit-list">
              {filteredAuditLogs.slice(0, 8).map((log) => (
                <li key={log.id}>
                  <div>
                    <strong>{getAuditActionLabel(log.action)}</strong>
                    <p>{log.note || log.documentName || 'פעולה בוצעה בהצלחה.'}</p>
                  </div>
                  <div className="audit-meta">
                    <small>בוצע על ידי: {getAuditActorLabel(log.actor)}</small>
                    {log.status && <span className="doc-status">{log.status}</span>}
                    <small>{new Date(log.occurredAt).toLocaleString('he-IL')}</small>
                  </div>
                </li>
              ))}
            </ul>

            {filteredAuditLogs.length === 0 && (
              <p className="doc-empty-message">אין רשומות פעילות עדיין עבור תיק זה.</p>
            )}
          </div>

          {(pendingDeleteDocument || pendingBulkDelete) && (
            <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label="אישור מחיקת מסמך">
              <div className="confirm-card">
                <h3>לאשר מחיקה?</h3>
                <p>
                  {pendingDeleteDocument ? (
                    <>
                      המסמך <strong>{pendingDeleteDocument.documentName}</strong> יוסר מהתיק ומהשרת.
                    </>
                  ) : (
                    <>
                      {selectedDocumentIds.length} מסמכים יוסרו מהתיק ומהשרת.
                    </>
                  )}
                </p>
                <div className="confirm-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      setPendingDeleteDocument(null)
                      setPendingBulkDelete(false)
                    }}
                  >
                    ביטול
                  </button>
                  <button
                    type="button"
                    className="doc-delete-btn"
                    onClick={handleConfirmDeleteDocument}
                    disabled={
                      pendingDeleteDocument
                        ? isDeletingDocumentId === pendingDeleteDocument.id
                        : selectedDocumentIds.length === 0 || isDeletingDocumentId !== null
                    }
                  >
                    {isDeletingDocumentId !== null ? 'מוחק...' : 'אשר מחיקה'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activePortalState.generatedPacket && (
            <div className="packet-card">
              <div className="packet-header">
                <h3>{activePortalState.generatedPacket.title}</h3>
                <span>{activePortalState.generatedPacket.generatedAt}</span>
              </div>

              <p>{activePortalState.generatedPacket.summary}</p>

              <div className="packet-forms">
                {activePortalState.generatedPacket.forms.map((form) => (
                  <span key={form}>{form}</span>
                ))}
              </div>

              <button
                type="button"
                className="primary-btn submit-btn"
                onClick={handleSendPacketToOffice}
                disabled={isSendingPacket}
              >
                {isSendingPacket ? 'שולח בקשה...' : 'שלח את הסט ישירות למשרד'}
              </button>

              {activePortalState.lastDispatchNotice && (
                <p className="dispatch-message">{activePortalState.lastDispatchNotice}</p>
              )}

              {activePortalState.dispatches.length > 0 && (
                <div className="dispatch-log">
                  <strong>פניות שנשלחו</strong>
                  <ul>
                    {activePortalState.dispatches.map((dispatch) => (
                      <li key={dispatch.id}>
                        <span>{dispatch.title}</span>
                        <span>{dispatch.sentAt}</span>
                        <span>{dispatch.status}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="section legal-review-section" aria-label="שאלון בדיקה משפטית">
          <div className="section-header">
            <p className="eyebrow">בדיקה משפטית</p>
            <h2>אימות מהיר של מקרה, חיוב חריג, מסמך או בקשה משפטית</h2>
          </div>

          <form className="legal-review-form" onSubmit={handleLegalSubmission}>
            <div className="legal-grid">
              <label className="legal-field">
                סוג המקרה
                <select name="caseType" value={legalForm.caseType} onChange={handleLegalFormChange}>
                  <option value="חיוב חריג">חיוב חריג</option>
                  <option value="הסכם וחוזה">הסכם וחוזה</option>
                  <option value="תביעה או דרישה">תביעה או דרישה</option>
                  <option value="עבודה ופיטורים">עבודה ופיטורים</option>
                  <option value="נזיקין">נזיקין</option>
                </select>
              </label>

              <label className="legal-field">
                קטגוריית מסמך נפוצה בדין הישראלי
                <select name="documentCategory" value={legalForm.documentCategory} onChange={handleLegalFormChange}>
                  <option value="הסכם/חוזה">הסכם/חוזה</option>
                  <option value="שכירות">שכירות</option>
                  <option value="דרישת תשלום">דרישת תשלום</option>
                  <option value="חיוב חריג">חיוב חריג</option>
                  <option value="פיטורים">פיטורים</option>
                  <option value="דיני עבודה">דיני עבודה</option>
                  <option value="תביעה/כתב תביעה">תביעה/כתב תביעה</option>
                  <option value="ירושה/צוואה">ירושה/צוואה</option>
                  <option value="נזיקין/תאונה">נזיקין/תאונה</option>
                  <option value="אחר">אחר</option>
                </select>
              </label>

              <label className="legal-field">
                סוג המסמך
                <select name="documentType" value={legalForm.documentType} onChange={handleLegalFormChange}>
                  <option value="הסכם">הסכם</option>
                  <option value="דרישה">דרישה</option>
                  <option value="תביעה">תביעה</option>
                  <option value="הודעה">הודעה</option>
                  <option value="מסמך פנימי">מסמך פנימי</option>
                </select>
              </label>

              <label className="legal-field">
                סוג הבדיקה
                <select name="requestType" value={legalForm.requestType} onChange={handleLegalFormChange}>
                  <option value="בדיקת חיוב חריג">בדיקת חיוב חריג</option>
                  <option value="בדיקת חוזה והתחייבות">בדיקת חוזה והתחייבות</option>
                  <option value="בדיקת תביעה">בדיקת תביעה</option>
                  <option value="בדיקה מול מאגרים ממשלתיים">בדיקה מול מאגרים ממשלתיים</option>
                </select>
              </label>

              <label className="legal-field">
                סכום בסה"כ
                <input
                  type="number"
                  name="amount"
                  value={legalForm.amount}
                  onChange={handleLegalFormChange}
                  placeholder="0"
                />
              </label>

              <label className="legal-field">
                רשות/משרד רלוונטי
                <select name="authority" value={legalForm.authority} onChange={handleLegalFormChange}>
                  <option value="משרד הכלכלה">משרד הכלכלה</option>
                  <option value="משרד המשפטים">משרד המשפטים</option>
                  <option value="רשות התחרות">רשות התחרות</option>
                  <option value="משרד הפנים">משרד הפנים</option>
                  <option value="אחר">אחר</option>
                </select>
              </label>

              <label className="legal-field">
                תחום/אזור
                <select name="jurisdiction" value={legalForm.jurisdiction} onChange={handleLegalFormChange}>
                  <option value="ישראל">ישראל</option>
                  <option value="תל אביב">תל אביב</option>
                  <option value="ירושלים">ירושלים</option>
                  <option value="חיפה">חיפה</option>
                  <option value="אחר">אחר</option>
                </select>
              </label>
            </div>

            <label className="legal-field">
              תיאור המקרה, החיוב או המסמך
              <textarea
                rows={5}
                name="summary"
                value={legalForm.summary}
                onChange={handleLegalFormChange}
                placeholder="פרטים על החיוב, חוזה, תביעה, דרישה, מסמכים או אירוע אחר"
              />
            </label>

            <button type="submit" className="primary-btn submit-btn">
              בדוק מול חוקים, תקנות, פסיקה ומאגרי מידע
            </button>

            {legalReview && (
              <div className="review-result legal-result" aria-live="polite">
                <div className="risk-badge">{legalReview.status}</div>
                <h3>תוצאה ראשונית</h3>
                <p>{legalReview.summary}</p>
                <div className="legal-check-panel">
                  <div>
                    <strong>בדיקות משפטיות</strong>
                    <ul>
                      {legalReview.checks.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>טפסים/בקשות מומלצים</strong>
                    <ul>
                      {legalReview.requests.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <strong>{legalReview.nextStep}</strong>
              </div>
            )}
          </form>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-copy">
          <p className="eyebrow">בואו נדבר</p>
          <h2>קביעת פגישה ראשונית ללא התחייבות</h2>
        </div>

        <div className="footer-actions">
          <a className="primary-btn" href="tel:+972540000000">התקשר עכשיו</a>
          <a className="secondary-btn" href="mailto:hello@myattorney.co">hello@myattorney.co</a>
        </div>
      </footer>
    </div>
  )
}

export default App
