import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const services = [
  {
    title: 'בדיקת עיקול וגביית־יתר',
    description: 'בדיקה חינם של יתרת החוב מול הסכומים שנגבו בפועל, ואיתור גבייה או עיקול ביתר — ללא עלות וללא התחייבות.',
    accent: '01',
    label: 'חינם',
  },
  {
    title: 'טיפול והגשת בקשה להחזר',
    description: 'הכנת הבקשה והגשתה בשמך מול רשות האכיפה והגבייה, בליווי עורך דין. עמלת הצלחה בלבד — משלמים רק מהחזר שהתקבל.',
    accent: '02',
    label: '25% + מע״מ · ללא זכייה אין תשלום',
  },
  {
    title: 'הכנת טפסים לתיקי הוצל״פ',
    description: 'ניסוח והגשה של טפסים ומסמכים בתיקי הוצאה לפועל ודרישות תשלום — טופס בודד או סט מלא לתיק.',
    accent: '03',
    label: 'בתשלום · ₪190 / ₪490',
  },
  {
    title: 'ניטור והתראות לעסקים',
    description: 'שירות מנוי לעסקים למעקב שוטף אחר חובות, עיקולים והתראות — כדי לזהות גבייה ביתר מוקדם ולפעול בזמן.',
    accent: '04',
    label: 'מנוי · בקרוב',
  },
]

// Honest, factual trust points about the SERVICE (no unverifiable metrics).
const stats = [
  { value: 'חינם', label: 'בדיקה ראשונית וזכאות להחזר' },
  { value: '25%', label: 'עמלה רק מהחזר שהתקבל בפועל' },
  { value: 'עו״ד', label: 'הטיפול באחריות ובפיקוח עורך דין' },
  { value: 'מאגרים', label: 'מבוסס מקורות ציבוריים רשמיים' },
]

const steps = [
  'בדיקת עיקול חינם במחשבון',
  'מיון ראשוני ובדיקת עורך דין',
  'חתימה דיגיטלית והגשת בקשה להחזר',
  'קבלת ההחזר — עמלה רק מהתוצאה',
]

const team = [
  { name: 'עו״ד מוחמד מ׳ קבהא', role: 'עורך הדין האחראי · מ.ר 67912', bio: 'אחראי מקצועית על השירות, בדיקת התיקים, הכנת הבקשות והייצוג מול רשות האכיפה והגבייה ובתי המשפט.' },
]

// Testimonials must be real, documented and published with consent — none shown until then.
const testimonials: { quote: string; name: string; role: string }[] = []

const faqs = [
  {
    question: 'מה זה «גבייה ביתר» או «עיקול ביתר»?',
    answer: 'מצב שבו נגבו ממך במסגרת הליכי הוצאה לפועל סכומים העולים על החוב האמיתי — למשל בשל ריבית שגויה, כפל חיוב, גבייה לאחר סילוק החוב, או עיקול על כספים מוגנים. במקרים כאלה ייתכן שמגיע לך החזר.',
  },
  {
    question: 'כמה עולה הבדיקה?',
    answer: 'הבדיקה הראשונית ובדיקת הזכאות להחזר — ללא עלות וללא התחייבות. אם מטופלת ומתקבלת השבה בפועל, שכר הטרחה הוא 25% בתוספת מע״מ מהסכום שיוחזר בלבד. ללא זכייה — אין תשלום.',
  },
  {
    question: 'הבדיקה באתר היא ייעוץ משפטי?',
    answer: 'לא. הכלי מבצע מיון ראשוני בלבד המבוסס על מאגרים ציבוריים רשמיים, ואינו קובע זכאות או מבטיח תוצאה. תשובה מותאמת נבדקת על ידי עו״ד מוחמד קבהא (מ.ר 67912) לפני כל פעולה.',
  },
  {
    question: 'איך מתחילים?',
    answer: 'ממלאים את מחשבון בדיקת העיקול (יתרת החוב מול מה שנגבה), מקבלים מיון ראשוני, ואם עולה חשש לגבייה ביתר — מגישים בקשה להחזר בחתימה דיגיטלית על הסכם שכר טרחה וייפוי כוח, והמשרד מטפל בהמשך.',
  },
]

// Pricing for online form preparation + submission, by case type.
// NOTE: placeholder prices — replace with the firm's real rates.
const pricingTiers = [
  {
    free: true,
    name: 'בדיקת עיקול / החזר עיקול ביתר',
    price: 'חינם',
    tagline: 'הכלי המבוקש ביותר · ללא תשלום מראש',
    highlight: true,
    features: [
      'בדיקת יתרת חוב מול הסכומים שנגבו — ללא עלות',
      'איתור גבייה / עיקול ביתר',
      'הגשת בקשה להחזר בשמך',
      'משלמים רק אם מתקבל החזר — 25% + מע״מ',
      'ללא זכייה — אין תשלום',
    ],
  },
  {
    id: 'single-form',
    name: 'הכנת טופס בודד + שליחה',
    price: '₪190',
    tagline: 'הוצל״פ · דרישת תשלום · התראה · בקשה',
    highlight: false,
    features: [
      'ניסוח טופס לפי סוג המקרה (הוצל״פ / דרישת תשלום)',
      'התאמה אישית לפרטי התיק',
      'קובץ מוכן להגשה',
      'שליחה אונליין ליעד',
    ],
  },
  {
    id: 'form-set',
    name: 'סט טפסים לתיק הוצל״פ שלם',
    price: '₪490',
    tagline: 'תיק הוצל״פ / מספר מסמכים מקושרים',
    highlight: false,
    features: [
      'סט טפסים מלא לפי סוג ההליך (הוצל״פ)',
      'בדיקת מסמכים נלווים',
      'ליווי עד להגשה',
      'שליחה וארכוב בתיק',
    ],
  },
  {
    name: 'שירות משפטי מלא',
    price: 'לפי הצעה',
    tagline: 'ליווי עורך דין מקצה לקצה',
    highlight: false,
    features: [
      'פגישת ייעוץ עם עורך דין',
      'ייצוג בהליך',
      'ניהול מו"מ מול הצד השני',
      'מענה עד סיום התיק',
    ],
  },
]

// Real, curated legal sources (free public databases) used to back and cite the
// immediate answers. Links verified from כל-זכות (Kol-Zchut) + national legislation DB.
const KZ = 'https://www.kolzchut.org.il/he/'
const legalTopics: { match: string[]; label: string; sources: { t: string; u: string }[] }[] = [
  {
    label: 'עיקולים והוצאה לפועל',
    match: ['עיקול', 'עוקל', 'הוצאה לפועל', 'הוצל"פ', 'הוצלפ', 'גבייה', 'גביה', 'כונס', 'אזהרה', 'חשבון מוגבל', 'תיק איחוד'],
    sources: [
      { t: 'הוצאה לפועל וגבייה — מדריך כללי (כל זכות)', u: KZ + '%D7%94%D7%95%D7%A6%D7%90%D7%94_%D7%9C%D7%A4%D7%95%D7%A2%D7%9C_%D7%95%D7%92%D7%91%D7%99%D7%99%D7%94' },
      { t: 'נכסים וכספים שאסור לעקל בהוצאה לפועל (כל זכות)', u: KZ + '%D7%A0%D7%9B%D7%A1%D7%99%D7%9D_%D7%95%D7%9B%D7%A1%D7%A4%D7%99%D7%9D_%D7%A9%D7%90%D7%A1%D7%95%D7%A8_%D7%9C%D7%A2%D7%A7%D7%9C_%D7%91%D7%94%D7%95%D7%A6%D7%90%D7%94_%D7%9C%D7%A4%D7%95%D7%A2%D7%9C' },
      { t: 'שכר עבודה שלא ניתן לעקל או לשעבד (כל זכות)', u: KZ + '%D7%A9%D7%9B%D7%A8_%D7%A2%D7%91%D7%95%D7%93%D7%94_%D7%A9%D7%9C%D7%90_%D7%A0%D7%99%D7%AA%D7%9F_%D7%9C%D7%A2%D7%A7%D7%9C_%D7%90%D7%95_%D7%9C%D7%A9%D7%A2%D7%91%D7%93' },
      { t: 'מדריך לחייב בהוצאה לפועל שיש עליו עיקולים (כל זכות)', u: KZ + '%D7%9E%D7%93%D7%A8%D7%99%D7%9A_%D7%9C%D7%97%D7%99%D7%99%D7%91_%D7%91%D7%94%D7%95%D7%A6%D7%90%D7%94_%D7%9C%D7%A4%D7%95%D7%A2%D7%9C_%D7%A9%D7%99%D7%A9_%D7%A2%D7%99%D7%A7%D7%95%D7%9C%D7%99%D7%9D_%D7%A2%D7%9C%D7%99%D7%95_%D7%90%D7%95_%D7%A2%D7%9C_%D7%A8%D7%9B%D7%95%D7%A9%D7%95' },
    ],
  },
  {
    label: 'דיני עבודה ופיטורים',
    match: ['פיטורים', 'פיצויי פיטורים', 'שימוע', 'הודעה מוקדמת', 'שכר', 'העסקה', 'מעסיק', 'מעביד', 'התפטרות', 'שעות נוספות'],
    sources: [
      { t: 'מדריך בנושא פיטורים (כל זכות)', u: KZ + '%D7%9E%D7%93%D7%A8%D7%99%D7%9A_%D7%91%D7%A0%D7%95%D7%A9%D7%90_%D7%A4%D7%99%D7%98%D7%95%D7%A8%D7%99%D7%9D' },
      { t: 'פיצויי פיטורים לעובד שפוטר (כל זכות)', u: KZ + '%D7%A4%D7%99%D7%A6%D7%95%D7%99%D7%99_%D7%A4%D7%99%D7%98%D7%95%D7%A8%D7%99%D7%9D_%D7%9C%D7%A2%D7%95%D7%91%D7%93_%D7%A9%D7%A4%D7%95%D7%98%D7%A8' },
      { t: 'שימוע לפני פיטורים (כל זכות)', u: KZ + '%D7%A9%D7%99%D7%9E%D7%95%D7%A2_%D7%9C%D7%A4%D7%A0%D7%99_%D7%A4%D7%99%D7%98%D7%95%D7%A8%D7%99%D7%9D' },
      { t: 'הודעה מוקדמת לפיטורים (כל זכות)', u: KZ + '%D7%94%D7%95%D7%93%D7%A2%D7%94_%D7%9E%D7%95%D7%A7%D7%93%D7%9E%D7%AA_%D7%9C%D7%A4%D7%99%D7%98%D7%95%D7%A8%D7%99%D7%9D' },
    ],
  },
]
const generalSources = [
  { t: 'כל זכות — מאגר הזכויות הציבורי', u: KZ + '%D7%A2%D7%9E%D7%95%D7%93_%D7%A8%D7%90%D7%A9%D7%99' },
  { t: 'מאגר החקיקה הלאומי — חוקי מדינת ישראל (gov.il)', u: 'https://www.gov.il/he/service/the_laws_of_the_state_of_israel_in_the_national_legislation_database' },
]
// Official form-retrieval links by request type.
const ECA = 'https://go.gov.il/ecamain'
const formLinksByLabel: Record<string, { t: string; u: string }[]> = {
  'עיקולים והוצאה לפועל': [
    { t: 'רשות האכיפה והגבייה — בקשות, טפסים ואזור אישי (הוצאה לפועל)', u: ECA },
    { t: 'בקשה בטענת "פרעתי" / השבת כספים — מדריך (כל זכות)', u: KZ + '%D7%9E%D7%93%D7%A8%D7%99%D7%9A_%D7%9C%D7%97%D7%99%D7%99%D7%91_%D7%91%D7%94%D7%95%D7%A6%D7%90%D7%94_%D7%9C%D7%A4%D7%95%D7%A2%D7%9C_%D7%A9%D7%99%D7%A9_%D7%A2%D7%99%D7%A7%D7%95%D7%9C%D7%99%D7%9D_%D7%A2%D7%9C%D7%99%D7%95_%D7%90%D7%95_%D7%A2%D7%9C_%D7%A8%D7%9B%D7%95%D7%A9%D7%95' },
  ],
  'דיני עבודה ופיטורים': [
    { t: 'תביעה בבית הדין לעבודה — מידע וטפסים (gov.il)', u: 'https://www.gov.il/he/departments/labor_court' },
  ],
}
const generalForms = [{ t: 'רשות האכיפה והגבייה (הוצאה לפועל) — טפסים והליכים', u: ECA }]

// WhatsApp — high-converting contact channel. Replace with the office's real number (intl format, no +).
const WHATSAPP_NUMBER = '972526611866'
const WHATSAPP_MSG = encodeURIComponent('שלום, הגעתי מהאתר MyAttorney ואשמח לבדוק את המקרה שלי.')
const getLegalSources = (text: string) => {
  const t = (text || '').toLowerCase()
  const topic = legalTopics.find((x) => x.match.some((k) => t.includes(k.toLowerCase())))
  return {
    topicLabel: topic?.label || 'כללי',
    sources: [...(topic?.sources || []), ...generalSources],
    forms: (topic && formLinksByLabel[topic.label]) || generalForms,
  }
}

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
    { label: 'עיקולים/הוצאה לפועל', keywords: ['עיקול', 'עיקולים', 'עוקל', 'הוצאה לפועל', 'הוצל"פ', 'הוצלפ', 'גבייה', 'גביה', 'אזהרה', 'תיק איחוד', 'ריבית פיגורים', 'חשבון מוגבל', 'צו עיקול', 'כונס נכסים', 'רשם ההוצאה לפועל'] },
    { label: 'הסכם/חוזה', keywords: ['הסכם', 'חוזה', 'מסגרת', 'התחייבות', 'מכר', 'השכרה', 'שירות'] },
    { label: 'חיוב חריג', keywords: ['חיוב', 'עמלה', 'ריבית', 'כסף', 'חיוב חריג', 'סכום', 'תשלום'] },
    { label: 'דיני עבודה', keywords: ['פיטורים', 'שכר', 'העסקה', 'עבודה', 'שימוע', 'פיצויים'] },
    { label: 'תביעה/כתב תביעה', keywords: ['תביעה', 'דרישה', 'כתב תביעה', 'בקשה', 'סעד'] },
    { label: 'נזיקין/תאונה', keywords: ['נזק', 'תאונה', 'פגיעה', 'אחריות', 'רפואה', 'פיצוי'] },
    { label: 'ירושה/צוואה', keywords: ['צוואה', 'ירושה', 'עיזבון', 'יורש'] },
    { label: 'משפחה', keywords: ['גירושין', 'משמורת', 'מזונות', 'משפחה', 'ילד', 'בן זוג'] },
  ]

  const isLiens = /עיקול|עוקל|הוצאה לפועל|הוצל"פ|הוצלפ|גבייה|גביה|כונס|רשם ההוצאה/.test(text)

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
    'עיקול',
    'עוקל',
    'הוצאה לפועל',
  ].filter((signal) => text.includes(signal))

  const findings = [
    matchedCategories.length > 0
      ? `זוהתה קטגוריה עיקרית: ${matchedCategories[0].label}.`
      : 'לא זוהתה קטגוריה ברורה; המסמך נבחן כטקסט כללי.',
    riskSignals.length > 0
      ? `נמצאו סמנים של ${riskSignals.slice(0, 3).join(', ')} הדורשים עיון יקרתי.`
      : 'לא נמצאו סמנים חריגים מיידיים, אך יש לבצע בדיקה מלאה של פרטי החיוב/ההתחייבות.',
    isLiens
      ? 'זוהה הקשר של עיקול / הוצאה לפועל — מומלץ לבדוק אם נגבו כספים מעבר לחוב הפסוק (עיקול ביתר), ואם ננקטו הליכי גבייה כדין.'
      : 'המסמך נבדק באמצעות עקרונות של זיהוי סוג מסמך, תוכן, דרישה וסיכון ראשוני.',
  ]

  const recommendations = isLiens
    ? [
        'לבדוק את יתרת החוב המדויקת בתיק ההוצאה לפועל מול הסכומים שנגבו בפועל — כדי לאתר עיקול/גבייה ביתר.',
        'לוודא שצו העיקול הומצא כדין ושלא עוקלו כספים מוגנים (משכורת עד תקרה, קצבאות, מזונות).',
        'לשקול הגשת בקשה לרשם ההוצאה לפועל להשבת כספים שנגבו ביתר ו/או להפחתת/עיכוב הליכים.',
      ]
    : [
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

const buildImmediateQuestionAssessment = (rawQuestion: string) => {
  const text = (rawQuestion || '').toLowerCase()

  const topics: { label: string; keywords: string[]; recs: string[] }[] = [
    {
      label: 'עיקולים / הוצאה לפועל',
      keywords: ['עיקול', 'עוקל', 'הוצאה לפועל', 'הוצל"פ', 'הוצלפ', 'גבייה', 'גביה', 'כונס', 'אזהרה', 'חשבון מוגבל'],
      recs: [
        'בדיקת יתרת החוב מול הסכומים שנגבו בפועל — לאיתור עיקול/גבייה ביתר.',
        'בדיקה שלא עוקלו כספים מוגנים (שכר עד תקרה, קצבאות ביטוח לאומי, מזונות).',
        'אפשרות להגיש בקשה לרשם ההוצאה לפועל להשבת כספים שנגבו ביתר או לעיכוב הליכים.',
      ],
    },
    {
      label: 'דיני עבודה',
      keywords: ['פיטורים', 'שכר', 'שימוע', 'פיצויים', 'העסקה', 'מעביד', 'מעסיק', 'התפטרות', 'שעות נוספות'],
      recs: [
        'בדיקת זכאות לפיצויי פיטורים, הודעה מוקדמת וגמל.',
        'בדיקה אם נערך שימוע כדין לפני הפיטורים.',
        'איסוף תלושי שכר, הסכם העסקה והתכתבויות רלוונטיות.',
      ],
    },
    {
      label: 'חוזים והתחייבויות',
      keywords: ['חוזה', 'הסכם', 'הפרה', 'ביטול', 'התחייבות', 'קנס', 'פיצוי מוסכם', 'שכירות', 'דירה'],
      recs: [
        'בדיקת סעיפי ההפרה, הפיצוי המוסכם ותנאי היציאה מההסכם.',
        'תיעוד ההפרה ומשלוח דרישה/התראה מסודרת בכתב.',
        'בדיקת מועדי התיישנות והתראה טרם נקיטת הליך.',
      ],
    },
    {
      label: 'נזיקין ותאונות',
      keywords: ['תאונה', 'נזק', 'פגיעה', 'ביטוח', 'פיצוי', 'רשלנות'],
      recs: [
        'איסוף תיעוד רפואי, אישורי מחלה והוכחות נזק.',
        'בדיקת אחריות הצד הפוגע וכיסוי ביטוחי רלוונטי.',
        'בדיקת מועד ההתיישנות להגשת תביעה.',
      ],
    },
  ]

  const matched = topics.find((t) => t.keywords.some((k) => text.includes(k)))
  const hasMoney = /כסף|סכום|תשלום|ריבית|חוב|₪|שקל|עמלה/.test(text)
  const isLiens = matched?.label.startsWith('עיקולים')

  const riskLevel = isLiens || hasMoney ? 'דורש בדיקה דחופה' : 'סיכון נמוך-בינוני'

  return {
    title: 'תשובה משפטית ראשונית מיידית',
    summary: matched
      ? `השאלה נוגעת בעיקר לתחום "${matched.label}". להלן הערכה ראשונית וצעדים מומלצים — אינה תחליף לייעוץ משפטי מלא.`
      : 'זוהתה שאלה משפטית כללית. להלן כיווני בדיקה ראשוניים; לתשובה מדויקת נדרשת בחינה של המסמכים והנסיבות.',
    findings: [
      matched ? `תחום זוהה: ${matched.label}.` : 'לא זוהה תחום מובהק — נדרשת הבהרה של פרטי המקרה.',
      hasMoney ? 'זוהה היבט כספי — יש לבחון סכומים, ריבית וחיובים אפשריים ביתר.' : 'לא זוהה היבט כספי מובהק בשאלה.',
      'הבדיקה מבוצעת באופן מיידי לפי ניתוח מילולי של השאלה, כשלב מקדים לבדיקה מעמיקה.',
    ],
    recommendations: matched ? matched.recs : [
      'לפרט את השתלשלות האירועים, התאריכים והצדדים המעורבים.',
      'לאסוף כל מסמך רלוונטי (הסכם, מכתב, דרישה, אישור).',
      'לבדוק מועדי התיישנות/תגובה לפני נקיטת צעד.',
    ],
    riskLevel,
    nextStep: 'זוהי הערכה ראשונית אוטומטית ולא ייעוץ משפטי מחייב. להמשך — ניתן להעלות מסמך לבדיקה, לפנות לשירות מלא, או להזמין הכנת טפסים ושליחתם.',
  }
}

type GarnishmentInput = {
  originalDebt: string
  totalCollected: string
  extraCharges: string
  incomeType: 'salary' | 'benefit' | 'other'
}

const toNumber = (v: string) => {
  const n = Number(String(v).replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

const formatILS = (n: number) =>
  '₪' + Math.round(n).toLocaleString('he-IL')

// General (non-binding) over-garnishment estimate. Core is simple arithmetic;
// protected-income flags are qualitative. Not legal advice.
const buildGarnishmentAssessment = (input: GarnishmentInput) => {
  const debt = toNumber(input.originalDebt)
  const collected = toNumber(input.totalCollected)
  const extra = toNumber(input.extraCharges)
  const lawfulTotal = debt + extra
  const over = collected - lawfulTotal

  const protectedIncome = input.incomeType === 'benefit'
  const flags: string[] = []
  if (over > 0) flags.push(`לפי הנתונים, ייתכן שנגבו ממך כ-${formatILS(over)} מעבר לחוב ולתוספות שציינת.`)
  if (over <= 0 && collected > 0) flags.push('לפי הנתונים שהוזנו לא זוהתה גבייה ביתר מובהקת — אך ריביות/הוצאות שנוספו שלא כדין עשויות לשנות זאת.')
  if (protectedIncome) flags.push('ציינת שההכנסה היא קצבה — קצבאות רבות מוגנות מעיקול. ייתכן שעוקלו כספים מוגנים שיש להשיב.')
  if (debt === 0) flags.push('לא הוזן סכום חוב מקורי — כדי לדייק, הזן את סכום החוב הפסוק.')

  const likelyRefund = over > 0
  const verdict = likelyRefund
    ? 'סביר שנגבה ביתר — מומלץ לבדוק החזר'
    : protectedIncome
      ? 'ייתכן שעוקלו כספים מוגנים — כדאי בדיקה'
      : 'לא זוהתה גבייה ביתר מובהקת'

  const riskLevel = likelyRefund || protectedIncome ? 'דורש בדיקה דחופה' : 'תקין לכאורה'

  return {
    title: 'תוצאת בדיקת עיקול',
    verdict,
    estimatedOverpaid: over > 0 ? Math.round(over) : 0,
    riskLevel,
    summary: likelyRefund
      ? `לפי הבדיקה הכללית, ייתכן שנגבו ממך כ-${formatILS(over)} ביתר. ניתן לבחון הגשת בקשה להחזר.`
      : 'לפי הנתונים שהוזנו, לא זוהתה גבייה ביתר ברורה. עדיין מומלץ לוודא את פירוט החיובים בתיק.',
    findings: flags.length ? flags : ['לא זוהו סימנים חריגים לפי הנתונים שהוזנו.'],
    recommendations: [
      'להוציא "תדפיס תיק" מלא ממערכת ההוצאה לפועל ולהשוות מול הסכומים שנגבו בפועל.',
      'לוודא שלא עוקלו כספים מוגנים (קצבאות, שכר עד התקרה המוגנת, מזונות).',
      likelyRefund ? 'להגיש בקשה לרשם ההוצאה לפועל להשבת כספים שנגבו ביתר.' : 'לשמור תיעוד ולעקוב אחר חיובים עתידיים בתיק.',
    ],
    nextStep: 'בדיקה כללית ומשוערת בלבד, אינה ייעוץ משפטי מחייב. לקבלת החזר ניתן להגיש בקשה — לאחר רישום ואישור מפורש שלך המשרד יטפל בבקשה.',
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
  const [heroTab, setHeroTab] = useState<'document' | 'garnish' | 'question'>('garnish')
  const [legalQuestion, setLegalQuestion] = useState('')
  const [isCheckingQuestion, setIsCheckingQuestion] = useState(false)
  const [garnishInput, setGarnishInput] = useState<GarnishmentInput>({ originalDebt: '', totalCollected: '', extraCharges: '', incomeType: 'salary' })
  const [garnishResult, setGarnishResult] = useState<ReturnType<typeof buildGarnishmentAssessment> | null>(null)
  const [refund, setRefund] = useState({ open: false, fullName: '', idNumber: '', phone: '', email: '', consent: false, truth: false, signature: '', sending: false, done: false, error: '', refId: '' })
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const sigDrawing = useRef(false)
  const [lookupSources, setLookupSources] = useState<{ topicLabel: string; sources: { t: string; u: string }[]; forms?: { t: string; u: string }[] } | null>(null)
  const [aiResult, setAiResult] = useState<{
    bottomLine?: string
    plainSummary?: string
    caseDecoding?: string
    legalAnalysis?: string
    steps?: string[]
    remedies?: string[]
    sources?: { title?: string; url?: string }[]
    riskLevel?: string
    disclaimer?: string
  } | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [garnishProcessing, setGarnishProcessing] = useState(false)
  const [procStage, setProcStage] = useState(0)
  const [countUp, setCountUp] = useState(0)
  const [consent, setConsent] = useState<boolean>(() => {
    try { return !!window.localStorage.getItem('mya-consent') } catch { return false }
  })
  const [showConsent, setShowConsent] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const [route, setRoute] = useState<string>(() => window.location.hash.replace('#', ''))
  const [clientAuthed, setClientAuthed] = useState(false)
  const [clientInfo, setClientInfo] = useState<{ name?: string; caseId?: string } | null>(null)
  const [clientLoginForm, setClientLoginForm] = useState({ caseId: '', code: '', error: '', busy: false })
  const [loginMethod, setLoginMethod] = useState<'phone' | 'google' | 'code'>('phone')
  const [phoneLogin, setPhoneLogin] = useState({ phone: '', code: '', step: 'phone' as 'phone' | 'code', devCode: '', testMode: false, error: '', busy: false })
  const [googleClientId, setGoogleClientId] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [welcomeInfo, setWelcomeInfo] = useState<{ caseId?: string; code?: string } | null>(null)

  useEffect(() => {
    window.localStorage.setItem(selectedProfileStorageKey, selectedProfileId)
    updateQueryProfile(selectedProfileId)
  }, [selectedProfileId])

  useEffect(() => {
    window.localStorage.setItem(portalStorageKey, JSON.stringify(portalStateByProfile))
  }, [portalStateByProfile])

  const activeProfile =
    clientProfiles.find((profile) => profile.id === selectedProfileId) ??
    (clientInfo
      ? { id: selectedProfileId, name: clientInfo.name || 'לקוח', caseId: clientInfo.caseId || '', phase: 'תיק פעיל', nextAction: '', status: 'פעיל' }
      : clientProfiles[0])
  const activePortalState = portalStateByProfile[activeProfile.id] ?? createInitialPortalState()
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

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace('#', ''))
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Animated processing stages: advance through 3 stages while a check runs.
  useEffect(() => {
    const active = aiLoading || garnishProcessing
    if (!active) { setProcStage(0); return }
    setProcStage(0)
    const id = setInterval(() => setProcStage((s) => Math.min(s + 1, 2)), 1500)
    return () => clearInterval(id)
  }, [aiLoading, garnishProcessing])

  // Count-up animation for the estimated over-collected amount.
  useEffect(() => {
    const target = Number(garnishResult?.estimatedOverpaid) || 0
    if (!target) { setCountUp(0); return }
    let raf = 0
    const start = performance.now()
    const dur = 1300
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setCountUp(Math.round(target * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [garnishResult])

  // Fetch public runtime config (Google client id) once the client area is opened.
  useEffect(() => {
    if (route !== 'client' || googleClientId) return
    fetch(`${apiBaseUrl}/api/public-config`)
      .then((r) => r.json())
      .then((d) => { if (d && d.googleClientId) setGoogleClientId(d.googleClientId) })
      .catch(() => undefined)
  }, [route, googleClientId])

  // Load Google Identity Services and render the sign-in button when selected.
  useEffect(() => {
    if (route !== 'client' || clientAuthed || loginMethod !== 'google' || !googleClientId) return
    const SRC = 'https://accounts.google.com/gsi/client'
    const init = () => {
      const g = (window as any).google
      if (!g?.accounts?.id) return
      g.accounts.id.initialize({
        client_id: googleClientId,
        callback: (resp: any) => { if (resp?.credential) handleGoogleCredential(resp.credential) },
      })
      const el = document.getElementById('google-signin-btn')
      if (el) {
        el.innerHTML = ''
        g.accounts.id.renderButton(el, { theme: 'outline', size: 'large', width: 300, text: 'continue_with', locale: 'he' })
      }
    }
    if ((window as any).google?.accounts?.id) { init(); return }
    let script = document.querySelector(`script[src="${SRC}"]`) as HTMLScriptElement | null
    if (!script) {
      script = document.createElement('script')
      script.src = SRC
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
    script.addEventListener('load', init)
    return () => script?.removeEventListener('load', init)
  }, [route, clientAuthed, loginMethod, googleClientId])

  const approveConsent = () => {
    try { window.localStorage.setItem('mya-consent', new Date().toISOString()) } catch { /* ignore */ }
    setConsent(true)
    setShowConsent(false)
  }

  const applyClientSession = (d: { profileId: string; name?: string; caseId?: string; isNew?: boolean; code?: string }) => {
    setSelectedProfileId(d.profileId)
    setClientInfo({ name: d.name, caseId: d.caseId })
    setClientAuthed(true)
    setShowLogin(false)
    if (d.isNew) setWelcomeInfo({ caseId: d.caseId, code: d.code })
  }

  // Smart gate: services are browsable, but acting requires a quick login (which auto-opens a case).
  const ensureAuth = (): boolean => {
    if (clientAuthed) return true
    setShowLogin(true)
    return false
  }

  const handleClientLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setClientLoginForm((f) => ({ ...f, busy: true, error: '' }))
    try {
      const r = await fetch(`${apiBaseUrl}/api/client/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: clientLoginForm.caseId, code: clientLoginForm.code }),
      })
      const d = await r.json()
      if (r.ok && d.profileId) {
        applyClientSession(d)
        setClientLoginForm((f) => ({ ...f, busy: false, error: '' }))
      } else {
        setClientLoginForm((f) => ({ ...f, busy: false, error: d.error || 'התחברות נכשלה' }))
      }
    } catch {
      setClientLoginForm((f) => ({ ...f, busy: false, error: 'השרת אינו זמין כרגע' }))
    }
  }

  const requestOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPhoneLogin((f) => ({ ...f, busy: true, error: '' }))
    try {
      const r = await fetch(`${apiBaseUrl}/api/client/otp/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneLogin.phone }),
      })
      const d = await r.json()
      if (r.ok && d.sent) {
        setPhoneLogin((f) => ({ ...f, busy: false, step: 'code', devCode: d.devCode || '', testMode: !!d.testMode, error: '' }))
      } else {
        setPhoneLogin((f) => ({ ...f, busy: false, error: d.error || 'שליחת הקוד נכשלה' }))
      }
    } catch {
      setPhoneLogin((f) => ({ ...f, busy: false, error: 'השרת אינו זמין כרגע' }))
    }
  }

  const verifyOtp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPhoneLogin((f) => ({ ...f, busy: true, error: '' }))
    try {
      const r = await fetch(`${apiBaseUrl}/api/client/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneLogin.phone, code: phoneLogin.code }),
      })
      const d = await r.json()
      if (r.ok && d.profileId) {
        applyClientSession(d)
        setPhoneLogin({ phone: '', code: '', step: 'phone', devCode: '', testMode: false, error: '', busy: false })
      } else {
        setPhoneLogin((f) => ({ ...f, busy: false, error: d.error || 'הקוד שגוי' }))
      }
    } catch {
      setPhoneLogin((f) => ({ ...f, busy: false, error: 'השרת אינו זמין כרגע' }))
    }
  }

  const handleGoogleCredential = async (credential: string) => {
    try {
      const r = await fetch(`${apiBaseUrl}/api/client/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      })
      const d = await r.json()
      if (r.ok && d.profileId) {
        applyClientSession(d)
      } else {
        setPhoneLogin((f) => ({ ...f, error: d.error || 'כניסה עם Google נכשלה' }))
        setLoginMethod('phone')
      }
    } catch {
      setPhoneLogin((f) => ({ ...f, error: 'השרת אינו זמין כרגע' }))
    }
  }

  const handleCheckout = async (tierId?: string) => {
    if (!tierId) {
      window.location.href = '#contact'
      return
    }
    try {
      const response = await fetch(`${apiBaseUrl}/api/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierId }),
      })
      const data = await response.json()
      if (data && data.url) {
        window.location.href = data.url // → Stripe hosted Checkout (Apple Pay / Google Pay / cards)
        return
      }
      window.location.href = '#contact' // not configured yet / error → contact fallback
    } catch {
      window.location.href = '#contact'
    }
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
    setLookupSources(getLegalSources(`${file.name} ${textPreview}`))
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

    if (!ensureAuth()) return
    if (!consent) { setShowConsent(true); return }

    runAiAnalysis({ file: uploadedFile })

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

  const runAiAnalysis = async (opts: { question?: string; file?: File | null }) => {
    setAiLoading(true)
    setAiResult(null)
    const startedAt = Date.now()
    try {
      let response: Response
      if (opts.file) {
        const body = new FormData()
        body.append('file', opts.file)
        if (opts.question) body.append('question', opts.question)
        response = await fetch(`${apiBaseUrl}/api/legal-analyze`, { method: 'POST', body })
      } else {
        response = await fetch(`${apiBaseUrl}/api/legal-analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: opts.question || '' }),
        })
      }
      const data = await response.json()
      if (data && data.analysis) setAiResult(data.analysis)
      else setAiResult(null)
    } catch {
      setAiResult(null)
    } finally {
      // Keep the animated stages on screen for at least ~4.5s so the experience is visible.
      const elapsed = Date.now() - startedAt
      const remaining = Math.max(0, 4500 - elapsed)
      window.setTimeout(() => setAiLoading(false), remaining)
    }
  }

  const handleQuestionSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!consent) { setShowConsent(true); return }
    if (!legalQuestion.trim()) {
      setReviewResult({
        title: 'לא הוזנה שאלה',
        summary: 'כדי לקבל בדיקה מיידית יש להקליד את השאלה המשפטית.',
        findings: ['לא הוזן טקסט'],
        recommendations: ['נסח בקצרה מה קרה, מי הצדדים ומה מטריד אותך.'],
        riskLevel: 'לא זמין',
        nextStep: 'המערכת אינה יכולה לבצע בדיקה ללא שאלה.',
      })
      return
    }
    if (!ensureAuth()) return
    setIsCheckingQuestion(true)
    // Immediate local assessment + cited sources from public legal databases.
    const assessment = buildImmediateQuestionAssessment(legalQuestion)
    setReviewResult(assessment)
    setLookupSources(getLegalSources(legalQuestion))
    setIsCheckingQuestion(false)
    runAiAnalysis({ question: legalQuestion })
  }

  const startLiensCheck = () => {
    setHeroTab('garnish')
    if (typeof document !== 'undefined') {
      const el = document.getElementById('legal-tool')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleGarnishSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!consent) { setShowConsent(true); return }
    const result = buildGarnishmentAssessment(garnishInput)
    setGarnishResult(null)
    setGarnishProcessing(true)
    window.setTimeout(() => {
      setGarnishResult(result)
      setLookupSources(getLegalSources('עיקול הוצאה לפועל גבייה כספים מוגנים'))
      setRefund((r) => ({ ...r, open: false, done: false, error: '' }))
      setGarnishProcessing(false)
    }, 4000)
  }

  const openRefund = () => setRefund((r) => ({ ...r, open: true, done: false, error: '' }))

  // ---- Electronic signature pad ----
  const sigPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = sigCanvasRef.current!
    const r = c.getBoundingClientRect()
    return { x: (e.clientX - r.left) * (c.width / r.width), y: (e.clientY - r.top) * (c.height / r.height) }
  }
  const sigStart = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = sigCanvasRef.current
    if (!c) return
    sigDrawing.current = true
    const ctx = c.getContext('2d')!
    const p = sigPos(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    c.setPointerCapture?.(e.pointerId)
  }
  const sigMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!sigDrawing.current) return
    const c = sigCanvasRef.current!
    const ctx = c.getContext('2d')!
    const p = sigPos(e)
    ctx.lineWidth = 2.2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#0f172a'
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }
  const sigEnd = () => {
    if (!sigDrawing.current) return
    sigDrawing.current = false
    const c = sigCanvasRef.current
    if (c) setRefund((r) => ({ ...r, signature: c.toDataURL('image/png') }))
  }
  const clearSignature = () => {
    const c = sigCanvasRef.current
    if (c) c.getContext('2d')!.clearRect(0, 0, c.width, c.height)
    setRefund((r) => ({ ...r, signature: '' }))
  }

  const handleRefundSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!refund.fullName.trim() || !(refund.phone.trim() || refund.email.trim())) {
      setRefund((r) => ({ ...r, error: 'יש למלא שם מלא וטלפון או דוא"ל.' }))
      return
    }
    if (!refund.consent) {
      setRefund((r) => ({ ...r, error: 'יש לאשר את תנאי ההתקשרות ושכר הטרחה מותנה ההצלחה.' }))
      return
    }
    if (!refund.truth) {
      setRefund((r) => ({ ...r, error: 'יש לאשר את הצהרת נכונות הפרטים.' }))
      return
    }
    if (!refund.signature) {
      setRefund((r) => ({ ...r, error: 'נדרשת חתימה אלקטרונית בתחתית הטופס.' }))
      return
    }
    setRefund((r) => ({ ...r, sending: true, error: '' }))
    try {
      const resp = await fetch(`${apiBaseUrl}/api/refund-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: refund.fullName,
          idNumber: refund.idNumber,
          phone: refund.phone,
          email: refund.email,
          consent: refund.consent,
          truthDeclared: refund.truth,
          powerOfAttorney: refund.consent,
          attorney: 'עו״ד מוחמד מ׳ קבהא, מ.ר 67912',
          feeAgreement: '25%+VAT success-fee, no win no fee',
          signature: refund.signature,
          details: garnishResult
            ? {
                summary: garnishResult.summary,
                estimatedOverpaid: garnishResult.estimatedOverpaid,
                originalDebt: toNumber(garnishInput.originalDebt),
                totalCollected: toNumber(garnishInput.totalCollected),
                incomeType: garnishInput.incomeType,
                verdict: garnishResult.verdict,
              }
            : {},
        }),
      })
      let refId = ''
      try { const d = await resp.json(); refId = (d && d.id) || '' } catch { /* ignore */ }
      setRefund((r) => ({ ...r, sending: false, done: true, refId }))
    } catch {
      setRefund((r) => ({ ...r, sending: false, done: true }))
    }
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

  const loginMethodsMarkup = (
    <>
      <div className="login-methods">
        <button type="button" className={`login-method-tab${loginMethod === 'phone' ? ' active' : ''}`} onClick={() => setLoginMethod('phone')}>📱 טלפון</button>
        <button type="button" className={`login-method-tab${loginMethod === 'google' ? ' active' : ''}`} onClick={() => setLoginMethod('google')}>Google</button>
        <button type="button" className={`login-method-tab${loginMethod === 'code' ? ' active' : ''}`} onClick={() => setLoginMethod('code')}>קוד מהמשרד</button>
      </div>

      {loginMethod === 'phone' && phoneLogin.step === 'phone' && (
        <form onSubmit={requestOtp}>
          <label>מספר טלפון נייד
            <input type="tel" inputMode="tel" value={phoneLogin.phone} onChange={(e) => setPhoneLogin((f) => ({ ...f, phone: e.target.value }))} placeholder="050-000-0000" />
          </label>
          {phoneLogin.error && <p className="refund-error">{phoneLogin.error}</p>}
          <button type="submit" className="primary-btn submit-btn" disabled={phoneLogin.busy}>{phoneLogin.busy ? 'שולח...' : 'שלח לי קוד ב-SMS'}</button>
          <p className="login-hint-mini">נשלח קוד חד-פעמי לנייד. לקוח חדש — נפתח לך תיק אוטומטית.</p>
        </form>
      )}

      {loginMethod === 'phone' && phoneLogin.step === 'code' && (
        <form onSubmit={verifyOtp}>
          {phoneLogin.testMode && phoneLogin.devCode && (
            <p className="paid-banner">מצב בדיקה — הקוד שלך: <strong>{phoneLogin.devCode}</strong></p>
          )}
          <label>הקוד שקיבלת ב-SMS
            <input inputMode="numeric" value={phoneLogin.code} onChange={(e) => setPhoneLogin((f) => ({ ...f, code: e.target.value }))} placeholder="6 ספרות" />
          </label>
          {phoneLogin.error && <p className="refund-error">{phoneLogin.error}</p>}
          <button type="submit" className="primary-btn submit-btn" disabled={phoneLogin.busy}>{phoneLogin.busy ? 'מתחבר...' : 'כניסה'}</button>
          <button type="button" className="bo-back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setPhoneLogin((f) => ({ ...f, step: 'phone', code: '', error: '' }))}>← שינוי מספר / שליחה חוזרת</button>
        </form>
      )}

      {loginMethod === 'google' && (
        <div className="google-login-wrap">
          {googleClientId ? (
            <div id="google-signin-btn" className="google-btn-holder" />
          ) : (
            <p className="login-hint-mini">כניסת Google תופעל בקרוב (ממתין להגדרת המשרד). בינתיים אפשר להיכנס בטלפון או בקוד.</p>
          )}
          {phoneLogin.error && <p className="refund-error">{phoneLogin.error}</p>}
          <p className="login-hint-mini">כניסה מהירה עם חשבון Google שלך.</p>
        </div>
      )}

      {loginMethod === 'code' && (
        <form onSubmit={handleClientLogin}>
          <label>מספר תיק
            <input value={clientLoginForm.caseId} onChange={(e) => setClientLoginForm((f) => ({ ...f, caseId: e.target.value }))} placeholder="מספר התיק שקיבלת מהמשרד" />
          </label>
          <label>קוד גישה
            <input type="password" value={clientLoginForm.code} onChange={(e) => setClientLoginForm((f) => ({ ...f, code: e.target.value }))} />
          </label>
          {clientLoginForm.error && <p className="refund-error">{clientLoginForm.error}</p>}
          <button type="submit" className="primary-btn submit-btn" disabled={clientLoginForm.busy}>{clientLoginForm.busy ? 'מתחבר...' : 'כניסה'}</button>
        </form>
      )}
    </>
  )

  return (
    <div className={route === 'client' ? 'page-shell client-mode' : 'page-shell'}>
      {showConsent && (
        <div className="consent-overlay" role="dialog" aria-modal="true">
          <div className="consent-modal">
            <h3>הצהרה, תנאי שימוש והסכמת פרטיות</h3>
            <div className="consent-body">
              <p><strong>מידע ולא ייעוץ:</strong> המידע והתוצאות באתר הם מידע משפטי כללי המבוסס על מקורות ומאגרים ציבוריים רשמיים (כל זכות, מאגר החקיקה הלאומי) וכלי בדיקה אוטומטיים. המידע <strong>אינו מהווה ייעוץ משפטי</strong>, אינו תחליף לייעוץ פרטני עם עורך דין, ואינו יוצר יחסי עורך דין–לקוח.</p>
              <p><strong>הסתמכות:</strong> אין להסתמך על התוצאה כבסיס בלעדי לפעולה או להליך משפטי. באחריות המשתמש לפנות לייעוץ מקצועי פרטני טרם נקיטת צעד.</p>
              <p><strong>הגנת פרטיות:</strong> בהעלאת מסמך או פרטים, המשתמש מסכים לעיבוד המידע לצורך הבדיקה בלבד, בהתאם לחוק הגנת הפרטיות, התשמ״א‑1981 ותקנותיו. המידע נשמר מאובטח ולא יימסר לצד שלישי ללא הסכמה, למעט כנדרש על פי דין. המשתמש מאשר כי המידע שהועלה שייך לו או שבידו הרשאה כדין להעלותו.</p>
              <p><strong>הגבלת אחריות:</strong> השימוש באתר ובכלים הוא באחריות המשתמש בלבד. המפעיל/המשרד לא יישא באחריות לכל נזק ישיר או עקיף שייגרם מהשימוש או מהסתמכות על המידע והתוצאות.</p>
            </div>
            <label className="consent-check">
              <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} />
              <span>קראתי, הבנתי ואני מאשר/ת את התנאים ואת הסכמת הפרטיות.</span>
            </label>
            <div className="consent-actions">
              <button type="button" className="primary-btn" disabled={!consentChecked} onClick={approveConsent}>אישור והמשך</button>
              <button type="button" className="secondary-btn" onClick={() => setShowConsent(false)}>ביטול</button>
            </div>
          </div>
        </div>
      )}

      {showLogin && !clientAuthed && (
        <div className="consent-overlay" role="dialog" aria-modal="true" onClick={() => setShowLogin(false)}>
          <div className="consent-modal login-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="login-modal-close" aria-label="סגירה" onClick={() => setShowLogin(false)}>✕</button>
            <p className="eyebrow">כניסה / הרשמה מהירה</p>
            <h3>כניסה מהירה לאתר</h3>
            <p className="client-login-sub">התחבר/י בשניות כדי להשתמש בשירותים. לקוח חדש — נפתח לך תיק אוטומטית.</p>
            {loginMethodsMarkup}
          </div>
        </div>
      )}

      {welcomeInfo && (
        <div className="consent-overlay" role="dialog" aria-modal="true" onClick={() => setWelcomeInfo(null)}>
          <div className="consent-modal welcome-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🎉 ברוך הבא! נפתח לך תיק אישי</h3>
            <p className="client-login-sub">שמור/י את הפרטים — איתם תוכל/י להיכנס גם בעתיד:</p>
            <div className="welcome-case">
              <div><span>מספר תיק</span><strong>{welcomeInfo.caseId}</strong></div>
              {welcomeInfo.code && <div><span>קוד גישה</span><strong>{welcomeInfo.code}</strong></div>}
            </div>
            <p className="login-hint-mini">אפשר להיכנס גם בטלפון או Google — בלי לזכור את הקוד.</p>
            <button type="button" className="primary-btn" onClick={() => setWelcomeInfo(null)}>הבנתי, נמשיך</button>
          </div>
        </div>
      )}

      {refund.open && (
        <div className="consent-overlay" role="dialog" aria-modal="true" onClick={() => setRefund((r) => ({ ...r, open: false }))}>
          <div className="consent-modal auth-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="login-modal-close" aria-label="סגירה" onClick={() => setRefund((r) => ({ ...r, open: false }))}>✕</button>
            {refund.done ? (
              <div className="auth-done">
                <div className="auth-done-check">✓</div>
                <h3>תודה! ההרשאה נקלטה בהצלחה</h3>
                <p>קיבלנו את ההרשאה והחתימה הדיגיטלית שלך, והן נשמרו במערכת.</p>
                {refund.refId && <div className="auth-done-ref">מספר פנייה: <strong>{refund.refId}</strong></div>}
                <div className="auth-done-next">
                  <p className="auth-done-next-title">מה קורה עכשיו?</p>
                  <ol>
                    <li>נציג מהמשרד בוחן את הפרטים והמסמכים שמסרת.</li>
                    <li>ניצור איתך קשר בטלפון או במייל לתיאום המשך.</li>
                    <li>המשרד מכין ומגיש את הבקשה מול ההוצאה לפועל — אנחנו עושים הכל בשבילך.</li>
                  </ol>
                  <p className="auth-done-fee">הבדיקה חינם · שכר טרחה 25% + מע״מ ייגבה רק אם יתקבל החזר בפועל.</p>
                </div>
                <button type="button" className="primary-btn" onClick={() => setRefund((r) => ({ ...r, open: false }))}>מצוין, סגור</button>
              </div>
            ) : (
              <>
                <p className="eyebrow">מתן הרשאה למשרד · אנחנו נעשה הכל בשבילך</p>
                <h3>הרשאה לטיפול, ייפוי כוח והסכם שכר טרחה</h3>
                <p className="refund-note">טופס אחד שכולל את כל מה שצריך כדי שהמשרד יתחיל לטפל: הסכם שכר טרחה מותנה הצלחה, ייפוי כוח, ומדיניות פרטיות — באישור וחתימה דיגיטלית. הבקשה נשלחת למשרד בלבד ואינה מוגשת לרשויות באופן אוטומטי.</p>
                <form className="refund-form" onSubmit={handleRefundSubmit}>
                  <div className="garnish-grid">
                    <label>שם מלא
                      <input value={refund.fullName} onChange={(e) => setRefund((r) => ({ ...r, fullName: e.target.value }))} />
                    </label>
                    <label>תעודת זהות
                      <input inputMode="numeric" value={refund.idNumber} onChange={(e) => setRefund((r) => ({ ...r, idNumber: e.target.value }))} />
                    </label>
                    <label>טלפון
                      <input inputMode="tel" value={refund.phone} onChange={(e) => setRefund((r) => ({ ...r, phone: e.target.value }))} />
                    </label>
                    <label>דוא"ל
                      <input inputMode="email" value={refund.email} onChange={(e) => setRefund((r) => ({ ...r, email: e.target.value }))} />
                    </label>
                  </div>
                  <div className="fee-agreement">
                    <p className="fee-agreement-title">הסכם שכר טרחה מותנה הצלחה וייפוי כוח</p>
                    <p className="fee-agreement-sub">משרד עורכי דין מוחמד מ. קבהא · מ.ר 67912 · בסמ״ה, רח' אלבוח'ארי 95</p>
                    <ol className="fee-agreement-list">
                      <li>הבדיקה וההערכה הראשונית ניתנות ללא עלות.</li>
                      <li><strong>שכר טרחה מותנה הצלחה:</strong> שכר הטרחה יעמוד על <strong>25% בתוספת מע״מ כדין</strong>, מכל סכום שיושב, יוחזר או ייחסך ללקוח בפועל בעניין בלבד. לא הושב סכום — לא יחול שכר טרחה («ללא זכייה — אין תשלום»). שכר הטרחה יחול וייגבה עם קבלת הכספים בפועל.</li>
                      <li>אגרות והוצאות חיצוניות, ככל שיהיו, יחולו על הלקוח ואינן כלולות בשכר הטרחה.</li>
                      <li><strong>ייפוי כוח:</strong> הלקוח ממנה ומייפה בזאת את כוחו של עו״ד מוחמד מ׳ קבהא, מ.ר 67912, לפעול בשמו ובמקומו בעניין השבת כספים שנגבו ביתר — לרבות הגשת בקשות, כתבי טענות ומסמכים לרשות האכיפה והגבייה (ההוצאה לפועל), לבתי המשפט ולכל גורם מוסמך; עיון בתיקים; ניהול משא ומתן; וקבלת כספים בנאמנות עבור הלקוח — עד להשלמת הטיפול או ביטולו בכתב.</li>
                      <li><strong>הצהרת נכונות פרטים ואחריות:</strong> הלקוח מצהיר כי כל הפרטים, הנתונים והמסמכים שמסר נכונים, מלאים ומדויקים, וכי ידוע לו שהמשרד מסתמך על הצהרתו. נמסרו על ידו פרטים שגויים, חלקיים, כוזבים או מטעים — תחול עליו האחריות המלאה והבלעדית לכל תוצאה, נזק, הוצאה או חבות הנובעים מכך, והמשרד יהיה פטור מכל אחריות בגינם.</li>
                      <li>המידע והתוצאות בכלי האתר הם מידע כללי המבוסס על מאגרים ציבוריים רשמיים, אינם מהווים ייעוץ משפטי פרטני ואינם התחייבות לתוצאה. עיבוד המידע ייעשה לצורך הטיפול בלבד, בהתאם לחוק הגנת הפרטיות, התשמ״א-1981.</li>
                      <li>סימון תיבות האישור, לצד מסירת שם הלקוח, מספר תעודת הזהות והמועד, מהווים הסכמה וייפוי כוח חתומים מרחוק לכל דבר ועניין.</li>
                    </ol>
                  </div>
                  <label className="consent-line">
                    <input type="checkbox" checked={refund.consent} onChange={(e) => setRefund((r) => ({ ...r, consent: e.target.checked }))} />
                    <span>קראתי והבנתי, ואני מסכים/ה להסכם שכר הטרחה המותנה (25% + מע״מ מהסכום שיושב בפועל; ללא זכייה — אין תשלום), <strong>ומייפה בזאת את כוחו של עו״ד מוחמד מ׳ קבהא (מ.ר 67912)</strong> לטפל ולייצגני בעניין.</span>
                  </label>
                  <label className="consent-line">
                    <input type="checkbox" checked={refund.truth} onChange={(e) => setRefund((r) => ({ ...r, truth: e.target.checked }))} />
                    <span>אני מצהיר/ה כי כל הפרטים שמסרתי נכונים, מלאים ומדויקים, ומבין/ה כי במסירת פרטים שגויים או חלקיים תחול עליי האחריות המלאה והבלעדית לכל תוצאה הנובעת מכך.</span>
                  </label>
                  <div className="sig-block">
                    <div className="sig-head">
                      <p className="sig-label">חתימה אלקטרונית <span>— חתמו כאן בעכבר או באצבע</span></p>
                      <button type="button" className="sig-clear" onClick={clearSignature}>נקה</button>
                    </div>
                    <canvas
                      ref={sigCanvasRef}
                      className="sig-canvas"
                      width={600}
                      height={170}
                      onPointerDown={sigStart}
                      onPointerMove={sigMove}
                      onPointerUp={sigEnd}
                      onPointerLeave={sigEnd}
                    />
                    <p className="sig-note">החתימה נשמרת עם חותמת זמן ומהווה חתימה אלקטרונית לאישור ההסכם וייפוי הכוח (חוק חתימה אלקטרונית, התשס״א-2001).</p>
                  </div>
                  {refund.error && <p className="refund-error">{refund.error}</p>}
                  <button type="submit" className="primary-btn submit-btn" disabled={refund.sending}>
                    {refund.sending ? 'שולח...' : '✍️ אישור, חתימה ומתן הרשאה'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">M</div>
          <div>
            <p className="brand-name">MyAttorney</p>
            <p className="brand-subtitle">משרד עורכי דין</p>
          </div>
        </div>

        <nav className="main-nav" aria-label="כותרת עיקרית">
          <a href="#legal-tool">בדיקה מיידית</a>
          <a href="#pricing">תמחור</a>
          <a href="#services">שירותים</a>
          <a href="#faq">שאלות נפוצות</a>
          <a href="#contact">צור קשר</a>
          {clientAuthed ? (
            <a href="#client" className="staff-link">שלום, {clientInfo?.name || 'לקוח'} · אזור אישי</a>
          ) : (
            <button type="button" className="staff-link login-nav-btn" onClick={() => setShowLogin(true)}>כניסה / הרשמה</button>
          )}
          <a href="#staff" className="staff-link">אזור צוות</a>
        </nav>

        <a className="primary-btn" href="#legal-tool">
          בדיקה מיידית
        </a>
      </header>

      <a
        className="whatsapp-fab"
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
        target="_blank"
        rel="noreferrer noopener"
        aria-label="דברו איתנו בוואטסאפ"
      >
        <span className="whatsapp-icon">💬</span>
        <span className="whatsapp-label">דברו עם עו״ד בוואטסאפ</span>
      </a>

      <main>
        <section id="legal-tool" className="hero-tool section">
          <div className="hero-tool-intro">
            <p className="eyebrow">מיון ראשוני בפיקוח משרד עורכי דין • אינו ייעוץ משפטי</p>
            <h1>בדיקת עיקול וגביית־יתר — מיון ראשוני מהיר, בפיקוח עורך דין.</h1>
            <p className="hero-text">
              המערכת מבצעת <strong>מיון טכנולוגי ראשוני</strong> בלבד, המבוסס על מאגרים ציבוריים רשמיים, ומסייעת לזהות אם ייתכן שנגבו ממך כספים ביתר. המערכת <strong>אינה קובעת זכאות, אינה מהווה ייעוץ משפטי ואינה מבטיחה תוצאה</strong> — תשובה מותאמת נבדקת על ידי עו״ד מוחמד מ׳ קבהא (מ.ר 67912) לפני כל פעולה.
            </p>
            <div className="hero-chips">
              <button type="button" className="hero-chip hero-chip-strong" onClick={startLiensCheck}>
                🔎 בדיקת עיקול / עיקול כספים ביתר
              </button>
              <button type="button" className="hero-chip" onClick={() => setHeroTab('document')}>📄 בדיקת מסמך</button>
              <button type="button" className="hero-chip" onClick={() => setHeroTab('question')}>⚖️ שאלה משפטית</button>
              <a className="hero-chip" href="#pricing">🧾 הכנת טפסים ושליחה</a>
            </div>
          </div>

          <div className="tool-card">
            <div className="tool-tabs" role="tablist">
              <button type="button" role="tab" className={heroTab === 'garnish' ? 'tool-tab active' : 'tool-tab'} onClick={() => setHeroTab('garnish')}>
                🧮 בדיקת עיקול
              </button>
              <button type="button" role="tab" className={heroTab === 'document' ? 'tool-tab active' : 'tool-tab'} onClick={() => setHeroTab('document')}>
                📄 בדיקת מסמך
              </button>
              <button type="button" role="tab" className={heroTab === 'question' ? 'tool-tab active' : 'tool-tab'} onClick={() => setHeroTab('question')}>
                ⚖️ שאלה
              </button>
            </div>

            {heroTab === 'document' && (
              <form className="tool-form" onSubmit={handleDocumentReview}>
                <div className="upload-row">
                  <label className="dropzone">
                    <span className="dropzone-icon">⬆️</span>
                    <strong>{uploadedFile ? uploadedFile.name : 'העלאת קובץ'}</strong>
                    <span className="dropzone-hint">PDF · Word · תמונה · TXT</span>
                    <input type="file" accept=".pdf,.doc,.docx,.txt,.rtf,image/*" onChange={handleFileUpload} />
                  </label>
                  <label className="camera-btn">
                    <span className="dropzone-icon">📷</span>
                    <strong>צילום מסמך</strong>
                    <span className="dropzone-hint">מצלמים ומנתחים מיד</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} />
                  </label>
                </div>
                <button type="submit" className="primary-btn submit-btn" disabled={isUploadingDocument}>
                  {isUploadingDocument ? 'מנתח...' : '🔎 בדוק מסמך עכשיו'}
                </button>
              </form>
            )}

            {heroTab === 'garnish' && (
              <form className="tool-form garnish-form" onSubmit={handleGarnishSubmit}>
                <p className="garnish-lead">הזן את הנתונים ונחשב אם ייתכן שנגבו ממך כספים ביתר:</p>
                <div className="garnish-grid">
                  <label>סכום החוב המקורי (₪)
                    <input inputMode="numeric" placeholder="לדוגמה: 20000" value={garnishInput.originalDebt}
                      onChange={(e) => setGarnishInput((g) => ({ ...g, originalDebt: e.target.value }))} />
                  </label>
                  <label>סה"כ שנגבה עד היום (₪)
                    <input inputMode="numeric" placeholder="לדוגמה: 26000" value={garnishInput.totalCollected}
                      onChange={(e) => setGarnishInput((g) => ({ ...g, totalCollected: e.target.value }))} />
                  </label>
                  <label>ריבית / הוצאות שנוספו כדין (₪)
                    <input inputMode="numeric" placeholder="לא חובה" value={garnishInput.extraCharges}
                      onChange={(e) => setGarnishInput((g) => ({ ...g, extraCharges: e.target.value }))} />
                  </label>
                  <label>סוג ההכנסה שנפגעה
                    <select value={garnishInput.incomeType}
                      onChange={(e) => setGarnishInput((g) => ({ ...g, incomeType: e.target.value as GarnishmentInput['incomeType'] }))}>
                      <option value="salary">שכר עבודה</option>
                      <option value="benefit">קצבה (ביטוח לאומי / פנסיה)</option>
                      <option value="other">אחר</option>
                    </select>
                  </label>
                </div>
                <button type="submit" className="primary-btn submit-btn">🧮 בדוק אם נגבה ביתר</button>
              </form>
            )}

            {heroTab === 'question' && (
              <form className="tool-form" onSubmit={handleQuestionSubmit}>
                <label className="tool-question-label">
                  <span>תאר את השאלה או המצב המשפטי</span>
                  <textarea
                    rows={5}
                    value={legalQuestion}
                    onChange={(event) => setLegalQuestion(event.target.value)}
                    placeholder="לדוגמה: קיבלתי עיקול בהוצאה לפועל — איך אדע אם גבו ממני יותר מדי?"
                  />
                </label>
                <button type="submit" className="primary-btn submit-btn" disabled={isCheckingQuestion}>
                  {isCheckingQuestion ? 'בודק...' : '⚖️ קבל בדיקה מיידית'}
                </button>
              </form>
            )}

            <p className="tool-disclaimer">
              בדיקה כללית ומיידית — הערכה ראשונית בלבד, אינה מהווה ייעוץ משפטי מחייב.
            </p>

            {(aiLoading || garnishProcessing) && (
              <div className="ai-lab" aria-live="polite" aria-busy="true">
                <div className="ai-lab-grid" aria-hidden="true"></div>

                <div className="ai-orb-stage">
                  <span className="ai-particle p1"></span>
                  <span className="ai-particle p2"></span>
                  <span className="ai-particle p3"></span>
                  <span className="ai-particle p4"></span>
                  <div className={`ai-orb stage-${procStage}`}>
                    <span className="ai-orb-halo"></span>
                    <span className="ai-orb-ring"></span>
                    <span className="ai-orb-ring ring-2"></span>
                    <div className="ai-orb-face">
                      {procStage === 0 && (
                        <svg viewBox="0 0 48 48" className="ai-ico">
                          <path className="draw" d="M24 33V15" />
                          <path className="draw d2" d="M17 22l7-7 7 7" />
                          <path className="draw d3" d="M13 33c-4 0-7-3-7-7a7 7 0 017-7 9 9 0 0117-3 6.5 6.5 0 014 12" />
                        </svg>
                      )}
                      {procStage === 1 && (
                        <svg viewBox="0 0 48 48" className="ai-ico">
                          <path className="draw" d="M24 13v11M24 24l-11 5M24 24l11 5" />
                          <circle className="node" cx="24" cy="13" r="3" />
                          <circle className="node d2" cx="13" cy="29" r="3" />
                          <circle className="node d3" cx="35" cy="29" r="3" />
                          <circle className="node d4" cx="24" cy="24" r="4" />
                        </svg>
                      )}
                      {procStage === 2 && (
                        <svg viewBox="0 0 48 48" className="ai-ico">
                          <path className="draw" d="M11 14h26v17H23l-7 6v-6h-5z" />
                          <circle className="blink" cx="19" cy="23" r="1.7" />
                          <circle className="blink d2" cx="24" cy="23" r="1.7" />
                          <circle className="blink d3" cx="29" cy="23" r="1.7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ai-lab-text">
                  <span className="ai-lab-badge">AI · שלב {procStage + 1} מתוך 3</span>
                  <p className="ai-lab-caption">
                    {['שליחה מאובטחת של הפנייה למערכת', 'אפיון ופענוח המקרה מול מקורות משפטיים', 'ניסוח תשובה ברורה על ידי העוזרת המשפטית'][procStage]}
                  </p>
                </div>

                <div className="ai-seg">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={`ai-seg-bar${procStage >= i ? ' on' : ''}${procStage === i ? ' cur' : ''}`}></span>
                  ))}
                </div>
              </div>
            )}

            {aiResult && (
              <div className="ai-answer" aria-live="polite">
                <div className="ai-answer-head">
                  <div className="ai-answer-avatar">
                    <svg viewBox="0 0 48 48"><circle className="av-core" cx="24" cy="24" r="13" /><path className="av-face" d="M19 24h.02M29 24h.02" /><path className="av-smile" d="M19 29c1.6 1.6 8.4 1.6 10 0" /></svg>
                  </div>
                  <div className="ai-answer-title">
                    <span className="ai-answer-badge">העוזרת המשפטית · AI</span>
                    <h3>הנה מה שמצאנו עבורך</h3>
                  </div>
                  {aiResult.riskLevel && <span className={`risk-pill risk-${aiResult.riskLevel}`}>רמת סיכון: {aiResult.riskLevel}</span>}
                </div>

                {aiResult.bottomLine && (
                  <div className="answer-bottomline">
                    <span className="answer-tag">בשורה התחתונה</span>
                    <p>{aiResult.bottomLine}</p>
                  </div>
                )}

                {aiResult.plainSummary && (
                  <div className="answer-plain">
                    <span className="answer-plain-tag">💬 בשפה פשוטה</span>
                    <p>{aiResult.plainSummary}</p>
                  </div>
                )}

                <details className="answer-details" open>
                  <summary>הסבר מקצועי מלא</summary>
                  {aiResult.caseDecoding && (
                    <div className="result-block"><strong>פענוח המקרה</strong><p>{aiResult.caseDecoding}</p></div>
                  )}
                  {aiResult.legalAnalysis && (
                    <div className="result-block"><strong>ניתוח משפטי</strong><p>{aiResult.legalAnalysis}</p></div>
                  )}
                  {Array.isArray(aiResult.steps) && aiResult.steps.length > 0 && (
                    <div className="result-block"><strong>שלבי טיפול מוצעים</strong>
                      <ul>{aiResult.steps.map((s, i) => (<li key={i}>{s}</li>))}</ul>
                    </div>
                  )}
                  {Array.isArray(aiResult.remedies) && aiResult.remedies.length > 0 && (
                    <div className="result-block"><strong>סעדים אפשריים</strong>
                      <ul>{aiResult.remedies.map((s, i) => (<li key={i}>{s}</li>))}</ul>
                    </div>
                  )}
                  {Array.isArray(aiResult.sources) && aiResult.sources.length > 0 && (
                    <div className="result-block sources-block"><strong>מקורות</strong>
                      <ul>{aiResult.sources.map((s, i) => (
                        <li key={i}>{s.url ? <a href={s.url} target="_blank" rel="noreferrer noopener">{s.title || s.url}</a> : (s.title || '')}</li>
                      ))}</ul>
                    </div>
                  )}
                </details>

                <div className="handle-cta handle-cta-answer">
                  <p className="handle-cta-lead">✨ <strong>אנחנו נעשה הכל בשבילך</strong></p>
                  <p className="handle-cta-sub">בלחיצה אחת תיתן/י למשרד הרשאה לטפל — טופס אחד שכולל הסכם שכר טרחה, ייפוי כוח ומדיניות פרטיות, בחתימה דיגיטלית.</p>
                  <button type="button" className="primary-btn" onClick={openRefund}>📝 מתן הרשאה למשרד לטפל</button>
                </div>

                <p className="tool-disclaimer">{aiResult.disclaimer || 'מידע כללי בלבד — אינו ייעוץ משפטי מחייב.'}</p>
              </div>
            )}

            {heroTab === 'garnish' && garnishResult && (
              <div className="review-result garnish-result" aria-live="polite">
                <div className="report-header">
                  <h3>🧮 {garnishResult.title}</h3>
                  <span className={`risk-pill risk-${garnishResult.riskLevel}`}>{garnishResult.riskLevel}</span>
                </div>

                <div className="report-hero">
                  <div className="risk-gauge">
                    <svg viewBox="0 0 200 120" role="img" aria-label={`רמת סיכון: ${garnishResult.riskLevel}`}>
                      <path className="gauge-arc" d="M20 100 A80 80 0 0 1 60 30.7" stroke="#22c55e" />
                      <path className="gauge-arc" d="M60 30.7 A80 80 0 0 1 140 30.7" stroke="#f59e0b" />
                      <path className="gauge-arc" d="M140 30.7 A80 80 0 0 1 180 100" stroke="#ef4444" />
                      <g className="gauge-needle">
                        <line x1="100" y1="100" x2="100" y2="42" stroke="#0f172a" strokeWidth="3.6" strokeLinecap="round" />
                        <animateTransform attributeName="transform" type="rotate" from="-86 100 100" to={`${{ 'נמוך': -60, 'בינוני': 0, 'גבוה': 60 }[garnishResult.riskLevel] ?? 0} 100 100`} dur="0.9s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.2 1 0.3 1" />
                      </g>
                      <circle cx="100" cy="100" r="6.5" fill="#0f172a" />
                    </svg>
                    <div className="risk-gauge-labels"><span>נמוך</span><span>בינוני</span><span>גבוה</span></div>
                  </div>

                  {garnishResult.estimatedOverpaid > 0 && (
                    <div className="overpaid-hero">
                      <span className="overpaid-hero-label">הערכת גבייה ביתר</span>
                      <strong className="overpaid-hero-num">{'₪' + countUp.toLocaleString('he-IL')}</strong>
                      <span className="overpaid-hero-sub">סכום פוטנציאלי להחזר</span>
                    </div>
                  )}
                </div>
                {garnishResult.estimatedOverpaid > 0 && (
                  <p className="success-fee-note">💚 <strong>הבדיקה חינם · ללא תשלום מראש</strong> — אנחנו מטפלים בהגשת הבקשה, ותשלמו עמלת הצלחה של <strong>25% + מע״מ</strong> רק מהסכום שנחזיר לכם בפועל. ללא זכייה — אין תשלום.</p>
                )}
                <p className="verdict-line">{garnishResult.verdict}</p>
                <p>{garnishResult.summary}</p>
                <div className="result-block">
                  <strong>ממצאים</strong>
                  <ul>{garnishResult.findings.map((item) => (<li key={item}>{item}</li>))}</ul>
                </div>
                <div className="result-block">
                  <strong>המלצות</strong>
                  <ul>{garnishResult.recommendations.map((item) => (<li key={item}>{item}</li>))}</ul>
                </div>
                <p className="tool-disclaimer">{garnishResult.nextStep}</p>

                {lookupSources && (
                  <div className="result-block sources-block">
                    <strong>מקורות מידע — מבוסס על מאגרים ציבוריים</strong>
                    <ul>
                      {lookupSources.sources.map((s) => (
                        <li key={s.u}><a href={s.u} target="_blank" rel="noreferrer noopener">{s.t}</a></li>
                      ))}
                    </ul>
                    <p className="sources-note">התשובה מבוססת על מקורות ציבוריים חינמיים (כל זכות ומאגר החקיקה הלאומי). מומלץ לעיין במקור.</p>
                    {lookupSources.forms && lookupSources.forms.length > 0 && (
                      <div className="forms-links">
                        <strong>שליפת טפסים לפי סוג הבקשה</strong>
                        <ul>
                          {lookupSources.forms.map((f) => (
                            <li key={f.u}><a href={f.u} target="_blank" rel="noreferrer noopener">{f.t}</a></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {refund.done ? (
                  <div className="refund-done">✅ הבקשה וההרשאה נשלחו בהצלחה. נציג/ת מהמשרד יחזרו אליך בהקדם לטיפול.</div>
                ) : (
                  <div className="handle-cta">
                    <p className="handle-cta-lead">✨ <strong>אנחנו נעשה הכל בשבילך</strong> — בדיקה, הכנת הבקשה, והגשה מול ההוצאה לפועל.</p>
                    <button type="button" className="primary-btn refund-btn" onClick={openRefund}>📝 מתן הרשאה למשרד לטפל</button>
                    <a className="secondary-btn" href="#pricing">הכנת טפסים ושליחה</a>
                  </div>
                )}
              </div>
            )}

            {heroTab !== 'garnish' && reviewResult && (
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

                {lookupSources && (
                  <div className="result-block sources-block">
                    <strong>מקורות מידע — מבוסס על מאגרים ציבוריים</strong>
                    <ul>
                      {lookupSources.sources.map((s) => (
                        <li key={s.u}><a href={s.u} target="_blank" rel="noreferrer noopener">{s.t}</a></li>
                      ))}
                    </ul>
                    <p className="sources-note">התשובה מבוססת על מקורות ציבוריים חינמיים (כל זכות ומאגר החקיקה הלאומי). מומלץ לעיין במקור.</p>
                    {lookupSources.forms && lookupSources.forms.length > 0 && (
                      <div className="forms-links">
                        <strong>שליפת טפסים לפי סוג הבקשה</strong>
                        <ul>
                          {lookupSources.forms.map((f) => (
                            <li key={f.u}><a href={f.u} target="_blank" rel="noreferrer noopener">{f.t}</a></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="result-cta">
                  <a className="primary-btn" href="#pricing">🧾 הכנת טפסים ושליחה אונליין</a>
                  <a className="secondary-btn" href="#contact">המשך לשירות מלא של המשרד</a>
                </div>
              </div>
            )}
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
            <p className="eyebrow">מה אנחנו עושים</p>
            <h2>מומחיות ממוקדת: עיקולים, גביית־יתר והחזרים</h2>
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
            <h2>הליך פשוט, ברור ומקצועי</h2>
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

        {testimonials.length > 0 && (
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
        )}

        <section id="contact" className="section contact-section">
          <div className="contact-copy">
            <p className="eyebrow">צור קשר</p>
            <h2>בואו נדבר על המקרה שלכם.</h2>
            <p>
              נשמח ללוות אתכם מהשלב הראשון ועד לסיום ההליך. שלחו פרטים וכמתמחים בתחום,
              נחזור אליכם בהקדם.
            </p>
            <ul className="contact-list">
              <li>מייל: info@my-attorney.net</li>
              <li>טלפון: 052-661-1866</li>
              <li>כתובת: בסמ״ה, רח' אלבוח'ארי 95, מיקוד 3002300</li>
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

        <section className="section how-section" aria-label="איך זה עובד">
          <div className="section-header">
            <p className="eyebrow">איך זה עובד</p>
            <h2>משלוש דקות של בדיקה — לפעולה משפטית</h2>
          </div>
          <div className="how-grid">
            <div className="how-step"><span className="how-num">1</span><strong>מעלים מסמך או שואלים</strong><p>מסמך שקיבלת (עיקול, דרישה, חוזה) או שאלה חופשית.</p></div>
            <div className="how-step"><span className="how-num">2</span><strong>מקבלים מיון ראשוני</strong><p>זיהוי ראשוני של סוג העניין ונקודות לבדיקה. אינו ייעוץ משפטי — נבדק על ידי עורך דין לפני כל פעולה.</p></div>
            <div className="how-step"><span className="how-num">3</span><strong>ממשיכים לפעולה</strong><p>הכנת טפסים ושליחה אונליין, או שירות משפטי מלא של המשרד.</p></div>
          </div>
        </section>

        <section id="pricing" className="section pricing-section" aria-label="תמחור לפי סוג תיק">
          <div className="section-header">
            <p className="eyebrow">בדיקה חינם · משלמים רק על הצלחה</p>
            <h2>בדיקת עיקול — חינם. עמלה רק מהחזר בפועל.</h2>
            <p>הבדיקה ובדיקת הזכאות להחזר — ללא עלות. אם מגיע לכם החזר, אנחנו מטפלים בהגשה, ומשלמים עמלת הצלחה של <strong>25% + מע״מ</strong> רק מהסכום שנחזיר לכם בפועל. ללא זכייה — אין תשלום.</p>
            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('paid') === '1' && (
              <p className="paid-banner">✅ התשלום התקבל בהצלחה! נציג/ת מהמשרד יחזרו אליך בהקדם.</p>
            )}
          </div>
          <div className="pricing-grid">
            {pricingTiers.map((tier) => (
              <div key={tier.name} className={`pricing-card${tier.highlight ? ' featured' : ''}`}>
                {tier.highlight && <span className="pricing-badge">{tier.tagline}</span>}
                <h3>{tier.name}</h3>
                {!tier.highlight && <p className="pricing-tagline">{tier.tagline}</p>}
                <div className="pricing-price">{tier.price}</div>
                <ul>
                  {tier.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
                {'free' in tier ? (
                  <button type="button" className="primary-btn" onClick={() => { startLiensCheck(); window.location.hash = 'legal-tool' }}>
                    התחל בדיקה חינם
                  </button>
                ) : 'id' in tier ? (
                  <button type="button" className="secondary-btn" onClick={() => handleCheckout((tier as { id: string }).id)}>
                    לתשלום מאובטח
                  </button>
                ) : (
                  <a className="secondary-btn" href="#contact">קבלת הצעה</a>
                )}
              </div>
            ))}
          </div>
          <p className="pay-methods">💳 להכנת טפסים בתשלום: Apple Pay · Google Pay · כל כרטיסי האשראי</p>
          <p className="pricing-note">* עמלת ההצלחה (25% + מע״מ) ותעריפי הטפסים כפופים לאישור עורך הדין ולהסכם שכר טרחה חתום. המחירים להמחשה וניתנים לעדכון.</p>
        </section>

        {route === 'client' && !clientAuthed && (
          <section className="section client-login-section" aria-label="כניסת לקוחות">
            <div className="client-login-card">
              <p className="eyebrow">אזור אישי · כניסת לקוחות</p>
              <h2>כניסה לתיק האישי שלך</h2>
              <p className="client-login-sub">כניסה מהירה ומאובטחת. לקוח חדש — נפתח לך תיק אוטומטית. אזור זה מופרד ומאובטח.</p>

              {loginMethodsMarkup}

              <a className="bo-back-link" href="#legal-tool" onClick={() => { window.location.hash = ''; }}>← חזרה לאתר</a>
            </div>
          </section>
        )}

        {clientAuthed && (route === 'client' || route === 'portal') && (
        <section id="portal" className="section portal-section" aria-label="לוח לקוח אישי">
          <div className="section-header">
            <p className="eyebrow">לוח לקוח · {clientInfo?.name || activeProfile.name}</p>
            <h2>הדף האישי של {clientInfo?.name || activeProfile.name}</h2>
            <button type="button" className="bo-back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setClientAuthed(false); setClientInfo(null); setClientLoginForm({ caseId: '', code: '', error: '', busy: false }) }}>← יציאה מהאזור האישי</button>
          </div>

          <div className="share-bar" aria-label="שיתוף האתר">
            <span className="share-bar-label">מרוצים מהשירות? שתפו את האתר:</span>
            <div className="share-buttons">
              {(() => {
                const shareUrl = 'https://www.my-attorney.net'
                const shareText = 'בדיקה משפטית מיידית ובקשת החזר עיקול — My-Attorney'
                const enc = encodeURIComponent
                return (
                  <>
                    <a className="share-btn wa" href={`https://wa.me/?text=${enc(shareText + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    <a className="share-btn fb" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
                    <a className="share-btn li" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    <a className="share-btn x" href={`https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}`} target="_blank" rel="noopener noreferrer">X</a>
                    <button type="button" className="share-btn copy" onClick={() => { try { navigator.clipboard?.writeText(shareUrl) } catch { /* ignore */ } }}>העתק קישור</button>
                  </>
                )
              })()}
            </div>
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
        )}

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

        <section id="privacy" className="section legal-section">
          <div className="section-header"><p className="eyebrow">הגנת הפרטיות</p><h2>מדיניות פרטיות והודעת איסוף מידע</h2></div>
          <div className="legal-body">
            <p><strong>בעל השליטה במידע:</strong> משרד עורכי דין מוחמד מ. קבהא (מ.ר 67912) («המשרד»). כתובת: בסמ״ה, רח' אלבוח'ארי 95, מיקוד 3002300. פרטי התקשרות: info@my-attorney.net · 052-661-1866.</p>
            <p><strong>מטרות השימוש:</strong> המידע נאסף לצורך ביצוע מיון ובדיקה ראשונית, מתן שירות משפטי וטיפול בעניין, יצירת קשר וניהול ההתקשרות בלבד, בהתאם לסעיף 11 לחוק הגנת הפרטיות, התשמ״א-1981 ולתיקון 13 לחוק.</p>
            <p><strong>סוגי מידע:</strong> פרטי זיהוי והתקשרות, מסמכים ונתונים שתמסרו לצורך הבדיקה, ומידע טכני בסיסי. מסירת המידע תלויה בהסכמתכם; אינכם חייבים למסור מידע, אך ללא מידע מסוים לא נוכל לספק את השירות.</p>
            <p><strong>העברה לצדדים שלישיים:</strong> לצורך הפעלת השירות אנו נעזרים בספקי עיבוד (אחסון בענן, מנוע ניתוח/‏AI, מערכת ניהול לקוחות וסליקת תשלומים). ייתכן עיבוד או אחסון מחוץ לישראל, בכפוף להוראות הדין. איננו מוכרים מידע ואיננו מעבירים אותו לצד שלישי שלא לצורך השירות, למעט כנדרש על פי דין.</p>
            <p><strong>שמירה ומחיקה:</strong> מידע שלא הבשיל לתיק פעיל יימחק לאחר זמן סביר. מידע בתיקי לקוח יישמר לפי חובות הדין וכללי לשכת עורכי הדין.</p>
            <p><strong>זכות עיון ותיקון:</strong> לפי סעיפים 13–14 לחוק, אתם רשאים לעיין במידע שלכם ולבקש את תיקונו או מחיקתו, בפנייה ל-info@my-attorney.net.</p>
            <p><strong>אבטחת מידע:</strong> אנו נוקטים אמצעים לאבטחת המידע (הצפנה בתעבורה, הרשאות והגבלת גישה). <strong>אנא הימנעו מהעלאת מסמכים או פרטים של צד שלישי שאינם נחוצים לבדיקה.</strong></p>
            <p><strong>הסכמה:</strong> השימוש בכלים והעלאת מסמכים מהווים הסכמה למדיניות זו.</p>
          </div>
        </section>

        <section id="terms" className="section legal-section">
          <div className="section-header"><p className="eyebrow">תנאי שימוש</p><h2>תקנון ותנאי שימוש</h2></div>
          <div className="legal-body">
            <p><strong>מהות השירות:</strong> האתר מפעיל מערכת קליטה ומיון ראשוני בפיקוח המשרד. המידע והכלים אינם ייעוץ משפטי ואינם התחייבות לתוצאה. יחסי עורך דין–לקוח נוצרים רק בהסכם התקשרות ושכר טרחה חתום ולאחר בדיקת ניגוד עניינים.</p>
            <p><strong>תמחור:</strong> בדיקת/החזר עיקול — ללא עלות; שכר טרחה מותנה הצלחה בשיעור 25% בתוספת מע״מ כדין, מכל סכום שיושב בפועל בלבד («ללא זכייה — אין תשלום»). הכנת טפסים ושליחתם — ₪190 לטופס בודד ו-₪490 לסט הוצאה לפועל (המחירים כוללים מע״מ, אלא אם צוין אחרת). אגרות והוצאות חיצוניות אינן כלולות.</p>
            <p><strong>«טופס מוכן» ו«שליחה אונליין»:</strong> הכנת טופס משפטי מותאם לפרטים שנמסרו והעברתו לגורם/יעד הרלוונטי. אין בכך ערובה לקבלת הבקשה על ידי הרשות; דחיית בקשה אינה מזכה בהחזר אוטומטי, אלא לפי מדיניות הביטול שלהלן.</p>
            <p><strong>ביטול עסקה (מכר מרחוק):</strong> בהתאם לחוק הגנת הצרכן, התשמ״א-1981 ותקנותיו, ניתן לבטל עסקה בכפוף לשלב הביצוע. שירות שבוצע או החל להתבצע לפי בקשת הלקוח עשוי שלא להיות ניתן לביטול/החזר בגין החלק שבוצע. לביטול: info@my-attorney.net.</p>
            <p><strong>שכר טרחה:</strong> יוסדר בהסכם חתום טרם תחילת הטיפול, בהפרדה בין שכר טרחה, מע״מ, אגרות והוצאות, ובכפוף לזכות לבחינת סבירות לפי חוק לשכת עורכי הדין. כספי לקוחות ינוהלו בנאמנות כדין.</p>
            <p><strong>דין וסמכות שיפוט:</strong> על השימוש יחולו דיני מדינת ישראל, וסמכות השיפוט הבלעדית לבתי המשפט המוסמכים בישראל.</p>
            <p>המשרד: משרד עורכי דין מוחמד מ. קבהא, בסמ״ה, רח' אלבוח'ארי 95, מיקוד 3002300 · עוסק מורשה — עו״ד מוחמד קבהא, מ.ר 67912.</p>
          </div>
        </section>

        <section id="accessibility" className="section legal-section">
          <div className="section-header"><p className="eyebrow">נגישות</p><h2>הצהרת נגישות</h2></div>
          <div className="legal-body">
            <p>המשרד רואה חשיבות רבה בהנגשת שירותיו לכלל הציבור, לרבות אנשים עם מוגבלות, ופועל למען עמידה בהוראות חוק שוויון זכויות לאנשים עם מוגבלות, התשנ״ח-1998, ותקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013.</p>
            <p>האתר נבנה בשאיפה לעמידה בהמלצות התקן הישראלי ת״י 5568 (המבוסס על WCAG 2.0) ברמה AA: מבנה סמנטי, ניגודיות צבעים, ניווט במקלדת ותמיכה בקוראי מסך.</p>
            <p>מצאתם קושי בנגישות או ליקוי? נשמח לתקן. רכז הנגישות: עו״ד מוחמד קבהא — info@my-attorney.net · 052-661-1866 · בסמ״ה, רח' אלבוח'ארי 95, מיקוד 3002300.</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-copy">
          <p className="eyebrow">בואו נדבר</p>
          <h2>קביעת פגישה ראשונית ללא התחייבות</h2>
        </div>

        <div className="footer-actions">
          <a className="primary-btn" href="tel:+972526611866">התקשר עכשיו</a>
          <a className="secondary-btn" href="mailto:info@my-attorney.net">info@my-attorney.net</a>
        </div>

        <div className="footer-identity">
          <p><strong>משרד עורכי דין מוחמד מ. קבהא</strong> · עורך הדין האחראי: עו״ד מוחמד קבהא, מ.ר 67912</p>
          <p>כתובת: בסמ״ה, רח' אלבוח'ארי 95, מיקוד 3002300 · טלפון: 052-661-1866 · דוא״ל: info@my-attorney.net</p>
          <p className="footer-mini">האתר מופעל כמערכת קליטה ומיון בפיקוח משרד עורכי דין. המידע והכלים אינם מהווים ייעוץ משפטי ואינם תחליף לייעוץ פרטני. אין בשימוש באתר כדי ליצור יחסי עורך דין–לקוח, אשר ייווצרו רק בהסכם התקשרות חתום.</p>
          <nav className="footer-legal">
            <a href="/madrich-ikul.html">מדריך: עיקול וגביית־יתר</a>
            <a href="#privacy">מדיניות פרטיות</a>
            <a href="#terms">תקנון ותנאי שימוש</a>
            <a href="#accessibility">הצהרת נגישות</a>
          </nav>
        </div>
      </footer>
    </div>
  )
}

export default App
