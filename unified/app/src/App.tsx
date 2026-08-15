import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

import { t as __t, tt as __tt, LANGS, getLang, setLang } from "./i18n";

const services = [
  {
    title: __t("בדיקת עיקול וגביית־יתר"),
    description: __t(
      "בדיקה חינם של יתרת החוב מול הסכומים שנגבו בפועל, ואיתור גבייה או עיקול ביתר — ללא עלות וללא התחייבות."
    ),
    accent: '01',
    label: __t("חינם"),
  },
  {
    title: __t("טיפול והגשת בקשה להחזר"),
    description: __t(
      "הכנת הבקשה והגשתה בשמך מול רשות האכיפה והגבייה, בליווי עורך דין. עמלת הצלחה בלבד — משלמים רק מהחזר שהתקבל."
    ),
    accent: '02',
    label: __t("25% + מע״מ · ללא זכייה אין תשלום"),
  },
  {
    title: __t("הכנת טפסים לתיקי הוצל״פ"),
    description: __t(
      "ניסוח והגשה של טפסים ומסמכים בתיקי הוצאה לפועל ודרישות תשלום — טופס בודד או סט מלא לתיק."
    ),
    accent: '03',
    label: __t("בתשלום · ₪190 / ₪490"),
  },
  {
    title: __t("ניטור והתראות לעסקים"),
    description: __t(
      "שירות מנוי לעסקים למעקב שוטף אחר חובות, עיקולים והתראות — כדי לזהות גבייה ביתר מוקדם ולפעול בזמן."
    ),
    accent: '04',
    label: __t("מנוי · בקרוב"),
  },
  {
    title: __t("בדיקת מועדים בהוצאה לפועל"),
    description: __t(
      "בדיקת המועדים הקריטיים בתיק — חלון להגשת התנגדות, תקופות התיישנות, ומתי צעד בהליך פוקע. כדי לא לפספס תאריך שעולה כסף."
    ),
    accent: '05',
    label: __t("חינם"),
  },
  {
    title: __t("עיקול משכורת — כמה מותר לעקל"),
    description: __t(
      "בדיקה כמה מותר לעקל מהשכר לפי הדין, מהו הסכום המוגן שאסור לגעת בו, ואיתור עיקול שחורג מהתקרה — סכום שאפשר לבקש בחזרה."
    ),
    accent: '06',
    label: __t("חינם"),
  },
  {
    title: __t("בדיקת זכויות בסיום העסקה"),
    description: __t(
      "בדיקת זכויות בפיטורים או התפטרות — פיצויי פיטורים, הודעה מוקדמת, ניכויים וחובות מעסיק — לצד בדיקת עיקולים על השכר."
    ),
    accent: '07',
    label: __t("חינם"),
  },
  {
    title: __t("קיבלתי מכתב מההוצאה לפועל"),
    description: __t(
      "בדיקה מהירה של מכתב, אזהרה או צו מההוצאה לפועל: זיהוי סוג ההליך, מה המשמעות, המועד לתגובה, והאם נגבה או עוקל ביתר — לפני שמפספסים תאריך."
    ),
    accent: '08',
    label: __t("חינם"),
  },
  {
    title: __t("פוטרתי או זומנתי לשימוע"),
    description: __t(
      "בדיקת זכויותיך בהליך שימוע ובפיטורים: זכות הטיעון, המועדים, מה חשוב לומר ולתעד, והאם הפיטורים נעשו כדין — לפני שחותמים על סיום העסקה."
    ),
    accent: '09',
    label: __t("חינם"),
  },
  {
    title: __t("בדיקת זכויות עובדים"),
    description: __t(
      "בדיקה כוללת של זכויותיך בעבודה: שכר ושעות נוספות, דמי הבראה, פנסיה והפרשות, חופשה ומחלה, ותלושי שכר — ואיתור הפרות שמזכות בהשלמה או בפיצוי."
    ),
    accent: '10',
    label: __t("חינם"),
  },
  {
    title: __t("הלנת שכר או שכר שלא שולם"),
    description: __t(
      "לא קיבלת שכר בזמן, בחלקו או בכלל? בדיקת זכאות לפיצויי הלנת שכר, לתלושים תקינים ולגבייה מהמעסיק — כולל שכר, נסיעות והחזרים."
    ),
    accent: '11',
    label: __t("חינם"),
  },
  {
    title: __t("פיטורים בתקופה מוגנת"),
    description: __t(
      "פוטרת בהיריון, אחרי לידה, בטיפולי פוריות, במילואים או בתקופה מוגנת אחרת? בדיקה אם הפיטורים חוקיים, אילו אישורים נדרשים, ומה הסעדים האפשריים."
    ),
    accent: '12',
    label: __t("חינם"),
  },
]

// Honest, factual trust points about the SERVICE (no unverifiable metrics).
const stats = [
  { value: __t("חינם"), label: __t("בדיקה ראשונית וזכאות להחזר") },
  { value: '25%', label: __t("עמלה רק מהחזר שהתקבל בפועל") },
  { value: __t("עו״ד"), label: __t("הטיפול באחריות ובפיקוח עורך דין") },
  { value: __t("מאגרים"), label: __t("מבוסס מקורות ציבוריים רשמיים") },
]

const steps = [
  __t("בדיקת עיקול חינם במחשבון"),
  __t("מיון ראשוני ובדיקת עורך דין"),
  __t("חתימה דיגיטלית והגשת בקשה להחזר"),
  __t("קבלת ההחזר — עמלה רק מהתוצאה"),
]

const team = [
  { name: __t("עו״ד מוחמד מ׳ קבהא"), role: __t("עורך הדין האחראי · מ.ר 67912"), bio: __t(
    "אחראי מקצועית על השירות, בדיקת התיקים, הכנת הבקשות והייצוג מול רשות האכיפה והגבייה ובתי המשפט."
  ) },
]

// Testimonials must be real, documented and published with consent — none shown until then.
const testimonials: { quote: string; name: string; role: string }[] = []

const faqs = [
  {
    question: __t("מה זה «גבייה ביתר» או «עיקול ביתר»?"),
    answer: __t(
      "מצב שבו נגבו ממך במסגרת הליכי הוצאה לפועל סכומים העולים על החוב האמיתי — למשל בשל ריבית שגויה, כפל חיוב, גבייה לאחר סילוק החוב, או עיקול על כספים מוגנים. במקרים כאלה ייתכן שמגיע לך החזר."
    ),
  },
  {
    question: __t("עיקלו לי כסף מחשבון הבנק — מה עושים?"),
    answer: __t(
      "עיקול חשבון בנק יכול לתפוס כספים בחשבון, אך חלק מהכספים מוגנים מעיקול — למשל קצבאות ביטוח לאומי, דמי מזונות ושכר עד תקרה מסוימת. אם עוקלו כספים מוגנים, או שהעיקול חורג מהחוב האמיתי, ייתכן שמגיע לך החזר. כדאי לבדוק את פירוט העיקול מול הזכויות המוגנות — הבדיקה הראשונית אצלנו חינמית."
    ),
  },
  {
    question: __t("עיקול משכורת — כמה מותר לעקל?"),
    answer: __t(
      "החוק בישראל מגן על חלק מהשכר: קיים סכום מינימלי (המבוסס על רמת קיום בסיסית ומספר התלויים) שאסור לעקל. עיקול שחורג מהתקרה המותרת — ניתן לעיתים להשבה. הבדיקה החינמית עוזרת לזהות אם עוקל יותר מהמותר על פי דין."
    ),
  },
  {
    question: __t("עיקול בהוצאה לפועל — איך יודעים אם גבו לי יותר מדי?"),
    answer: __t(
      "בודקים את יתרת החוב המקורי מול הסכום שנגבה בפועל, כולל ריבית והוצאות. טעויות נפוצות: ריבית שחושבה שגוי, כפל חיוב, גבייה אחרי שהחוב כבר סולק, או עיקול על כספים מוגנים. מחשבון הבדיקה שלנו נותן אינדיקציה ראשונית תוך דקה, ללא עלות וללא התחייבות."
    ),
  },
  {
    question: __t("כמה זמן לוקח לקבל החזר על גבייה ביתר?"),
    answer: __t(
      "אין פרק זמן אחיד — התהליך תלוי בסוג התיק, בהיקף הבדיקה ובתגובת הגורמים המעורבים (הוצאה לפועל, הזוכה). המשרד פועל לקדם את התהליך ולעדכן על ההתקדמות, אך לא ניתן להתחייב מראש על מועד או על תוצאה."
    ),
  },
  {
    question: __t("כמה עולה הבדיקה?"),
    answer: __t(
      "הבדיקה הראשונית ובדיקת הזכאות להחזר — ללא עלות וללא התחייבות. אם מטופלת ומתקבלת השבה בפועל, שכר הטרחה הוא 25% בתוספת מע״מ מהסכום שיוחזר בלבד. ללא זכייה — אין תשלום."
    ),
  },
  {
    question: __t("הבדיקה באתר היא ייעוץ משפטי?"),
    answer: __t(
      "לא. הכלי מבצע מיון ראשוני בלבד המבוסס על מאגרים ציבוריים רשמיים, ואינו קובע זכאות או מבטיח תוצאה. תשובה מותאמת נבדקת על ידי עורך דין לפני כל פעולה."
    ),
  },
  {
    question: __t("איך מתחילים?"),
    answer: __t(
      "ממלאים את מחשבון בדיקת העיקול (יתרת החוב מול מה שנגבה), מקבלים מיון ראשוני, ואם עולה חשש לגבייה ביתר — מגישים בקשה להחזר בחתימה דיגיטלית על הסכם שכר טרחה וייפוי כוח, והמשרד מטפל בהמשך."
    ),
  },
]

// Pricing for online form preparation + submission, by case type.
const pricingTiers = [
  {
    free: true,
    highlight: true,
    ribbon: __t("הכי משתלם · 0 ₪ להתחיל"),
    name: __t("בדיקת עיקול + טיפול בהחזר"),
    price: __t("חינם"),
    sub: __t("הבדיקה הראשונית — ללא עלות"),
    then: __t("ואז 25% + מע״מ — רק מההחזר שיתקבל בפועל"),
    value: __t("אתה לא משלם שקל עד שכסף חוזר אליך."),
    cta: __t("התחל בדיקה חינם"),
    features: [
      __t("בדיקת עומק: יתרת החוב מול כל הסכומים שנגבו, כולל ריבית והצמדה"),
      __t("איתור גבייה או עיקול ביתר, וכספים מוגנים שנתפסו שלא כדין"),
      __t("הכנת בקשת ההחזר וכתבי הטענות (טענת פרעתי) על ידי המשרד"),
      __t("הגשה וייצוג מול רשות האכיפה והגבייה (ההוצאה לפועל)"),
      __t("ניהול משא ומתן וקבלת הכספים בנאמנות עבורך"),
      __t("עדכון שוטף על ההתקדמות בתיק"),
      __t("ללא זכייה — אין תשלום. בלי אותיות קטנות."),
    ],
  },
  {
    id: 'single-form',
    name: __t("הכנת טופס משפטי + הגשה"),
    price: '₪190',
    sub: __t("לטופס בודד · כולל מע״מ"),
    value: __t("חוסך שעות עבודה וטעויות ניסוח שעלולות לעכב את התיק."),
    cta: __t("לתשלום מאובטח"),
    features: [
      __t("ניסוח מקצועי לפי סוג ההליך: הוצל״פ, דרישת תשלום, התראה או בקשה"),
      __t("התאמה מדויקת לפרטי התיק והנסיבות שלך"),
      __t("בדיקת תקינות משפטית של הטופס לפני הגשה"),
      __t("קובץ מוכן להגשה + שליחה אונליין ליעד הנכון"),
      __t("עותק שמור בתיק הדיגיטלי שלך"),
    ],
  },
  {
    id: 'form-set',
    ribbon: __t("חוסך לעומת טפסים בודדים"),
    name: __t("סט טפסים לתיק הוצל״פ שלם"),
    price: '₪490',
    sub: __t("לתיק שלם · כולל מע״מ"),
    value: __t("במקום להזמין כמה טפסים בנפרד — הכול במחיר אחד."),
    cta: __t("לתשלום מאובטח"),
    features: [
      __t("סט טפסים מלא ומקושר לכל שלבי ההליך"),
      __t("בדיקת כל המסמכים הנלווים והתאמתם זה לזה"),
      __t("ליווי מקצועי עד ההגשה בפועל"),
      __t("שליחה, אישור וארכוב מסודר בתיק"),
      __t("תיאום ישיר מול המשרד לאורך התהליך"),
    ],
  },
  {
    name: __t("ליווי משפטי מלא"),
    price: __t("לפי הצעה"),
    sub: __t("התאמה אישית לתיק"),
    value: __t("כשצריך ייצוג מלא — עורך דין לצידך מהשלב הראשון."),
    cta: __t("קבלת הצעה"),
    features: [
      __t("פגישת ייעוץ אישית עם עורך דין"),
      __t("ייצוג מלא בהליך מול כל הגורמים"),
      __t("ניהול משא ומתן מול הצד השני"),
      __t("ליווי צמוד עד סגירת התיק"),
    ],
  },
]

// Real, curated legal sources (free public databases) used to back and cite the
// immediate answers. Links verified from כל-זכות (Kol-Zchut) + national legislation DB.
const KZ = 'https://www.kolzchut.org.il/he/'
const legalTopics: { match: string[]; label: string; sources: { t: string; u: string }[] }[] = [
  {
    label: __t("עיקולים והוצאה לפועל"),
    match: [__t("עיקול"), __t("עוקל"), __t("הוצאה לפועל"), __t("הוצל\"פ"), __t("הוצלפ"), __t("גבייה"), __t("גביה"), __t("כונס"), __t("אזהרה"), __t("חשבון מוגבל"), __t("תיק איחוד")],
    sources: [
      { t: __t("הוצאה לפועל וגבייה — מדריך כללי (כל זכות)"), u: KZ + '%D7%94%D7%95%D7%A6%D7%90%D7%94_%D7%9C%D7%A4%D7%95%D7%A2%D7%9C_%D7%95%D7%92%D7%91%D7%99%D7%99%D7%94' },
      { t: __t("נכסים וכספים שאסור לעקל בהוצאה לפועל (כל זכות)"), u: KZ + '%D7%A0%D7%9B%D7%A1%D7%99%D7%9D_%D7%95%D7%9B%D7%A1%D7%A4%D7%99%D7%9D_%D7%A9%D7%90%D7%A1%D7%95%D7%A8_%D7%9C%D7%A2%D7%A7%D7%9C_%D7%91%D7%94%D7%95%D7%A6%D7%90%D7%94_%D7%9C%D7%A4%D7%95%D7%A2%D7%9C' },
      { t: __t("שכר עבודה שלא ניתן לעקל או לשעבד (כל זכות)"), u: KZ + '%D7%A9%D7%9B%D7%A8_%D7%A2%D7%91%D7%95%D7%93%D7%94_%D7%A9%D7%9C%D7%90_%D7%A0%D7%99%D7%AA%D7%9F_%D7%9C%D7%A2%D7%A7%D7%9C_%D7%90%D7%95_%D7%9C%D7%A9%D7%A2%D7%91%D7%93' },
      { t: __t("מדריך לחייב בהוצאה לפועל שיש עליו עיקולים (כל זכות)"), u: KZ + '%D7%9E%D7%93%D7%A8%D7%99%D7%9A_%D7%9C%D7%97%D7%99%D7%99%D7%91_%D7%91%D7%94%D7%95%D7%A6%D7%90%D7%94_%D7%9C%D7%A4%D7%95%D7%A2%D7%9C_%D7%A9%D7%99%D7%A9_%D7%A2%D7%99%D7%A7%D7%95%D7%9C%D7%99%D7%9D_%D7%A2%D7%9C%D7%99%D7%95_%D7%90%D7%95_%D7%A2%D7%9C_%D7%A8%D7%9B%D7%95%D7%A9%D7%95' },
    ],
  },
  {
    label: __t("דיני עבודה ופיטורים"),
    match: [__t("פיטורים"), __t("פיצויי פיטורים"), __t("שימוע"), __t("הודעה מוקדמת"), __t("שכר"), __t("העסקה"), __t("מעסיק"), __t("מעביד"), __t("התפטרות"), __t("שעות נוספות")],
    sources: [
      { t: __t("מדריך בנושא פיטורים (כל זכות)"), u: KZ + '%D7%9E%D7%93%D7%A8%D7%99%D7%9A_%D7%91%D7%A0%D7%95%D7%A9%D7%90_%D7%A4%D7%99%D7%98%D7%95%D7%A8%D7%99%D7%9D' },
      { t: __t("פיצויי פיטורים לעובד שפוטר (כל זכות)"), u: KZ + '%D7%A4%D7%99%D7%A6%D7%95%D7%99%D7%99_%D7%A4%D7%99%D7%98%D7%95%D7%A8%D7%99%D7%9D_%D7%9C%D7%A2%D7%95%D7%91%D7%93_%D7%A9%D7%A4%D7%95%D7%98%D7%A8' },
      { t: __t("שימוע לפני פיטורים (כל זכות)"), u: KZ + '%D7%A9%D7%99%D7%9E%D7%95%D7%A2_%D7%9C%D7%A4%D7%A0%D7%99_%D7%A4%D7%99%D7%98%D7%95%D7%A8%D7%99%D7%9D' },
      { t: __t("הודעה מוקדמת לפיטורים (כל זכות)"), u: KZ + '%D7%94%D7%95%D7%93%D7%A2%D7%94_%D7%9E%D7%95%D7%A7%D7%93%D7%9E%D7%AA_%D7%9C%D7%A4%D7%99%D7%98%D7%95%D7%A8%D7%99%D7%9D' },
    ],
  },
]
const generalSources = [
  { t: __t("כל זכות — מאגר הזכויות הציבורי"), u: KZ + '%D7%A2%D7%9E%D7%95%D7%93_%D7%A8%D7%90%D7%A9%D7%99' },
  { t: __t("מאגר החקיקה הלאומי — חוקי מדינת ישראל (gov.il)"), u: 'https://www.gov.il/he/service/the_laws_of_the_state_of_israel_in_the_national_legislation_database' },
]
// Official form-retrieval links by request type.
const ECA = 'https://go.gov.il/ecamain'
const formLinksByLabel: Record<string, { t: string; u: string }[]> = {
  'עיקולים והוצאה לפועל': [
    { t: __t("רשות האכיפה והגבייה — בקשות, טפסים ואזור אישי (הוצאה לפועל)"), u: ECA },
    { t: __t("בקשה בטענת \"פרעתי\" / השבת כספים — מדריך (כל זכות)"), u: KZ + '%D7%9E%D7%93%D7%A8%D7%99%D7%9A_%D7%9C%D7%97%D7%99%D7%99%D7%91_%D7%91%D7%94%D7%95%D7%A6%D7%90%D7%94_%D7%9C%D7%A4%D7%95%D7%A2%D7%9C_%D7%A9%D7%99%D7%A9_%D7%A2%D7%99%D7%A7%D7%95%D7%9C%D7%99%D7%9D_%D7%A2%D7%9C%D7%99%D7%95_%D7%90%D7%95_%D7%A2%D7%9C_%D7%A8%D7%9B%D7%95%D7%A9%D7%95' },
  ],
  'דיני עבודה ופיטורים': [
    { t: __t("תביעה בבית הדין לעבודה — מידע וטפסים (gov.il)"), u: 'https://www.gov.il/he/departments/labor_court' },
  ],
}
const generalForms = [{ t: __t("רשות האכיפה והגבייה (הוצאה לפועל) — טפסים והליכים"), u: ECA }]

// WhatsApp — high-converting contact channel. Replace with the office's real number (intl format, no +).
const WHATSAPP_NUMBER = '972526611866'
const WHATSAPP_MSG = encodeURIComponent(__t("שלום, הגעתי מהאתר MyAttorney ואשמח לבדוק את המקרה שלי."))
const getLegalSources = (text: string) => {
  const t = (text || '').toLowerCase()
  const topic = legalTopics.find((x) => x.match.some((k) => t.includes(k.toLowerCase())))
  return {
    topicLabel: topic?.label || __t("כללי"),
    sources: [...(topic?.sources || []), ...generalSources],
    forms: (topic && formLinksByLabel[topic.label]) || generalForms,
  };
}

const initialForm = {
  name: '',
  email: '',
  phone: '',
  message: '',
}

const initialLegalReview = {
  documentType: __t("הסכם"),
  documentCategory: __t("הסכם/חוזה"),
  caseType: __t("חיוב חריג"),
  requestType: __t("בדיקת חיוב חריג"),
  amount: '',
  summary: '',
  authority: __t("משרד הכלכלה"),
  jurisdiction: __t("ישראל"),
}

const buildPacketForCase = (category: string, summary: string) => {
  const normalized = category || __t("אחר")

  const packetMap: Record<string, string[]> = {
    'הסכם/חוזה': [__t("טופס עיון בהסכם"), __t("מכתב דרישה לבירור סעיפים"), __t("טופס בקשה למסמכים משלימים")],
    שכירות: [__t("טופס דרישת פירוט חיוב"), __t("מכתב התראה על הפרת חוזה"), __t("טופס בקשה לעיון בחוזה")],
    'דרישת תשלום': [__t("טופס דרישת פירוט חיוב"), __t("מכתב תשלום"), __t("הודעת בקשה להסבר והסרת חיוב")],
    'חיוב חריג': [__t("טופס השגה על חיוב"), __t("מכתב דרישה לפירוט חיוב"), __t("בקשת בדיקה חוזרת של החשבון")],
    פיטורים: [__t("טופס פנייה לשימוע"), __t("בקשה לעיון בחוזה/הסכם"), __t("טופס דרישה לפיצויים")],
    'דיני עבודה': [__t("טופס בקשת שימוע"), __t("מכתב דרישה לתשלום שכר"), __t("טופס עיון במסמכי העסקה")],
    'תביעה/כתב תביעה': [__t("טופס הכנת כתב תביעה"), __t("בקשה למתן סעד"), __t("טופס צירוף ראיות")],
    'ירושה/צוואה': [__t("טופס בקשה לעיון בצוואה"), __t("מכתב דרישה לבירור עיזבון"), __t("טופס תצהיר מסמכים")],
    'נזיקין/תאונה': [__t("טופס דרישת פיצוי"), __t("בקשה למסמכי רפואה"), __t("טופס עיון בתיעוד התאונה")],
    אחר: [__t("טופס פנייה ראשונית"), __t("טופס בקשה לעיון במסמכים"), __t("מכתב תיאור מקרה")],
  }

  const packet = packetMap[normalized] || packetMap['אחר']

  return {
    title: __tt(["סט טפסים ל-", ""], normalized),
    summary:
      summary || __t("הסט הופק על סמך סוג המקרה והמסמכים שזוהו, לפי ניתוח ראשוני של ההליך."),
    forms: packet,
    generatedAt: new Date().toLocaleString('he-IL'),
  };
}

const buildImmediateDocumentAssessment = (file: File, rawText = '') => {
  const fileName = file.name.toLowerCase()
  const text = `${rawText} ${fileName}`.toLowerCase()

  const categories = [
    { label: __t("עיקולים/הוצאה לפועל"), keywords: [__t("עיקול"), __t("עיקולים"), __t("עוקל"), __t("הוצאה לפועל"), __t("הוצל\"פ"), __t("הוצלפ"), __t("גבייה"), __t("גביה"), __t("אזהרה"), __t("תיק איחוד"), __t("ריבית פיגורים"), __t("חשבון מוגבל"), __t("צו עיקול"), __t("כונס נכסים"), __t("רשם ההוצאה לפועל")] },
    { label: __t("הסכם/חוזה"), keywords: [__t("הסכם"), __t("חוזה"), __t("מסגרת"), __t("התחייבות"), __t("מכר"), __t("השכרה"), __t("שירות")] },
    { label: __t("חיוב חריג"), keywords: [__t("חיוב"), __t("עמלה"), __t("ריבית"), __t("כסף"), __t("חיוב חריג"), __t("סכום"), __t("תשלום")] },
    { label: __t("דיני עבודה"), keywords: [__t("פיטורים"), __t("שכר"), __t("העסקה"), __t("עבודה"), __t("שימוע"), __t("פיצויים")] },
    { label: __t("תביעה/כתב תביעה"), keywords: [__t("תביעה"), __t("דרישה"), __t("כתב תביעה"), __t("בקשה"), __t("סעד")] },
    { label: __t("נזיקין/תאונה"), keywords: [__t("נזק"), __t("תאונה"), __t("פגיעה"), __t("אחריות"), __t("רפואה"), __t("פיצוי")] },
    { label: __t("ירושה/צוואה"), keywords: [__t("צוואה"), __t("ירושה"), __t("עיזבון"), __t("יורש")] },
    { label: __t("משפחה"), keywords: [__t("גירושין"), __t("משמורת"), __t("מזונות"), __t("משפחה"), __t("ילד"), __t("בן זוג")] },
  ]

  const isLiens = /עיקול|עוקל|הוצאה לפועל|הוצל"פ|הוצלפ|גבייה|גביה|כונס|רשם ההוצאה/.test(text)

  const matchedCategories = categories
    .filter(({ keywords }) => keywords.some((keyword) => text.includes(keyword)))
    .slice(0, 2)

  const riskSignals = [
    __t("חיוב"),
    __t("עמלה"),
    __t("ריבית"),
    __t("פיטורים"),
    __t("פיצוי"),
    __t("תביעה"),
    __t("דרישה"),
    __t("איום"),
    __t("התראה"),
    __t("עיקול"),
    __t("עוקל"),
    __t("הוצאה לפועל"),
  ].filter((signal) => text.includes(signal))

  const findings = [
    matchedCategories.length > 0
      ? __tt(["זוהתה קטגוריה עיקרית: ", "."], matchedCategories[0].label)
      : __t("לא זוהתה קטגוריה ברורה; המסמך נבחן כטקסט כללי."),
    riskSignals.length > 0
      ? __tt(
      ["נמצאו סמנים של ", " הדורשים עיון יקרתי."],
      riskSignals.slice(0, 3).join(', ')
    )
      : __t(
      "לא נמצאו סמנים חריגים מיידיים, אך יש לבצע בדיקה מלאה של פרטי החיוב/ההתחייבות."
    ),
    isLiens
      ? __t(
      "זוהה הקשר של עיקול / הוצאה לפועל — מומלץ לבדוק אם נגבו כספים מעבר לחוב הפסוק (עיקול ביתר), ואם ננקטו הליכי גבייה כדין."
    )
      : __t("המסמך נבדק באמצעות עקרונות של זיהוי סוג מסמך, תוכן, דרישה וסיכון ראשוני."),
  ]

  const recommendations = isLiens
    ? [
        __t(
          "לבדוק את יתרת החוב המדויקת בתיק ההוצאה לפועל מול הסכומים שנגבו בפועל — כדי לאתר עיקול/גבייה ביתר."
        ),
        __t(
          "לוודא שצו העיקול הומצא כדין ושלא עוקלו כספים מוגנים (משכורת עד תקרה, קצבאות, מזונות)."
        ),
        __t(
          "לשקול הגשת בקשה לרשם ההוצאה לפועל להשבת כספים שנגבו ביתר ו/או להפחתת/עיכוב הליכים."
        ),
      ]
    : [
        __t("לאמת האם יש סעיף של חיוב, עמלות, ריבית, פיצוי או דרישה כספית."),
        __t("בדוק את תוקפו, מועדיו, התחייבויותיו ונספחיו של ההסכם או המסמך."),
        __t("לברר אם נדרשת תגובה בכתב, שימוע, פנייה, דרישה או הגשת מסמך נוסף."),
      ]

  const riskLevel = riskSignals.length > 0 ? __t("סיכון בינוני-גבוה") : __t("סיכון נמוך-בינוני")

  const summary = matchedCategories.length > 0
    ? __tt(
    ["המסמך נראה קשור בעיקר ל-", " והערכת הסיכון הראשונית היא ", "."],
    matchedCategories[0].label.toLowerCase(),
    riskLevel
  )
    : __t(
    "המסמך אינו מצביע בבירור על קטגוריה אחת, ולכן ההערכה הראשונית נערכת לפי תוכן כללי של מסמך ודרישה משפטית אפשרית."
  )

  return {
    title: __t("דוח בדיקה ראשוני"),
    summary,
    findings,
    recommendations,
    riskLevel,
    nextStep: __t(
      "הדוח הוא הערכה ראשונית מקצועית בלבד ולא ייעוץ משפטי מחייב. לפרטים מדויקים יש צורך בבדיקה מעמיקה יותר."
    ),
  };
}

const buildImmediateQuestionAssessment = (rawQuestion: string) => {
  const text = (rawQuestion || '').toLowerCase()

  const topics: { label: string; keywords: string[]; recs: string[] }[] = [
    {
      label: __t("עיקולים / הוצאה לפועל"),
      keywords: [__t("עיקול"), __t("עוקל"), __t("הוצאה לפועל"), __t("הוצל\"פ"), __t("הוצלפ"), __t("גבייה"), __t("גביה"), __t("כונס"), __t("אזהרה"), __t("חשבון מוגבל")],
      recs: [
        __t("בדיקת יתרת החוב מול הסכומים שנגבו בפועל — לאיתור עיקול/גבייה ביתר."),
        __t("בדיקה שלא עוקלו כספים מוגנים (שכר עד תקרה, קצבאות ביטוח לאומי, מזונות)."),
        __t(
          "אפשרות להגיש בקשה לרשם ההוצאה לפועל להשבת כספים שנגבו ביתר או לעיכוב הליכים."
        ),
      ],
    },
    {
      label: __t("דיני עבודה"),
      keywords: [__t("פיטורים"), __t("שכר"), __t("שימוע"), __t("פיצויים"), __t("העסקה"), __t("מעביד"), __t("מעסיק"), __t("התפטרות"), __t("שעות נוספות")],
      recs: [
        __t("בדיקת זכאות לפיצויי פיטורים, הודעה מוקדמת וגמל."),
        __t("בדיקה אם נערך שימוע כדין לפני הפיטורים."),
        __t("איסוף תלושי שכר, הסכם העסקה והתכתבויות רלוונטיות."),
      ],
    },
    {
      label: __t("חוזים והתחייבויות"),
      keywords: [__t("חוזה"), __t("הסכם"), __t("הפרה"), __t("ביטול"), __t("התחייבות"), __t("קנס"), __t("פיצוי מוסכם"), __t("שכירות"), __t("דירה")],
      recs: [
        __t("בדיקת סעיפי ההפרה, הפיצוי המוסכם ותנאי היציאה מההסכם."),
        __t("תיעוד ההפרה ומשלוח דרישה/התראה מסודרת בכתב."),
        __t("בדיקת מועדי התיישנות והתראה טרם נקיטת הליך."),
      ],
    },
    {
      label: __t("נזיקין ותאונות"),
      keywords: [__t("תאונה"), __t("נזק"), __t("פגיעה"), __t("ביטוח"), __t("פיצוי"), __t("רשלנות")],
      recs: [
        __t("איסוף תיעוד רפואי, אישורי מחלה והוכחות נזק."),
        __t("בדיקת אחריות הצד הפוגע וכיסוי ביטוחי רלוונטי."),
        __t("בדיקת מועד ההתיישנות להגשת תביעה."),
      ],
    },
  ]

  const matched = topics.find((t) => t.keywords.some((k) => text.includes(k)))
  const hasMoney = /כסף|סכום|תשלום|ריבית|חוב|₪|שקל|עמלה/.test(text)
  const isLiens = matched?.label.startsWith(__t("עיקולים"))

  const riskLevel = isLiens || hasMoney ? __t("דורש בדיקה דחופה") : __t("סיכון נמוך-בינוני")

  return {
    title: __t("תשובה משפטית ראשונית מיידית"),
    summary: matched
      ? __tt([
      "השאלה נוגעת בעיקר לתחום \"",
      "\". להלן הערכה ראשונית וצעדים מומלצים — אינה תחליף לייעוץ משפטי מלא."
    ], matched.label)
      : __t(
      "זוהתה שאלה משפטית כללית. להלן כיווני בדיקה ראשוניים; לתשובה מדויקת נדרשת בחינה של המסמכים והנסיבות."
    ),
    findings: [
      matched ? __tt(["תחום זוהה: ", "."], matched.label) : __t("לא זוהה תחום מובהק — נדרשת הבהרה של פרטי המקרה."),
      hasMoney ? __t("זוהה היבט כספי — יש לבחון סכומים, ריבית וחיובים אפשריים ביתר.") : __t("לא זוהה היבט כספי מובהק בשאלה."),
      __t(
        "הבדיקה מבוצעת באופן מיידי לפי ניתוח מילולי של השאלה, כשלב מקדים לבדיקה מעמיקה."
      ),
    ],
    recommendations: matched ? matched.recs : [
      __t("לפרט את השתלשלות האירועים, התאריכים והצדדים המעורבים."),
      __t("לאסוף כל מסמך רלוונטי (הסכם, מכתב, דרישה, אישור)."),
      __t("לבדוק מועדי התיישנות/תגובה לפני נקיטת צעד."),
    ],
    riskLevel,
    nextStep: __t(
      "זוהי הערכה ראשונית אוטומטית ולא ייעוץ משפטי מחייב. להמשך — ניתן להעלות מסמך לבדיקה, לפנות לשירות מלא, או להזמין הכנת טפסים ושליחתם."
    ),
  };
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
  if (over > 0) flags.push(__tt(
    ["לפי הנתונים, ייתכן שנגבו ממך כ-", " מעבר לחוב ולתוספות שציינת."],
    formatILS(over)
  ))
  if (over <= 0 && collected > 0) flags.push(__t(
    "לפי הנתונים שהוזנו לא זוהתה גבייה ביתר מובהקת — אך ריביות/הוצאות שנוספו שלא כדין עשויות לשנות זאת."
  ))
  if (protectedIncome) flags.push(__t(
    "ציינת שההכנסה היא קצבה — קצבאות רבות מוגנות מעיקול. ייתכן שעוקלו כספים מוגנים שיש להשיב."
  ))
  if (debt === 0) flags.push(__t("לא הוזן סכום חוב מקורי — כדי לדייק, הזן את סכום החוב הפסוק."))

  const likelyRefund = over > 0
  const verdict = likelyRefund
    ? __t("סביר שנגבה ביתר — מומלץ לבדוק החזר")
    : protectedIncome
      ? __t("ייתכן שעוקלו כספים מוגנים — כדאי בדיקה")
      : __t("לא זוהתה גבייה ביתר מובהקת")

  const riskLevel = likelyRefund || protectedIncome ? __t("דורש בדיקה דחופה") : __t("תקין לכאורה")

  return {
    title: __t("תוצאת בדיקת עיקול"),
    verdict,
    estimatedOverpaid: over > 0 ? Math.round(over) : 0,
    riskLevel,
    summary: likelyRefund
      ? __tt([
      "לפי הבדיקה הכללית, ייתכן שנגבו ממך כ-",
      " ביתר. ניתן לבחון הגשת בקשה להחזר."
    ], formatILS(over))
      : __t(
      "לפי הנתונים שהוזנו, לא זוהתה גבייה ביתר ברורה. עדיין מומלץ לוודא את פירוט החיובים בתיק."
    ),
    findings: flags.length ? flags : [__t("לא זוהו סימנים חריגים לפי הנתונים שהוזנו.")],
    recommendations: [
      __t(
        "להוציא \"תדפיס תיק\" מלא ממערכת ההוצאה לפועל ולהשוות מול הסכומים שנגבו בפועל."
      ),
      __t("לוודא שלא עוקלו כספים מוגנים (קצבאות, שכר עד התקרה המוגנת, מזונות)."),
      likelyRefund ? __t("להגיש בקשה לרשם ההוצאה לפועל להשבת כספים שנגבו ביתר.") : __t("לשמור תיעוד ולעקוב אחר חיובים עתידיים בתיק."),
    ],
    nextStep: __t(
      "בדיקה כללית ומשוערת בלבד, אינה ייעוץ משפטי מחייב. לקבלת החזר ניתן להגיש בקשה — לאחר רישום ואישור מפורש שלך המשרד יטפל בבקשה."
    ),
  };
}

const clientProfiles = [
  {
    id: 'oren',
    name: __t("אורן לוי"),
    caseId: 'MY-20481',
    phase: __t("ניטור מקרה פעיל"),
    nextAction: __t("השלמת מסמכים תומכים"),
    status: __t("ממתין לאישור מסמכים"),
  },
  {
    id: 'liya',
    name: __t("ליה כהן"),
    caseId: 'MY-20492',
    phase: __t("הגשת תביעה"),
    nextAction: __t("אימות מסמכים רפואיים"),
    status: __t("בחינת ראיות"),
  },
  {
    id: 'daniel',
    name: __t("דניאל רז"),
    caseId: 'MY-20510',
    phase: __t("הסדרת הסכם"),
    nextAction: __t("חתימה על נוסח סופי"),
    status: __t("משא ומתן פעיל"),
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
  { sender: 'assistant', text: __t(
    "שלום, אני הסוכן החכם של המשרד. אפשר לעזור לכם בהבנת ההליך, בסטטוס התיק או בהכנת מסמכים."
  ) },
  { sender: 'assistant', text: __t(
    "לדוגמה: כמה זמן לוקח לרוב להגיש בקשה? מה צריך לצרף למסמך? איך מקבלים סט טפסים?"
  ) },
]

const portalStorageKey = 'my-attorney-portal-state'
const selectedProfileStorageKey = 'my-attorney-selected-profile'
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const createInitialPortalState = (): ProfilePortalState => ({
  documents: [
    { id: 'seed-1', documentName: __t("הסכם עבודה.pdf"), category: __t("דיני עבודה"), status: __t("מקומי") },
    { id: 'seed-2', documentName: __t("דרישת תשלום.docx"), category: __t("דרישת תשלום"), status: __t("מקומי") },
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
                  title: typeof dispatch.title === 'string' ? dispatch.title : __t("סט טפסים"),
                  sentAt: typeof dispatch.sentAt === 'string' ? dispatch.sentAt : '-',
                  status: typeof dispatch.status === 'string' ? dispatch.status : __t("בטיפול"),
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
    ) as Record<string, ProfilePortalState>;
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
  if (action === 'upload_document') return __t("העלאת מסמך");
  if (action === 'delete_document') return __t("מחיקת מסמך");
  if (action === 'status_update') return __t("עדכון סטטוס");
  if (action === 'dispatch_packet') return __t("שליחת סט טפסים");
  return __t("פעולה במערכת");
}

const getAuditActorLabel = (actor?: string) => {
  if (actor === 'client') return __t("לקוח");
  if (actor === 'office') return __t("משרד");
  if (actor === 'system') return __t("מערכת");
  return __t("לא צוין");
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
  const [bulkStatusValue, setBulkStatusValue] = useState(__t("בטיפול"))
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
  const [bankDetails, setBankDetails] = useState<{ name?: string; bankCode?: string; branch?: string; branchName?: string; account?: string; owner?: string } | null>(null)
  const [bankLoading, setBankLoading] = useState(false)
  const revealBank = async () => {
    if (bankDetails || bankLoading) return
    setBankLoading(true)
    try {
      const r = await fetch(`${apiBaseUrl}/api/payment-details`)
      const d = await r.json()
      if (d && d.bank) setBankDetails(d.bank)
    } catch { /* ignore */ }
    setBankLoading(false)
  }

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
      ? { id: selectedProfileId, name: clientInfo.name || __t("לקוח"), caseId: clientInfo.caseId || '', phase: __t("תיק פעיל"), nextAction: '', status: __t("פעיל") }
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
              title: item.title || __t("סט טפסים"),
              sentAt: item.sentAt || '-',
              status: item.status || __t("בטיפול"),
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
        setClientLoginForm((f) => ({ ...f, busy: false, error: d.error || __t("התחברות נכשלה") }))
      }
    } catch {
      setClientLoginForm((f) => ({ ...f, busy: false, error: __t("השרת אינו זמין כרגע") }))
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
        setPhoneLogin((f) => ({ ...f, busy: false, error: d.error || __t("שליחת הקוד נכשלה") }))
      }
    } catch {
      setPhoneLogin((f) => ({ ...f, busy: false, error: __t("השרת אינו זמין כרגע") }))
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
        setPhoneLogin((f) => ({ ...f, busy: false, error: d.error || __t("הקוד שגוי") }))
      }
    } catch {
      setPhoneLogin((f) => ({ ...f, busy: false, error: __t("השרת אינו זמין כרגע") }))
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
        setPhoneLogin((f) => ({ ...f, error: d.error || __t("כניסה עם Google נכשלה") }))
        setLoginMethod('phone')
      }
    } catch {
      setPhoneLogin((f) => ({ ...f, error: __t("השרת אינו זמין כרגע") }))
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
      topic: __t("פנייה מהאתר"),
      urgency: __t("רגילה"),
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
        title: __t("לא נבחר קובץ"),
        summary: __t("יש לצרף מסמך לפני שליחת הבדיקה."),
        findings: [__t("לא הועלה מסמך")],
        recommendations: [__t("בחר קובץ Word, PDF, TXT או מסמך אחר והגש שוב.")],
        riskLevel: __t("לא זמין"),
        nextStep: __t("המערכת אינה יכולה לבצע ניתוח מיידי ללא מסמך."),
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
            status: typeof payload.document.status === 'string' ? payload.document.status : __t("חדש"),
            createdAt: typeof payload.document.createdAt === 'string' ? payload.document.createdAt : new Date().toISOString(),
            uploadedAt: typeof payload.document.uploadedAt === 'string' ? payload.document.uploadedAt : undefined,
            fileUrl: typeof payload.document.fileUrl === 'string' ? payload.document.fileUrl : undefined,
          }
        } else if (payload.documentName) {
          persistedDocument = {
            ...persistedDocument,
            documentName: payload.documentName,
            category: legalForm.documentCategory,
            status: __t("חדש"),
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
      title: __t("המסמך נבדק מיידית"),
      summary: isLegal
        ? __tt([
        "",
        " המסמך נראה רלוונטי לייעוץ משפטי ראשוני, אך אינו מהווה חוות דעת מחייבת."
      ], instantAssessment.summary)
        : __tt([
        "",
        " המערכת בוחנת את המסמך באופן מיידי, ללא צורך להמתין לתגובה של צוות המשרד."
      ], instantAssessment.summary),
      findings: [
        __t("המסמך נקלט בהצלחה במערכת."),
        savedByApi
          ? __t("המסמך נשמר גם בשרת ונקשר לתיק הלקוח.")
          : __t("השרת אינו זמין כרגע, המסמך נשמר מקומית עד לחיבור מחדש."),
        __t("הניתוח המיידי מבוצע על פי סוג המסמך, תוכן ונושא ההליך."),
        __t("ההערכה היא ראשונית ולא מהווה ייעוץ משפטי מחייב."),
      ],
      recommendations: instantAssessment.recommendations,
      riskLevel: instantAssessment.riskLevel,
      nextStep: __t(
        "הערכת המסמך התבצעה באופן מיידי. ניתן להמשיך עם בדיקה מעמיקה יותר או לשלוח את הפרטים להמשך טיפול."
      ),
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
        title: __t("לא הוזנה שאלה"),
        summary: __t("כדי לקבל בדיקה מיידית יש להקליד את השאלה המשפטית."),
        findings: [__t("לא הוזן טקסט")],
        recommendations: [__t("נסח בקצרה מה קרה, מי הצדדים ומה מטריד אותך.")],
        riskLevel: __t("לא זמין"),
        nextStep: __t("המערכת אינה יכולה לבצע בדיקה ללא שאלה."),
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
      setLookupSources(getLegalSources(__t("עיקול הוצאה לפועל גבייה כספים מוגנים")))
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
      setRefund((r) => ({ ...r, error: __t("יש למלא שם מלא וטלפון או דוא\"ל.") }))
      return
    }
    if (!refund.consent) {
      setRefund((r) => ({ ...r, error: __t("יש לאשר את תנאי ההתקשרות ושכר הטרחה מותנה ההצלחה.") }))
      return
    }
    if (!refund.truth) {
      setRefund((r) => ({ ...r, error: __t("יש לאשר את הצהרת נכונות הפרטים.") }))
      return
    }
    if (!refund.signature) {
      setRefund((r) => ({ ...r, error: __t("נדרשת חתימה אלקטרונית בתחתית הטופס.") }))
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
          attorney: __t("עו״ד מוחמד מ׳ קבהא, מ.ר 67912"),
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
      ? __t(
      "כדי לקבל סט טפסים מותאם, יש להעלות את המסמך ולאחר מכן לבחור באופציית “הפק טפסים”. המערכת תייצר רשימת טפסים לפי סוג המקרה."
    )
      : trimmed.includes('זמן') || trimmed.includes('כמה')
        ? __t(
      "בדרך כלל ההליך הראשון נמשך בין כמה ימים למספר שבועות, תלוי בסוג המקרה, מסמכים ותשובות הנדרשות."
    )
        : trimmed.includes('שאלה') || trimmed.includes('עזרה')
          ? __t(
      "אני יכול להסביר על סטטוס תיק, נדרשים מסמכים, דרכי הגשה, או להמליץ על הצעד הבא."
    )
          : __t(
      "בכדי לייעל את הטיפול, אני ממליץ להעלות את המסמך, לציין את סוג המקרה ולבחור באופציית הכנת הטפסים."
    )

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
      checks.push(__t("בדיקת תקפות ההסכם, סעיפי החיוב, ביטול/ביצוע וחריגות מהתקנות"))
      checks.push(__t("בחינת חוק החוזים, דיני מכר, שכירות ומסמכים בינלאומיים/ישראלים"))
      requests.push(__t("טופס עיון בהסכם, נספחים והודעות צד ג"))
      requests.push(__t("טופס דרישה לבירור סעיפים והעמדת מסמכים"))
    }

    if (category === 'דרישת תשלום' || category === 'חיוב חריג') {
      checks.push(__t("בדיקת חוקיות חיוב, עמלות, ריבית, פרטים וחריגה מהדין"))
      checks.push(__t("בחינת חוק הגנת הצרכן, הוראות חיוב ותקנות מתאימות"))
      requests.push(__t("טופס דרישה לפירוט חיוב"))
      requests.push(__t("הודעת בקשה לבחינת חיוב חריג"))
    }

    if (category === 'פיטורים' || category === 'דיני עבודה') {
      checks.push(__t("בדיקת פיטורים, התראה, פיצויי פיטורים, זכויות והוראות עבודה"))
      checks.push(__t("סקירה לפי חוקי עבודה, פסיקה עדכנית והנחיות ממשלתיות"))
      requests.push(__t("טופס בקשה לעיון במסמכי עבודה ובשימוע"))
      requests.push(__t("טופס דרישה לתשלום פיצויים/שכר/הפרשות"))
    }

    if (category === 'ירושה/צוואה' || category === 'משפחה') {
      checks.push(__t("בדיקת צוואה, עיזבון, זכויות יורשים, חלוקת רכוש ומסמכים רלוונטיים"))
      checks.push(__t("בחינת הדין המשפחתי והירושות, פסיקה עדכנית ונהלי רישום"))
      requests.push(__t("טופס בקשה לעיון בנתונים וציוד נדרש"))
      requests.push(__t("טופס הכנת דרישה או תצהיר רלוונטי"))
    }

    if (category === 'תביעה/כתב תביעה' || category === 'הגשת תביעה') {
      checks.push(__t("בדיקת הליך תביעה, מועדים, עילות, ראיות ודרישות נוספות"))
      checks.push(__t("סקירה של הדין הרלוונטי, פסיקה והנחיות של בתי המשפט"))
      requests.push(__t("טופס הכנת כתב תביעה/בקשה למתן סעד"))
      requests.push(__t("טופס בקשה לראיות, חוות דעת או מסמכים"))
    }

    if (category === 'נזיקין/תאונה') {
      checks.push(__t("בדיקת עילת נזיקין, הוכחת נזק, אחריות והיקף הפיצוי"))
      checks.push(__t("בחינת דיני נזיקין, נסיבות התאונה ופסיקה רלוונטית"))
      requests.push(__t("טופס בקשה לגיבוי רפואי ומסמכי נזק"))
      requests.push(__t("טופס דרישת פיצוי/הגשת תביעה"))
    }

    if (issue.includes('חיוב') || issue.includes('חריג') || text.includes('עמלה') || text.includes('ריבית')) {
      checks.push(__t("בדיקת חוקיות חיוב, עמלות, ריבית והפרת הדין"))
      checks.push(__t("חוק הגנת הצרכן, התקנות והוראות ניהול חיוב"))
      requests.push(__t("טופס דרישה לפירוט חיוב"))
      requests.push(__t("הודעת בקשה לבחינת חיוב חריג"))
    }

    if (issue.includes('הסכם') || text.includes('הסכם') || text.includes('חוזה')) {
      checks.push(__t("בדיקת תקפות ההסכם, סעיפי החיוב וההתחייבויות"))
      checks.push(__t("בחינת פסיקה עדכנית בתחום החוזים וההתחייבויות"))
      requests.push(__t("טופס עיון בהסכם ובנספחים"))
    }

    if (issue.includes('תביעה') || text.includes('תביעה') || text.includes('פיטורים') || text.includes('עבודה')) {
      checks.push(__t("בדיקת הליך תביעה, מועדים, דרישות והסמכויות"))
      checks.push(__t("סקירה של הדין הרלוונטי, פסיקה והנחיות ממשלתיות"))
      requests.push(__t("טופס בקשה לשימוע/זימון/הגשת מסמכים"))
    }

    if (legalForm.authority === 'משרד הכלכלה' || legalForm.authority === 'רשות התחרות' || legalForm.authority === 'משרד המשפטים') {
      checks.push(__t("בדיקת מאגרי מידע ממשלתיים ורגולציה רלוונטית"))
      checks.push(__t("בחינת הרשות/המשרד הרלוונטי לצורך תיעוד ומענה"))
    }

    if (checks.length === 0) {
      checks.push(__t("בדיקת מסמכים, חוקים ותקנות רלוונטיים"))
      checks.push(__t("סקירת פסיקה עדכנית והנחיות של רשויות"))
      requests.push(__t("טופס פנייה ראשונית למשרד"))
    }

    const uniqueChecks = [...new Set(checks)]
    const uniqueRequests = [...new Set(requests)]

    const riskLevel = amount >= 25000 || legalForm.caseType === 'חיוב חריג' || issue.includes('חריג')
      ? __t("ערך סיכון גבוה")
      : amount >= 5000 ? __t("ערך סיכון בינוני") : __t("ערך סיכון נמוך")

    setLegalReview({
      status: riskLevel,
      summary: __tt([
        "בקטגוריה ",
        " נבחן המקרה בהתאם לסוג המסמך, הסכום, הרשות וההקשר המשפטי. ",
        " נראית באופן ראשוני, וניתן להמשיך בבדיקה מעמיקה מול מאגרי מידע ממשלתיים, חוקים, תקנות ופסיקה רלוונטיים."
      ], category, riskLevel.toLowerCase()),
      checks: uniqueChecks,
      requests: uniqueRequests,
      nextStep: __t(
        "כעת אפשר להגיש את הבקשה, לאסוף מסמכים נוספים, ולהמשיך עם בדיקה משפטית מסודרת מול המשרד."
      ),
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
                  status: __t("מקומי"),
                  createdAt: new Date().toISOString(),
                },
              ],
          lastDispatchNotice: '',
        },
      };
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
                ? __t("המסמך הוסר מהשרת ומהתיק בהצלחה.")
                : __tt(["", " מסמכים הוסרו מהשרת ומהתיק בהצלחה."], deletedIds.length),
          },
        };
      })

      setSelectedDocumentIds((current) => current.filter((id) => !deletedIds.includes(id)))
    } catch {
      setPortalStateByProfile((current) => {
        const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
        return {
          ...current,
          [activeProfile.id]: {
            ...currentProfileState,
            lastDispatchNotice: __t("לא ניתן למחוק את המסמכים כרגע. נסה שוב בעוד רגע."),
          },
        };
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
                note: __tt(["עודכן סטטוס עבור ", " מסמכים"], selectedDocumentIds.length),
              },
              ...currentProfileState.auditLogs,
            ],
            lastDispatchNotice: __tt(
              ["סטטוס עודכן ל-", " עבור ", " מסמכים."],
              bulkStatusValue,
              selectedDocumentIds.length
            ),
          },
        };
      })
    } catch {
      setPortalStateByProfile((current) => {
        const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
        return {
          ...current,
          [activeProfile.id]: {
            ...currentProfileState,
            lastDispatchNotice: __t("עדכון הסטטוס נכשל כרגע. נסה שוב בעוד רגע."),
          },
        };
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
            lastDispatchNotice: __t("יש להפיק סט טפסים לפני שליחה למשרד."),
          },
        };
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
        status: __t("נשלח למשרד"),
      }

      setPortalStateByProfile((current) => {
        const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
        return {
          ...current,
          [activeProfile.id]: {
            ...currentProfileState,
            dispatches: [dispatchRecord, ...currentProfileState.dispatches.filter((item) => item.id !== dispatchRecord.id)],
            lastDispatchNotice: __tt(["הבקשה נשלחה בהצלחה. מספר פנייה: ", ""], dispatchRecord.id),
          },
        };
      })
    } catch {
      const fallbackDispatch: DispatchRecord = {
        id: `${activeProfile.id}-${Date.now()}`,
        title: activePortalState.generatedPacket.title,
        sentAt: new Date().toLocaleString('he-IL'),
        status: __t("נשמר מקומית (API לא זמין)"),
      }

      setPortalStateByProfile((current) => {
        const currentProfileState = current[activeProfile.id] ?? createInitialPortalState()
        return {
          ...current,
          [activeProfile.id]: {
            ...currentProfileState,
            dispatches: [fallbackDispatch, ...currentProfileState.dispatches],
            lastDispatchNotice: __t("שרת השליחה לא זמין כרגע. הבקשה נשמרה מקומית ותישלח לאחר חיבור השרת."),
          },
        };
      })
    } finally {
      setIsSendingPacket(false)
    }
  }

  const loginMethodsMarkup = (
    <>
      <div className="login-seg" role="tablist" aria-label={__t("שיטת כניסה")}>
        <button type="button" role="tab" aria-selected={loginMethod === 'phone'} className={`login-seg-btn${loginMethod === 'phone' ? ' active' : ''}`} onClick={() => setLoginMethod('phone')}>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>{__t("טלפון")}</span>
        </button>
        <button type="button" role="tab" aria-selected={loginMethod === 'google'} className={`login-seg-btn${loginMethod === 'google' ? ' active' : ''}`} onClick={() => setLoginMethod('google')}>
          <svg viewBox="0 0 48 48" width="17" height="17" aria-hidden="true"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
          <span>Google</span>
        </button>
        <button type="button" role="tab" aria-selected={loginMethod === 'code'} className={`login-seg-btn${loginMethod === 'code' ? ' active' : ''}`} onClick={() => setLoginMethod('code')}>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.5 12.5 20 3m-3 0 3 3-2.6 2.6"/></svg>
          <span>{__t("קוד מהמשרד")}</span>
        </button>
      </div>

      {loginMethod === 'phone' && phoneLogin.step === 'phone' && (
        <form onSubmit={requestOtp}>
          <label>{__t("מספר טלפון נייד")}<input type="tel" inputMode="tel" value={phoneLogin.phone} onChange={(e) => setPhoneLogin((f) => ({ ...f, phone: e.target.value }))} placeholder="050-000-0000" />
          </label>
          {phoneLogin.error && <p className="refund-error">{phoneLogin.error}</p>}
          <button type="submit" className="primary-btn submit-btn" disabled={phoneLogin.busy}>{phoneLogin.busy ? __t("שולח...") : __t("שלח לי קוד ב-SMS")}</button>
          <p className="login-hint-mini">{__t("נשלח קוד חד-פעמי לנייד. לקוח חדש — נפתח לך תיק אוטומטית.")}</p>
        </form>
      )}

      {loginMethod === 'phone' && phoneLogin.step === 'code' && (
        <form onSubmit={verifyOtp}>
          {phoneLogin.testMode && phoneLogin.devCode && (
            <p className="paid-banner">{__t("מצב בדיקה — הקוד שלך:") + " "}<strong>{phoneLogin.devCode}</strong></p>
          )}
          <label>{__t("הקוד שקיבלת ב-SMS")}<input inputMode="numeric" value={phoneLogin.code} onChange={(e) => setPhoneLogin((f) => ({ ...f, code: e.target.value }))} placeholder={__t("6 ספרות")} />
          </label>
          {phoneLogin.error && <p className="refund-error">{phoneLogin.error}</p>}
          <button type="submit" className="primary-btn submit-btn" disabled={phoneLogin.busy}>{phoneLogin.busy ? __t("מתחבר...") : __t("כניסה")}</button>
          <button type="button" className="bo-back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setPhoneLogin((f) => ({ ...f, step: 'phone', code: '', error: '' }))}>{__t("← שינוי מספר / שליחה חוזרת")}</button>
        </form>
      )}

      {loginMethod === 'google' && (
        <div className="google-login-wrap">
          {googleClientId ? (
            <div id="google-signin-btn" className="google-btn-holder" />
          ) : (
            <p className="login-hint-mini">{__t(
              "כניסת Google תופעל בקרוב (ממתין להגדרת המשרד). בינתיים אפשר להיכנס בטלפון או בקוד."
            )}</p>
          )}
          {phoneLogin.error && <p className="refund-error">{phoneLogin.error}</p>}
          <p className="login-hint-mini">{__t("כניסה מהירה עם חשבון Google שלך.")}</p>
        </div>
      )}

      {loginMethod === 'code' && (
        <form onSubmit={handleClientLogin}>
          <label>{__t("מספר תיק")}<input value={clientLoginForm.caseId} onChange={(e) => setClientLoginForm((f) => ({ ...f, caseId: e.target.value }))} placeholder={__t("מספר התיק שקיבלת מהמשרד")} />
          </label>
          <label>{__t("קוד גישה")}<input type="password" value={clientLoginForm.code} onChange={(e) => setClientLoginForm((f) => ({ ...f, code: e.target.value }))} />
          </label>
          {clientLoginForm.error && <p className="refund-error">{clientLoginForm.error}</p>}
          <button type="submit" className="primary-btn submit-btn" disabled={clientLoginForm.busy}>{clientLoginForm.busy ? __t("מתחבר...") : __t("כניסה")}</button>
        </form>
      )}

      <p className="login-secure">
        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        {__t("החיבור מאובטח והפרטים שלך שמורים ומוצפנים")}
      </p>
    </>
  )

  return (
    <div className={route === 'client' ? 'page-shell client-mode' : 'page-shell'}>
      {showConsent && (
        <div className="consent-overlay" role="dialog" aria-modal="true">
          <div className="consent-modal">
            <h3>{__t("הצהרה, תנאי שימוש והסכמת פרטיות")}</h3>
            <div className="consent-body">
              <p><strong>{__t("מידע ולא ייעוץ:")}</strong>{" " + __t(
                "המידע והתוצאות באתר הם מידע משפטי כללי המבוסס על מקורות ומאגרים ציבוריים רשמיים (כל זכות, מאגר החקיקה הלאומי) וכלי בדיקה אוטומטיים. המידע"
              ) + " "}<strong>{__t("אינו מהווה ייעוץ משפטי")}</strong>{__t(", אינו תחליף לייעוץ פרטני עם עורך דין, ואינו יוצר יחסי עורך דין–לקוח.")}</p>
              <p><strong>{__t("הסתמכות:")}</strong>{" " + __t(
                "אין להסתמך על התוצאה כבסיס בלעדי לפעולה או להליך משפטי. באחריות המשתמש לפנות לייעוץ מקצועי פרטני טרם נקיטת צעד."
              )}</p>
              <p><strong>{__t("הגנת פרטיות:")}</strong>{" " + __t(
                "בהעלאת מסמך או פרטים, המשתמש מסכים לעיבוד המידע לצורך הבדיקה בלבד, בהתאם לחוק הגנת הפרטיות, התשמ״א‑1981 ותקנותיו. המידע נשמר מאובטח ולא יימסר לצד שלישי ללא הסכמה, למעט כנדרש על פי דין. המשתמש מאשר כי המידע שהועלה שייך לו או שבידו הרשאה כדין להעלותו."
              )}</p>
              <p><strong>{__t("הגבלת אחריות:")}</strong>{" " + __t(
                "השימוש באתר ובכלים הוא באחריות המשתמש בלבד. המפעיל/המשרד לא יישא באחריות לכל נזק ישיר או עקיף שייגרם מהשימוש או מהסתמכות על המידע והתוצאות."
              )}</p>
            </div>
            <label className="consent-check">
              <input type="checkbox" checked={consentChecked} onChange={(e) => setConsentChecked(e.target.checked)} />
              <span>{__t("קראתי, הבנתי ואני מאשר/ת את התנאים ואת הסכמת הפרטיות.")}</span>
            </label>
            <div className="consent-actions">
              <button type="button" className="primary-btn" disabled={!consentChecked} onClick={approveConsent}>{__t("אישור והמשך")}</button>
              <button type="button" className="secondary-btn" onClick={() => setShowConsent(false)}>{__t("ביטול")}</button>
            </div>
          </div>
        </div>
      )}

      {showLogin && !clientAuthed && (
        <div className="consent-overlay" role="dialog" aria-modal="true" onClick={() => setShowLogin(false)}>
          <div className="consent-modal login-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="login-modal-close" aria-label={__t("סגירה")} onClick={() => setShowLogin(false)}>✕</button>
            <div className="login-head">
              <div className="login-emblem">
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>
              </div>
              <h3>{__t("כניסה מהירה לאתר")}</h3>
              <p className="client-login-sub">{__t("התחבר/י בשניות כדי להשתמש בשירותים. לקוח חדש — נפתח לך תיק אוטומטית.")}</p>
            </div>
            {loginMethodsMarkup}
          </div>
        </div>
      )}

      {welcomeInfo && (
        <div className="consent-overlay" role="dialog" aria-modal="true" onClick={() => setWelcomeInfo(null)}>
          <div className="consent-modal welcome-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{__t("🎉 ברוך הבא! נפתח לך תיק אישי")}</h3>
            <p className="client-login-sub">{__t("שמור/י את הפרטים — איתם תוכל/י להיכנס גם בעתיד:")}</p>
            <div className="welcome-case">
              <div><span>{__t("מספר תיק")}</span><strong>{welcomeInfo.caseId}</strong></div>
              {welcomeInfo.code && <div><span>{__t("קוד גישה")}</span><strong>{welcomeInfo.code}</strong></div>}
            </div>
            <p className="login-hint-mini">{__t("אפשר להיכנס גם בטלפון או Google — בלי לזכור את הקוד.")}</p>
            <button type="button" className="primary-btn" onClick={() => setWelcomeInfo(null)}>{__t("הבנתי, נמשיך")}</button>
          </div>
        </div>
      )}

      {refund.open && (
        <div className="consent-overlay" role="dialog" aria-modal="true" onClick={() => setRefund((r) => ({ ...r, open: false }))}>
          <div className="consent-modal auth-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="login-modal-close" aria-label={__t("סגירה")} onClick={() => setRefund((r) => ({ ...r, open: false }))}>✕</button>
            {refund.done ? (
              <div className="auth-done">
                <div className="auth-done-check">✓</div>
                <h3>{__t("תודה! ההרשאה נקלטה בהצלחה")}</h3>
                <p>{__t("קיבלנו את ההרשאה והחתימה הדיגיטלית שלך, והן נשמרו במערכת.")}</p>
                {refund.refId && <div className="auth-done-ref">{__t("מספר פנייה:") + " "}<strong>{refund.refId}</strong></div>}
                <div className="auth-done-next">
                  <p className="auth-done-next-title">{__t("מה קורה עכשיו?")}</p>
                  <ol>
                    <li>{__t("נציג מהמשרד בוחן את הפרטים והמסמכים שמסרת.")}</li>
                    <li>{__t("ניצור איתך קשר בטלפון או במייל לתיאום המשך.")}</li>
                    <li>{__t("המשרד מכין ומגיש את הבקשה מול ההוצאה לפועל — אנחנו עושים הכל בשבילך.")}</li>
                  </ol>
                  <p className="auth-done-fee">{__t("הבדיקה חינם · שכר טרחה 25% + מע״מ ייגבה רק אם יתקבל החזר בפועל.")}</p>
                </div>
                <button type="button" className="primary-btn" onClick={() => setRefund((r) => ({ ...r, open: false }))}>{__t("מצוין, סגור")}</button>
              </div>
            ) : (
              <>
                <p className="eyebrow">{__t("מתן הרשאה למשרד · אנחנו נעשה הכל בשבילך")}</p>
                <h3>{__t("הרשאה לטיפול, ייפוי כוח והסכם שכר טרחה")}</h3>
                <p className="refund-note">{__t(
                  "טופס אחד שכולל את כל מה שצריך כדי שהמשרד יתחיל לטפל: הסכם שכר טרחה מותנה הצלחה, ייפוי כוח, ומדיניות פרטיות — באישור וחתימה דיגיטלית. הבקשה נשלחת למשרד בלבד ואינה מוגשת לרשויות באופן אוטומטי."
                )}</p>
                <form className="refund-form" onSubmit={handleRefundSubmit}>
                  <div className="garnish-grid">
                    <label>{__t("שם מלא")}<input value={refund.fullName} onChange={(e) => setRefund((r) => ({ ...r, fullName: e.target.value }))} />
                    </label>
                    <label>{__t("תעודת זהות")}<input inputMode="numeric" value={refund.idNumber} onChange={(e) => setRefund((r) => ({ ...r, idNumber: e.target.value }))} />
                    </label>
                    <label>{__t("טלפון")}<input inputMode="tel" value={refund.phone} onChange={(e) => setRefund((r) => ({ ...r, phone: e.target.value }))} />
                    </label>
                    <label>{__t("דוא\"ל")}<input inputMode="email" value={refund.email} onChange={(e) => setRefund((r) => ({ ...r, email: e.target.value }))} />
                    </label>
                  </div>
                  <div className="fee-agreement">
                    <p className="fee-agreement-title">{__t("הסכם שכר טרחה מותנה הצלחה וייפוי כוח")}</p>
                    <p className="fee-agreement-sub">{__t("משרד עורכי דין מוחמד מ. קבהא · מ.ר 67912 · בסמ״ה, רח' אלבוח'ארי 95")}</p>
                    <ol className="fee-agreement-list">
                      <li>{__t("הבדיקה וההערכה הראשונית ניתנות ללא עלות.")}</li>
                      <li><strong>{__t("שכר טרחה מותנה הצלחה:")}</strong>{" " + __t("שכר הטרחה יעמוד על") + " "}<strong>{__t("25% בתוספת מע״מ כדין")}</strong>{__t(
                        ", מכל סכום שיושב, יוחזר או ייחסך ללקוח בפועל בעניין בלבד. לא הושב סכום — לא יחול שכר טרחה («ללא זכייה — אין תשלום»). שכר הטרחה יחול וייגבה עם קבלת הכספים בפועל."
                      )}</li>
                      <li>{__t(
                        "אגרות והוצאות חיצוניות, ככל שיהיו, יחולו על הלקוח ואינן כלולות בשכר הטרחה."
                      )}</li>
                      <li><strong>{__t("ייפוי כוח:")}</strong>{" " + __t(
                        "הלקוח ממנה ומייפה בזאת את כוחו של עו״ד מוחמד מ׳ קבהא, מ.ר 67912, לפעול בשמו ובמקומו בעניין השבת כספים שנגבו ביתר — לרבות הגשת בקשות, כתבי טענות ומסמכים לרשות האכיפה והגבייה (ההוצאה לפועל), לבתי המשפט ולכל גורם מוסמך; עיון בתיקים; ניהול משא ומתן; וקבלת כספים בנאמנות עבור הלקוח — עד להשלמת הטיפול או ביטולו בכתב."
                      )}</li>
                      <li><strong>{__t("הצהרת נכונות פרטים ואחריות:")}</strong>{" " + __t(
                        "הלקוח מצהיר כי כל הפרטים, הנתונים והמסמכים שמסר נכונים, מלאים ומדויקים, וכי ידוע לו שהמשרד מסתמך על הצהרתו. נמסרו על ידו פרטים שגויים, חלקיים, כוזבים או מטעים — תחול עליו האחריות המלאה והבלעדית לכל תוצאה, נזק, הוצאה או חבות הנובעים מכך, והמשרד יהיה פטור מכל אחריות בגינם."
                      )}</li>
                      <li>{__t(
                        "המידע והתוצאות בכלי האתר הם מידע כללי המבוסס על מאגרים ציבוריים רשמיים, אינם מהווים ייעוץ משפטי פרטני ואינם התחייבות לתוצאה. עיבוד המידע ייעשה לצורך הטיפול בלבד, בהתאם לחוק הגנת הפרטיות, התשמ״א-1981."
                      )}</li>
                      <li>{__t(
                        "סימון תיבות האישור, לצד מסירת שם הלקוח, מספר תעודת הזהות והמועד, מהווים הסכמה וייפוי כוח חתומים מרחוק לכל דבר ועניין."
                      )}</li>
                    </ol>
                  </div>
                  <label className="consent-line">
                    <input type="checkbox" checked={refund.consent} onChange={(e) => setRefund((r) => ({ ...r, consent: e.target.checked }))} />
                    <span>{__t(
                      "קראתי והבנתי, ואני מסכים/ה להסכם שכר הטרחה המותנה (25% + מע״מ מהסכום שיושב בפועל; ללא זכייה — אין תשלום),"
                    ) + " "}<strong>{__t("ומייפה בזאת את כוחו של עו״ד מוחמד מ׳ קבהא (מ.ר 67912)")}</strong>{" " + __t("לטפל ולייצגני בעניין.")}</span>
                  </label>
                  <label className="consent-line">
                    <input type="checkbox" checked={refund.truth} onChange={(e) => setRefund((r) => ({ ...r, truth: e.target.checked }))} />
                    <span>{__t(
                      "אני מצהיר/ה כי כל הפרטים שמסרתי נכונים, מלאים ומדויקים, ומבין/ה כי במסירת פרטים שגויים או חלקיים תחול עליי האחריות המלאה והבלעדית לכל תוצאה הנובעת מכך."
                    )}</span>
                  </label>
                  <div className="sig-block">
                    <div className="sig-head">
                      <p className="sig-label">{__t("חתימה אלקטרונית") + " "}<span>{__t("— חתמו כאן בעכבר או באצבע")}</span></p>
                      <button type="button" className="sig-clear" onClick={clearSignature}>{__t("נקה")}</button>
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
                    <p className="sig-note">{__t(
                      "החתימה נשמרת עם חותמת זמן ומהווה חתימה אלקטרונית לאישור ההסכם וייפוי הכוח (חוק חתימה אלקטרונית, התשס״א-2001)."
                    )}</p>
                  </div>
                  {refund.error && <p className="refund-error">{refund.error}</p>}
                  <button type="submit" className="primary-btn submit-btn" disabled={refund.sending}>
                    {refund.sending ? __t("שולח...") : __t("✍️ אישור, חתימה ומתן הרשאה")}
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
            <p className="brand-subtitle">{__t("משרד עורכי דין")}</p>
          </div>
        </div>

        <nav className="main-nav" aria-label={__t("כותרת עיקרית")}>
          <a href="#legal-tool">{__t("בדיקה מיידית")}</a>
          <a href="#pricing">{__t("תמחור")}</a>
          <a href="#services">{__t("שירותים")}</a>
          <a href="#faq">{__t("שאלות נפוצות")}</a>
          <a href="#contact">{__t("צור קשר")}</a>
          {clientAuthed ? (
            <a href="#client" className="staff-link">{__t("שלום,") + " "}{clientInfo?.name || __t("לקוח")}{" " + __t("· אזור אישי")}</a>
          ) : (
            <button type="button" className="staff-link login-nav-btn" onClick={() => setShowLogin(true)}>{__t("כניסה / הרשמה")}</button>
          )}
          <a href="#staff" className="staff-link">{__t("אזור צוות")}</a>
        </nav>

        <div className="lang-switch" role="group" aria-label={__t("בחירת שפה")}>
          {LANGS.map((L) => (
            <button
              key={L.code}
              type="button"
              className={`lang-btn${getLang() === L.code ? ' active' : ''}`}
              lang={L.code}
              onClick={() => { if (getLang() !== L.code) setLang(L.code) }}
              aria-pressed={getLang() === L.code}
              title={L.label}
            >
              {L.short}
            </button>
          ))}
        </div>

        <a className="primary-btn" href="#legal-tool">{__t("בדיקה מיידית")}</a>
      </header>

      <a
        className="whatsapp-fab"
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
        target="_blank"
        rel="noreferrer noopener"
        aria-label={__t("דברו איתנו בוואטסאפ")}
      >
        <span className="whatsapp-icon">💬</span>
        <span className="whatsapp-label">{__t("דברו עם עו״ד בוואטסאפ")}</span>
      </a>

      <main>
        <section id="legal-tool" className="hero-tool section">
          <div className="hero-tool-intro">
            <p className="eyebrow">{__t("בדיקה ראשונית חינמית • אינו ייעוץ משפטי")}</p>
            <h1>{__t("האם עוקלו לך כספים? אולי מגיע לך החזר.")}</h1>
            <p className="hero-text">{__t("המערכת מבצעת") + " "}<strong>{__t("מיון טכנולוגי ראשוני")}</strong>{" " + __t(
              "בלבד, המבוסס על מאגרים ציבוריים רשמיים, ומסייעת לזהות אם ייתכן שנגבו ממך כספים ביתר. המערכת"
            ) + " "}<strong>{__t("אינה קובעת זכאות, אינה מהווה ייעוץ משפטי ואינה מבטיחה תוצאה")}</strong>{" " + __t(
              "— תשובה מותאמת נבדקת על ידי עורך דין לפני כל פעולה."
            )}</p>
            <div className="hero-chips">
              <button type="button" className="hero-chip hero-chip-strong" onClick={startLiensCheck}>{__t("🔎 בדוק בחינם אם עוקלו לך כספים")}</button>
              <button type="button" className="hero-chip" onClick={() => setHeroTab('document')}>{__t("📄 בדיקת מסמך")}</button>
              <button type="button" className="hero-chip" onClick={() => setHeroTab('question')}>{__t("⚖️ שאלה משפטית")}</button>
              <a className="hero-chip" href="#pricing">{__t("🧾 הכנת טפסים ושליחה")}</a>
            </div>
          </div>

          <div className="tool-card">
            <div className="tool-tabs" role="tablist">
              <button type="button" role="tab" className={heroTab === 'garnish' ? 'tool-tab active' : 'tool-tab'} onClick={() => setHeroTab('garnish')}>{__t("🧮 בדיקת עיקול")}</button>
              <button type="button" role="tab" className={heroTab === 'document' ? 'tool-tab active' : 'tool-tab'} onClick={() => setHeroTab('document')}>{__t("📄 בדיקת מסמך")}</button>
              <button type="button" role="tab" className={heroTab === 'question' ? 'tool-tab active' : 'tool-tab'} onClick={() => setHeroTab('question')}>{__t("⚖️ שאלה")}</button>
            </div>

            {heroTab === 'document' && (
              <form className="tool-form" onSubmit={handleDocumentReview}>
                <div className="upload-row">
                  <label className="dropzone">
                    <span className="dropzone-icon">⬆️</span>
                    <strong>{uploadedFile ? uploadedFile.name : __t("העלאת קובץ")}</strong>
                    <span className="dropzone-hint">{__t("PDF · Word · תמונה · TXT")}</span>
                    <input type="file" accept=".pdf,.doc,.docx,.txt,.rtf,image/*" onChange={handleFileUpload} />
                  </label>
                  <label className="camera-btn">
                    <span className="dropzone-icon">📷</span>
                    <strong>{__t("צילום מסמך")}</strong>
                    <span className="dropzone-hint">{__t("מצלמים ומנתחים מיד")}</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handleFileUpload} />
                  </label>
                </div>
                <button type="submit" className="primary-btn submit-btn" disabled={isUploadingDocument}>
                  {isUploadingDocument ? __t("מנתח...") : __t("🔎 בדוק מסמך עכשיו")}
                </button>
              </form>
            )}

            {heroTab === 'garnish' && (
              <form className="tool-form garnish-form" onSubmit={handleGarnishSubmit}>
                <p className="garnish-lead">{__t("מלא 3 פרטים ותגלה תוך דקה אם מגיע לך כסף בחזרה:")}</p>
                <div className="garnish-grid">
                  <label>{__t("סכום החוב המקורי (₪)")}<input inputMode="numeric" placeholder={__t("לדוגמה: 20000")} value={garnishInput.originalDebt}
                      onChange={(e) => setGarnishInput((g) => ({ ...g, originalDebt: e.target.value }))} />
                  </label>
                  <label>{__t("סה\"כ שנגבה עד היום (₪)")}<input inputMode="numeric" placeholder={__t("לדוגמה: 26000")} value={garnishInput.totalCollected}
                      onChange={(e) => setGarnishInput((g) => ({ ...g, totalCollected: e.target.value }))} />
                  </label>
                  <label>{__t("ריבית / הוצאות שנוספו כדין (₪)")}<input inputMode="numeric" placeholder={__t("לא חובה")} value={garnishInput.extraCharges}
                      onChange={(e) => setGarnishInput((g) => ({ ...g, extraCharges: e.target.value }))} />
                  </label>
                  <label>{__t("סוג ההכנסה שנפגעה")}<select value={garnishInput.incomeType}
                      onChange={(e) => setGarnishInput((g) => ({ ...g, incomeType: e.target.value as GarnishmentInput['incomeType'] }))}>
                      <option value="salary">{__t("שכר עבודה")}</option>
                      <option value="benefit">{__t("קצבה (ביטוח לאומי / פנסיה)")}</option>
                      <option value="other">{__t("אחר")}</option>
                    </select>
                  </label>
                </div>
                <button type="submit" className="primary-btn submit-btn">{__t("🧮 בדוק אם נגבה ביתר")}</button>
              </form>
            )}

            {heroTab === 'question' && (
              <form className="tool-form" onSubmit={handleQuestionSubmit}>
                <label className="tool-question-label">
                  <span>{__t("תאר את השאלה או המצב המשפטי")}</span>
                  <textarea
                    rows={5}
                    value={legalQuestion}
                    onChange={(event) => setLegalQuestion(event.target.value)}
                    placeholder={__t("לדוגמה: קיבלתי עיקול בהוצאה לפועל — איך אדע אם גבו ממני יותר מדי?")}
                  />
                </label>
                <button type="submit" className="primary-btn submit-btn" disabled={isCheckingQuestion}>
                  {isCheckingQuestion ? __t("בודק...") : __t("⚖️ קבל בדיקה מיידית")}
                </button>
              </form>
            )}

            <p className="tool-disclaimer">{__t("בדיקה כללית ומיידית — הערכה ראשונית בלבד, אינה מהווה ייעוץ משפטי מחייב.")}</p>

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
                  <span className="ai-lab-badge">{__t("AI · שלב") + " "}{procStage + 1}{" " + __t("מתוך 3")}</span>
                  <p className="ai-lab-caption">
                    {[__t("שליחה מאובטחת של הפנייה למערכת"), __t("אפיון ופענוח המקרה מול מקורות משפטיים"), __t("ניסוח תשובה ברורה על ידי העוזרת המשפטית")][procStage]}
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
                    <span className="ai-answer-badge">{__t("העוזרת המשפטית · AI")}</span>
                    <h3>{__t("הנה מה שמצאנו עבורך")}</h3>
                  </div>
                  {aiResult.riskLevel && <span className={`risk-pill risk-${aiResult.riskLevel}`}>{__t("רמת סיכון:") + " "}{aiResult.riskLevel}</span>}
                </div>

                {aiResult.bottomLine && (
                  <div className="answer-bottomline">
                    <span className="answer-tag">{__t("בשורה התחתונה")}</span>
                    <p>{aiResult.bottomLine}</p>
                  </div>
                )}

                {aiResult.plainSummary && (
                  <div className="answer-plain">
                    <span className="answer-plain-tag">{__t("💬 בשפה פשוטה")}</span>
                    <p>{aiResult.plainSummary}</p>
                  </div>
                )}

                <details className="answer-details" open>
                  <summary>{__t("הסבר מקצועי מלא")}</summary>
                  {aiResult.caseDecoding && (
                    <div className="result-block"><strong>{__t("פענוח המקרה")}</strong><p>{aiResult.caseDecoding}</p></div>
                  )}
                  {aiResult.legalAnalysis && (
                    <div className="result-block"><strong>{__t("ניתוח משפטי")}</strong><p>{aiResult.legalAnalysis}</p></div>
                  )}
                  {Array.isArray(aiResult.steps) && aiResult.steps.length > 0 && (
                    <div className="result-block"><strong>{__t("שלבי טיפול מוצעים")}</strong>
                      <ul>{aiResult.steps.map((s, i) => (<li key={i}>{s}</li>))}</ul>
                    </div>
                  )}
                  {Array.isArray(aiResult.remedies) && aiResult.remedies.length > 0 && (
                    <div className="result-block"><strong>{__t("סעדים אפשריים")}</strong>
                      <ul>{aiResult.remedies.map((s, i) => (<li key={i}>{s}</li>))}</ul>
                    </div>
                  )}
                  {Array.isArray(aiResult.sources) && aiResult.sources.length > 0 && (
                    <div className="result-block sources-block"><strong>{__t("מקורות")}</strong>
                      <ul>{aiResult.sources.map((s, i) => (
                        <li key={i}>{s.url ? <a href={s.url} target="_blank" rel="noreferrer noopener">{s.title || s.url}</a> : (s.title || '')}</li>
                      ))}</ul>
                    </div>
                  )}
                </details>

                <div className="handle-cta handle-cta-answer">
                  <p className="handle-cta-lead">✨ <strong>{__t("אנחנו נעשה הכל בשבילך")}</strong></p>
                  <p className="handle-cta-sub">{__t(
                    "בלחיצה אחת תיתן/י למשרד הרשאה לטפל — טופס אחד שכולל הסכם שכר טרחה, ייפוי כוח ומדיניות פרטיות, בחתימה דיגיטלית."
                  )}</p>
                  <button type="button" className="primary-btn" onClick={openRefund}>{__t("📝 מתן הרשאה למשרד לטפל")}</button>
                </div>

                <p className="tool-disclaimer">{aiResult.disclaimer || __t("מידע כללי בלבד — אינו ייעוץ משפטי מחייב.")}</p>
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
                    <svg viewBox="0 0 200 120" role="img" aria-label={__tt(["רמת סיכון: ", ""], garnishResult.riskLevel)}>
                      <path className="gauge-arc" d="M20 100 A80 80 0 0 1 60 30.7" stroke="#22c55e" />
                      <path className="gauge-arc" d="M60 30.7 A80 80 0 0 1 140 30.7" stroke="#f59e0b" />
                      <path className="gauge-arc" d="M140 30.7 A80 80 0 0 1 180 100" stroke="#ef4444" />
                      <g className="gauge-needle">
                        <line x1="100" y1="100" x2="100" y2="42" stroke="#0f172a" strokeWidth="3.6" strokeLinecap="round" />
                        <animateTransform attributeName="transform" type="rotate" from="-86 100 100" to={`${{ 'נמוך': -60, 'בינוני': 0, 'גבוה': 60 }[garnishResult.riskLevel] ?? 0} 100 100`} dur="0.9s" fill="freeze" calcMode="spline" keyTimes="0;1" keySplines="0.2 1 0.3 1" />
                      </g>
                      <circle cx="100" cy="100" r="6.5" fill="#0f172a" />
                    </svg>
                    <div className="risk-gauge-labels"><span>{__t("נמוך")}</span><span>{__t("בינוני")}</span><span>{__t("גבוה")}</span></div>
                  </div>

                  {garnishResult.estimatedOverpaid > 0 && (
                    <div className="overpaid-hero">
                      <span className="overpaid-hero-label">{__t("הערכת גבייה ביתר")}</span>
                      <strong className="overpaid-hero-num">{'₪' + countUp.toLocaleString('he-IL')}</strong>
                      <span className="overpaid-hero-sub">{__t("סכום פוטנציאלי להחזר")}</span>
                    </div>
                  )}
                </div>
                {garnishResult.estimatedOverpaid > 0 && (
                  <p className="success-fee-note">💚 <strong>{__t("הבדיקה חינם · ללא תשלום מראש")}</strong>{" " + __t("— אנחנו מטפלים בהגשת הבקשה, ותשלמו עמלת הצלחה של") + " "}<strong>{__t("25% + מע״מ")}</strong>{" " + __t("רק מהסכום שנחזיר לכם בפועל. ללא זכייה — אין תשלום.")}</p>
                )}
                <p className="verdict-line">{garnishResult.verdict}</p>
                <p>{garnishResult.summary}</p>
                <div className="result-block">
                  <strong>{__t("ממצאים")}</strong>
                  <ul>{garnishResult.findings.map((item) => (<li key={item}>{item}</li>))}</ul>
                </div>
                <div className="result-block">
                  <strong>{__t("המלצות")}</strong>
                  <ul>{garnishResult.recommendations.map((item) => (<li key={item}>{item}</li>))}</ul>
                </div>
                <p className="tool-disclaimer">{garnishResult.nextStep}</p>

                {lookupSources && (
                  <div className="result-block sources-block">
                    <strong>{__t("מקורות מידע — מבוסס על מאגרים ציבוריים")}</strong>
                    <ul>
                      {lookupSources.sources.map((s) => (
                        <li key={s.u}><a href={s.u} target="_blank" rel="noreferrer noopener">{s.t}</a></li>
                      ))}
                    </ul>
                    <p className="sources-note">{__t(
                      "התשובה מבוססת על מקורות ציבוריים חינמיים (כל זכות ומאגר החקיקה הלאומי). מומלץ לעיין במקור."
                    )}</p>
                    {lookupSources.forms && lookupSources.forms.length > 0 && (
                      <div className="forms-links">
                        <strong>{__t("שליפת טפסים לפי סוג הבקשה")}</strong>
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
                  <div className="refund-done">{__t("✅ הבקשה וההרשאה נשלחו בהצלחה. נציג/ת מהמשרד יחזרו אליך בהקדם לטיפול.")}</div>
                ) : (
                  <div className="handle-cta">
                    <p className="handle-cta-lead">✨ <strong>{__t("אנחנו נעשה הכל בשבילך")}</strong>{" " + __t("— בדיקה, הכנת הבקשה, והגשה מול ההוצאה לפועל.")}</p>
                    <button type="button" className="primary-btn refund-btn" onClick={openRefund}>{__t("📝 מתן הרשאה למשרד לטפל")}</button>
                    <a className="secondary-btn" href="#pricing">{__t("הכנת טפסים ושליחה")}</a>
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
                  <strong>{__t("ממצאים")}</strong>
                  <ul>
                    {reviewResult.findings.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="result-block">
                  <strong>{__t("המלצות")}</strong>
                  <ul>
                    {reviewResult.recommendations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <strong>{reviewResult.nextStep}</strong>

                {lookupSources && (
                  <div className="result-block sources-block">
                    <strong>{__t("מקורות מידע — מבוסס על מאגרים ציבוריים")}</strong>
                    <ul>
                      {lookupSources.sources.map((s) => (
                        <li key={s.u}><a href={s.u} target="_blank" rel="noreferrer noopener">{s.t}</a></li>
                      ))}
                    </ul>
                    <p className="sources-note">{__t(
                      "התשובה מבוססת על מקורות ציבוריים חינמיים (כל זכות ומאגר החקיקה הלאומי). מומלץ לעיין במקור."
                    )}</p>
                    {lookupSources.forms && lookupSources.forms.length > 0 && (
                      <div className="forms-links">
                        <strong>{__t("שליפת טפסים לפי סוג הבקשה")}</strong>
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
                  <a className="primary-btn" href="#pricing">{__t("🧾 הכנת טפסים ושליחה אונליין")}</a>
                  <a className="secondary-btn" href="#contact">{__t("המשך לשירות מלא של המשרד")}</a>
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
            <p className="eyebrow">{__t("מה אנחנו עושים")}</p>
            <h2>{__t("מומחיות: הוצאה לפועל, עיקולים וזכויות עובדים")}</h2>
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
            <p className="eyebrow">{__t("למה לבחור בנו")}</p>
            <h2>{__t("ליווי משפטי שמתחיל בתשומת לב ומסתיים בתוצאה.")}</h2>
          </div>
          <div className="insight-list">
            <div>
              <strong>{__t("גישה אישית")}</strong>
              <p>{__t("כל לקוח מקבל תכנון פרטני והבנה מעמיקה של הסיטואציה.")}</p>
            </div>
            <div>
              <strong>{__t("תיעוד ברור")}</strong>
              <p>{__t("נשמרת שקיפות מלאה בכל צעד, מהפגישה הראשונית ועד לסיום ההליך.")}</p>
            </div>
            <div>
              <strong>{__t("ניסיון מעשי")}</strong>
              <p>{__t("העבודה מול בתי משפט, צדדים נוספים ולקוחות מסחריים מביאה מענה אפקטיבי.")}</p>
            </div>
          </div>
        </section>

        <section id="about" className="section about-section">
          <div className="about-visual">
            <div className="about-box">
              <p className="eyebrow">{__t("הגישה שלנו")}</p>
              <h3>{__t("הליכים שמבוססים על תכנון, אמון ועמידה מול האתגרים.")}</h3>
            </div>
          </div>

          <div className="about-copy">
            <p className="eyebrow">{__t("אודות המשרד")}</p>
            <h2>{__t("חוות דעת משפטית שמביאה בהירות ויעילות לאורך כל הדרך.")}</h2>
            <p>{__t(
              "אנו מאמינים שכל לקוח ראוי לליווי אישי, הבנה מעמיקה של הסיטואציה והתקדמות שקופה. לכן, כל תיק מנוהל בתשומת לב מקצועית, בשילוב בין ניתוח משפטי מעמיק לבין עמידה ברמה הגבוהה ביותר של שירות."
            )}</p>
            <ul>
              <li>{__t("סדרי עדיפויות שמתאימים למקרה הספציפי שלך")}</li>
              <li>{__t("תקשורת פתוחה וחדה לאורך כל ההליך")}</li>
              <li>{__t("ייצוג שקט ושקול, אך תקיף בכל שלב")}</li>
            </ul>
          </div>
        </section>

        <section id="team" className="section team-section">
          <div className="section-header">
            <p className="eyebrow">{__t("הצוות")}</p>
            <h2>{__t("עורכי דין שמבינים את המורכבות של המקרה שלך")}</h2>
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
            <p className="eyebrow">{__t("איך עובדים איתנו")}</p>
            <h2>{__t("הליך פשוט, ברור ומקצועי")}</h2>
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
            <p className="eyebrow">{__t("שאלות נפוצות")}</p>
            <h2>{__t("הסברים חשובים לפני שמתחילים")}</h2>
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
            <p className="eyebrow">{__t("לקוחות מספרים")}</p>
            <h2>{__t("אמון שנבנה על תוצאה והבנה")}</h2>
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
            <p className="eyebrow">{__t("צור קשר")}</p>
            <h2>{__t("בואו נדבר על המקרה שלכם.")}</h2>
            <p>{__t(
              "נשמח ללוות אתכם מהשלב הראשון ועד לסיום ההליך. שלחו פרטים וכמתמחים בתחום, נחזור אליכם בהקדם."
            )}</p>
            <ul className="contact-list">
              <li>{__t("מייל: info@my-attorney.net")}</li>
              <li>{__t("טלפון: 052-661-1866")}</li>
              <li>{__t("כתובת: בסמ״ה, רח' אלבוח'ארי 95, מיקוד 3002300")}</li>
              <li>{__t("שעות: ימים א'-ה', 09:00-18:00")}</li>
            </ul>
          </div>

          <form className="contact-form" onSubmit={handleSubmit} aria-label={__t("טופס יצירת קשר")}>
            <label>{__t("שם מלא")}<input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={__t("הקלד את שמך")}
              />
            </label>
            <label>{__t("דוא\"ל")}<input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
              />
            </label>
            <label>{__t("טלפון")}<input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="050-000-0000"
              />
            </label>
            <label>{__t("תיאור המקרה")}<textarea
                rows={4}
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder={__t("ספר בקצרה על המקרה שלך")}
              />
            </label>
            <button type="submit" className="primary-btn submit-btn">{__t("שלח בקשה")}</button>
            {submitted && <p className="success-message">{__t("הטופס נשלח בהצלחה. נחזור אליכם בהקדם.")}</p>}
          </form>
        </section>

        <section className="section how-section" aria-label={__t("איך זה עובד")}>
          <div className="section-header">
            <p className="eyebrow">{__t("איך זה עובד")}</p>
            <h2>{__t("משלוש דקות של בדיקה — לפעולה משפטית")}</h2>
          </div>
          <div className="how-grid">
            <div className="how-step"><span className="how-num">1</span><strong>{__t("מעלים מסמך או שואלים")}</strong><p>{__t("מסמך שקיבלת (עיקול, דרישה, חוזה) או שאלה חופשית.")}</p></div>
            <div className="how-step"><span className="how-num">2</span><strong>{__t("מקבלים מיון ראשוני")}</strong><p>{__t(
              "זיהוי ראשוני של סוג העניין ונקודות לבדיקה. אינו ייעוץ משפטי — נבדק על ידי עורך דין לפני כל פעולה."
            )}</p></div>
            <div className="how-step"><span className="how-num">3</span><strong>{__t("ממשיכים לפעולה")}</strong><p>{__t("הכנת טפסים ושליחה אונליין, או שירות משפטי מלא של המשרד.")}</p></div>
          </div>
        </section>

        <section id="pricing" className="section pricing-section" aria-label={__t("תמחור לפי סוג תיק")}>
          <div className="section-header">
            <p className="eyebrow">{__t("בדיקה חינם · משלמים רק על הצלחה")}</p>
            <h2>{__t("בדיקת עיקול — חינם. עמלה רק מהחזר בפועל.")}</h2>
            <p>{__t(
              "הבדיקה ובדיקת הזכאות להחזר — ללא עלות. אם מגיע לכם החזר, אנחנו מטפלים בהגשה, ומשלמים עמלת הצלחה של"
            ) + " "}<strong>{__t("25% + מע״מ")}</strong>{" " + __t("רק מהסכום שנחזיר לכם בפועל. ללא זכייה — אין תשלום.")}</p>
            {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('paid') === '1' && (
              <p className="paid-banner">{__t("✅ התשלום התקבל בהצלחה! נציג/ת מהמשרד יחזרו אליך בהקדם.")}</p>
            )}
          </div>

          <div className="no-upfront-banner">
            🛡️ <strong>{__t("מעוקל? אתה לא משלם שקל מראש.")}</strong>{" " + __t("בבדיקת/החזר עיקול — שכר הטרחה נגבה") + " "}<strong>{__t("רק מההחזר שיתקבל")}</strong>{__t(
            ", מתוך הכסף שחוזר אליך. גם אם חשבונך מוגבל — אפשר להתחיל בלי כל תשלום מקדים."
          )}</div>

          <div className="pricing-trust">
            <span className="pricing-trust-item">🛡️ {__t("ללא תשלום מראש")}</span>
            <span className="pricing-trust-item">⚖️ {__t("עו״ד אחראי על התיק")}</span>
            <span className="pricing-trust-item">✅ {__t("עמלה רק על הצלחה")}</span>
            <span className="pricing-trust-item">🔒 {__t("תשלום מאובטח")}</span>
          </div>

          <div className="pricing-grid">
            {pricingTiers.map((tier) => (
              <div key={tier.name} className={`pricing-card${tier.highlight ? ' featured' : ''}`}>
                {'ribbon' in tier && tier.ribbon && <span className="pricing-ribbon">{tier.ribbon}</span>}
                <h3>{tier.name}</h3>
                <div className="pricing-price">{tier.price}{'sub' in tier && tier.sub && <span className="pricing-price-sub">{tier.sub}</span>}</div>
                {'then' in tier && tier.then && <p className="pricing-then">{tier.then}</p>}
                <ul className="pricing-features">
                  {tier.features.map((f) => (
                    <li key={f}>
                      <svg className="pricing-check" viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zm4.03 6.28-4.8 4.8a.75.75 0 0 1-1.06 0l-2.2-2.2a.75.75 0 1 1 1.06-1.06l1.67 1.67 4.27-4.27a.75.75 0 0 1 1.06 1.06z"/></svg>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                {'value' in tier && tier.value && <p className="pricing-value">{tier.value}</p>}
                {'free' in tier ? (
                  <button type="button" className="primary-btn" onClick={() => { startLiensCheck(); window.location.hash = 'legal-tool' }}>{tier.cta}</button>
                ) : 'id' in tier ? (
                  <button type="button" className="secondary-btn" onClick={() => handleCheckout((tier as { id: string }).id)}>{tier.cta}</button>
                ) : (
                  <a className="secondary-btn" href="#contact">{tier.cta}</a>
                )}
              </div>
            ))}
          </div>
          <div className="pay-options">
            <p className="pay-methods">{__t("💳 להכנת טפסים בתשלום: כרטיס אשראי · Apple Pay · Google Pay")}</p>
            <div className="pay-alt-box">
              <p className="pay-alt-title">{__t("חשבונך מוגבל או שלא נוח בכרטיס? אפשר לשלם גם כך:")}</p>
              <div className="pay-alt-grid">
                <div className="pay-alt-card">
                  <span className="pay-alt-badge">Bit</span>
                  <strong>052-661-1866</strong>
                  <span className="pay-alt-sub">{__t("ע״ש עו״ד מוחמד מ. קבהא")}</span>
                </div>
                <div className="pay-alt-card">
                  <span className="pay-alt-badge">{__t("העברה בנקאית")}</span>
                  {bankDetails ? (
                    <>
                      <strong>{bankDetails.name} ({bankDetails.bankCode})</strong>
                      <span className="pay-alt-sub">{__t("סניף") + " "}{bankDetails.branch} ({bankDetails.branchName}{__t(") · חשבון") + " "}{bankDetails.account}</span>
                      <span className="pay-alt-sub">{__t("ע״ש") + " "}{bankDetails.owner}</span>
                    </>
                  ) : (
                    <button type="button" className="pay-reveal-btn" onClick={revealBank}>{bankLoading ? __t("טוען…") : __t("הצג פרטים לתשלום")}</button>
                  )}
                </div>
                <div className="pay-alt-card">
                  <span className="pay-alt-badge">{__t("במשרד")}</span>
                  <strong>{__t("בתיאום מראש")}</strong>
                  <span className="pay-alt-sub">{__t("בסמ״ה, רח' אלבוח'ארי 95")}</span>
                </div>
              </div>
              <p className="pay-alt-note">{__t("אחרי תשלום ב‑Bit או בהעברה —") + " "}{' '}
                <a className="pay-contact" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(__t("שלום, ביצעתי תשלום עבור הכנת טפסים (Bit/העברה) — מצרף אישור"))}`} target="_blank" rel="noreferrer noopener">{__t("שלחו אישור בוואטסאפ")}</a> {' '}{__t("או התקשרו 052-661-1866, ונתחיל בטיפול.")}</p>
            </div>
          </div>
          <p className="pricing-note">{__t(
            "* עמלת ההצלחה (25% + מע״מ) ותעריפי הטפסים כפופים לאישור עורך הדין ולהסכם שכר טרחה חתום. המחירים להמחשה וניתנים לעדכון."
          )}</p>
        </section>

        {route === 'client' && !clientAuthed && (
          <section className="section client-login-section" aria-label={__t("כניסת לקוחות")}>
            <div className="client-login-card">
              <p className="eyebrow">{__t("אזור אישי · כניסת לקוחות")}</p>
              <h2>{__t("כניסה לתיק האישי שלך")}</h2>
              <p className="client-login-sub">{__t(
                "כניסה מהירה ומאובטחת. לקוח חדש — נפתח לך תיק אוטומטית. אזור זה מופרד ומאובטח."
              )}</p>

              {loginMethodsMarkup}

              <a className="bo-back-link" href="#legal-tool" onClick={() => { window.location.hash = ''; }}>{__t("← חזרה לאתר")}</a>
            </div>
          </section>
        )}

        {clientAuthed && (route === 'client' || route === 'portal') && (
        <section id="portal" className="section portal-section" aria-label={__t("לוח לקוח אישי")}>
          <div className="section-header">
            <p className="eyebrow">{__t("לוח לקוח ·") + " "}{clientInfo?.name || activeProfile.name}</p>
            <h2>{__t("הדף האישי של") + " "}{clientInfo?.name || activeProfile.name}</h2>
            <button type="button" className="bo-back-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setClientAuthed(false); setClientInfo(null); setClientLoginForm({ caseId: '', code: '', error: '', busy: false }) }}>{__t("← יציאה מהאזור האישי")}</button>
          </div>

          <div className="share-bar" aria-label={__t("שיתוף האתר")}>
            <span className="share-bar-label">{__t("מרוצים מהשירות? שתפו את האתר:")}</span>
            <div className="share-buttons">
              {(() => {
                const shareUrl = 'https://www.my-attorney.net'
                const shareText = __t("בדיקה משפטית מיידית ובקשת החזר עיקול — My-Attorney")
                const enc = encodeURIComponent
                return (
                  <>
                    <a className="share-btn wa" href={`https://wa.me/?text=${enc(shareText + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    <a className="share-btn fb" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
                    <a className="share-btn li" href={`https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                    <a className="share-btn x" href={`https://twitter.com/intent/tweet?text=${enc(shareText)}&url=${enc(shareUrl)}`} target="_blank" rel="noopener noreferrer">X</a>
                    <button type="button" className="share-btn copy" onClick={() => { try { navigator.clipboard?.writeText(shareUrl) } catch { /* ignore */ } }}>{__t("העתק קישור")}</button>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="portal-layout">
            <div className="portal-card summary-card">
              <div className="portal-headline">
                <span className="mini-tag">{__t("מספר תיק")}</span>
                <strong>{activeProfile.caseId}</strong>
              </div>
              <h3>{activeProfile.phase}</h3>
              <ul>
                <li>{__t("סטטוס:") + " "}{activeProfile.status}</li>
                <li>{__t("הצעד הבא:") + " "}{activeProfile.nextAction}</li>
                <li>{__t("עדכון אחרון: 12 באוגוסט 2026")}</li>
              </ul>
            </div>

            <div className="portal-card assistant-card">
              <div className="assistant-header">
                <strong>{__t("סוכן חכם")}</strong>
                <span>{__t("שאל תשובה")}</span>
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
                  placeholder={__t("שאל על מסמך, סטטוס, טפסים או תהליך")}
                />
                <button type="submit" className="primary-btn submit-btn">{__t("שלח")}</button>
              </form>
            </div>

            <div className="portal-card docs-card">
              <div className="assistant-header">
                <strong>{__t("מסמכים שהועלו")}</strong>
                <span>{activePortalState.documents.length}{" " + __t("קבצים")}</span>
              </div>

              <div className="doc-bulk-toolbar">
                <label>
                  <input
                    type="checkbox"
                    checked={paginatedDocuments.length > 0 && paginatedDocuments.every((doc) => selectedDocumentIds.includes(doc.id))}
                    onChange={toggleSelectAllVisibleDocuments}
                  />{__t("בחר את כל המסמכים בעמוד")}</label>

                <div className="doc-bulk-actions">
                  <select
                    className="doc-select doc-select-compact"
                    value={bulkStatusValue}
                    onChange={(event) => setBulkStatusValue(event.target.value)}
                  >
                    <option value="חדש">{__t("סטטוס: חדש")}</option>
                    <option value="בטיפול">{__t("סטטוס: בטיפול")}</option>
                    <option value="נבדק">{__t("סטטוס: נבדק")}</option>
                    <option value="הושלם">{__t("סטטוס: הושלם")}</option>
                  </select>
                  <button
                    type="button"
                    className="secondary-btn"
                    disabled={selectedDocumentIds.length === 0 || isUpdatingStatus}
                    onClick={handleBulkStatusUpdate}
                  >
                    {isUpdatingStatus ? __t("מעדכן...") : __tt(["עדכן סטטוס (", ")"], selectedDocumentIds.length)}
                  </button>
                  <button
                    type="button"
                    className="doc-delete-btn"
                    disabled={selectedDocumentIds.length === 0}
                    onClick={() => setPendingBulkDelete(true)}
                  >{__t("מחק מסמכים נבחרים (")}{selectedDocumentIds.length})
                  </button>
                </div>
              </div>

              <div className="docs-tools">
                <input
                  type="search"
                  value={documentSearchTerm}
                  onChange={(event) => setDocumentSearchTerm(event.target.value)}
                  className="doc-search-input"
                  placeholder={__t("חיפוש מהיר לפי שם מסמך")}
                />
                <select
                  value={documentCategoryFilter}
                  onChange={(event) => setDocumentCategoryFilter(event.target.value)}
                  className="doc-select"
                >
                  <option value="all">{__t("כל הקטגוריות")}</option>
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
                  <option value="newest">{__t("מיון: חדש לישן")}</option>
                  <option value="oldest">{__t("מיון: ישן לחדש")}</option>
                  <option value="name">{__t("מיון: שם א-ת")}</option>
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
                        <span className={`doc-status status-${(doc.status || __t("חדש")).replace(/\s+/g, '-')}`}>
                          {doc.status || __t("חדש")}
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
                      {isDeletingDocumentId === doc.id ? __t("מוחק...") : __t("הסר")}
                    </button>
                  </li>
                ))}
              </ul>

              {filteredDocuments.length === 0 && (
                <p className="doc-empty-message">{__t("לא נמצאו מסמכים מתאימים לסינון הנוכחי.")}</p>
              )}

              {filteredDocuments.length > 0 && (
                <div className="doc-pagination">
                  <span>{__t("עמוד") + " "}{documentsPage}{" " + __t("מתוך") + " "}{totalDocumentPages}
                  </span>
                  <div className="doc-pagination-actions">
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => setDocumentsPage((current) => Math.max(1, current - 1))}
                      disabled={documentsPage === 1}
                    >{__t("קודם")}</button>
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={() => setDocumentsPage((current) => Math.min(totalDocumentPages, current + 1))}
                      disabled={documentsPage === totalDocumentPages}
                    >{__t("הבא")}</button>
                  </div>
                </div>
              )}

              <button
                type="button"
                className="primary-btn submit-btn"
                onClick={handleGeneratePacketFromPortal}
              >{__t("הפק סט טפסים")}</button>
            </div>
          </div>

          <div className="portal-card audit-card">
            <div className="assistant-header">
              <strong>{__t("יומן פעולות בתיק")}</strong>
              <span>{filteredAuditLogs.length}{" " + __t("רשומות")}</span>
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
                <option value="all">{__t("כל הפעולות")}</option>
                <option value="upload_document">{__t("העלאות מסמכים")}</option>
                <option value="delete_document">{__t("מחיקות מסמכים")}</option>
                <option value="status_update">{__t("עדכוני סטטוס")}</option>
                <option value="dispatch_packet">{__t("שליחת סט טפסים")}</option>
              </select>

              <select
                className="doc-select doc-select-compact"
                value={auditDateRange}
                onChange={(event) => setAuditDateRange(event.target.value as 'all' | '7' | '30')}
              >
                <option value="all">{__t("כל התאריכים")}</option>
                <option value="7">{__t("7 ימים אחרונים")}</option>
                <option value="30">{__t("30 ימים אחרונים")}</option>
              </select>
            </div>

            <ul className="audit-list">
              {filteredAuditLogs.slice(0, 8).map((log) => (
                <li key={log.id}>
                  <div>
                    <strong>{getAuditActionLabel(log.action)}</strong>
                    <p>{log.note || log.documentName || __t("פעולה בוצעה בהצלחה.")}</p>
                  </div>
                  <div className="audit-meta">
                    <small>{__t("בוצע על ידי:") + " "}{getAuditActorLabel(log.actor)}</small>
                    {log.status && <span className="doc-status">{log.status}</span>}
                    <small>{new Date(log.occurredAt).toLocaleString('he-IL')}</small>
                  </div>
                </li>
              ))}
            </ul>

            {filteredAuditLogs.length === 0 && (
              <p className="doc-empty-message">{__t("אין רשומות פעילות עדיין עבור תיק זה.")}</p>
            )}
          </div>

          {(pendingDeleteDocument || pendingBulkDelete) && (
            <div className="confirm-overlay" role="dialog" aria-modal="true" aria-label={__t("אישור מחיקת מסמך")}>
              <div className="confirm-card">
                <h3>{__t("לאשר מחיקה?")}</h3>
                <p>
                  {pendingDeleteDocument ? (
                    <>{__t("המסמך") + " "}<strong>{pendingDeleteDocument.documentName}</strong>{" " + __t("יוסר מהתיק ומהשרת.")}</>
                  ) : (
                    <>
                      {selectedDocumentIds.length}{" " + __t("מסמכים יוסרו מהתיק ומהשרת.")}</>
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
                  >{__t("ביטול")}</button>
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
                    {isDeletingDocumentId !== null ? __t("מוחק...") : __t("אשר מחיקה")}
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
                {isSendingPacket ? __t("שולח בקשה...") : __t("שלח את הסט ישירות למשרד")}
              </button>

              {activePortalState.lastDispatchNotice && (
                <p className="dispatch-message">{activePortalState.lastDispatchNotice}</p>
              )}

              {activePortalState.dispatches.length > 0 && (
                <div className="dispatch-log">
                  <strong>{__t("פניות שנשלחו")}</strong>
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

        <section className="section legal-review-section" aria-label={__t("שאלון בדיקה משפטית")}>
          <div className="section-header">
            <p className="eyebrow">{__t("בדיקה משפטית")}</p>
            <h2>{__t("אימות מהיר של מקרה, חיוב חריג, מסמך או בקשה משפטית")}</h2>
          </div>

          <form className="legal-review-form" onSubmit={handleLegalSubmission}>
            <div className="legal-grid">
              <label className="legal-field">{__t("סוג המקרה")}<select name="caseType" value={legalForm.caseType} onChange={handleLegalFormChange}>
                  <option value="חיוב חריג">{__t("חיוב חריג")}</option>
                  <option value="הסכם וחוזה">{__t("הסכם וחוזה")}</option>
                  <option value="תביעה או דרישה">{__t("תביעה או דרישה")}</option>
                  <option value="עבודה ופיטורים">{__t("עבודה ופיטורים")}</option>
                  <option value="נזיקין">{__t("נזיקין")}</option>
                </select>
              </label>

              <label className="legal-field">{__t("קטגוריית מסמך נפוצה בדין הישראלי")}<select name="documentCategory" value={legalForm.documentCategory} onChange={handleLegalFormChange}>
                  <option value="הסכם/חוזה">{__t("הסכם/חוזה")}</option>
                  <option value="שכירות">{__t("שכירות")}</option>
                  <option value="דרישת תשלום">{__t("דרישת תשלום")}</option>
                  <option value="חיוב חריג">{__t("חיוב חריג")}</option>
                  <option value="פיטורים">{__t("פיטורים")}</option>
                  <option value="דיני עבודה">{__t("דיני עבודה")}</option>
                  <option value="תביעה/כתב תביעה">{__t("תביעה/כתב תביעה")}</option>
                  <option value="ירושה/צוואה">{__t("ירושה/צוואה")}</option>
                  <option value="נזיקין/תאונה">{__t("נזיקין/תאונה")}</option>
                  <option value="אחר">{__t("אחר")}</option>
                </select>
              </label>

              <label className="legal-field">{__t("סוג המסמך")}<select name="documentType" value={legalForm.documentType} onChange={handleLegalFormChange}>
                  <option value="הסכם">{__t("הסכם")}</option>
                  <option value="דרישה">{__t("דרישה")}</option>
                  <option value="תביעה">{__t("תביעה")}</option>
                  <option value="הודעה">{__t("הודעה")}</option>
                  <option value="מסמך פנימי">{__t("מסמך פנימי")}</option>
                </select>
              </label>

              <label className="legal-field">{__t("סוג הבדיקה")}<select name="requestType" value={legalForm.requestType} onChange={handleLegalFormChange}>
                  <option value="בדיקת חיוב חריג">{__t("בדיקת חיוב חריג")}</option>
                  <option value="בדיקת חוזה והתחייבות">{__t("בדיקת חוזה והתחייבות")}</option>
                  <option value="בדיקת תביעה">{__t("בדיקת תביעה")}</option>
                  <option value="בדיקה מול מאגרים ממשלתיים">{__t("בדיקה מול מאגרים ממשלתיים")}</option>
                </select>
              </label>

              <label className="legal-field">{__t("סכום בסה\"כ")}<input
                  type="number"
                  name="amount"
                  value={legalForm.amount}
                  onChange={handleLegalFormChange}
                  placeholder="0"
                />
              </label>

              <label className="legal-field">{__t("רשות/משרד רלוונטי")}<select name="authority" value={legalForm.authority} onChange={handleLegalFormChange}>
                  <option value="משרד הכלכלה">{__t("משרד הכלכלה")}</option>
                  <option value="משרד המשפטים">{__t("משרד המשפטים")}</option>
                  <option value="רשות התחרות">{__t("רשות התחרות")}</option>
                  <option value="משרד הפנים">{__t("משרד הפנים")}</option>
                  <option value="אחר">{__t("אחר")}</option>
                </select>
              </label>

              <label className="legal-field">{__t("תחום/אזור")}<select name="jurisdiction" value={legalForm.jurisdiction} onChange={handleLegalFormChange}>
                  <option value="ישראל">{__t("ישראל")}</option>
                  <option value="תל אביב">{__t("תל אביב")}</option>
                  <option value="ירושלים">{__t("ירושלים")}</option>
                  <option value="חיפה">{__t("חיפה")}</option>
                  <option value="אחר">{__t("אחר")}</option>
                </select>
              </label>
            </div>

            <label className="legal-field">{__t("תיאור המקרה, החיוב או המסמך")}<textarea
                rows={5}
                name="summary"
                value={legalForm.summary}
                onChange={handleLegalFormChange}
                placeholder={__t("פרטים על החיוב, חוזה, תביעה, דרישה, מסמכים או אירוע אחר")}
              />
            </label>

            <button type="submit" className="primary-btn submit-btn">{__t("בדוק מול חוקים, תקנות, פסיקה ומאגרי מידע")}</button>

            {legalReview && (
              <div className="review-result legal-result" aria-live="polite">
                <div className="risk-badge">{legalReview.status}</div>
                <h3>{__t("תוצאה ראשונית")}</h3>
                <p>{legalReview.summary}</p>
                <div className="legal-check-panel">
                  <div>
                    <strong>{__t("בדיקות משפטיות")}</strong>
                    <ul>
                      {legalReview.checks.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <strong>{__t("טפסים/בקשות מומלצים")}</strong>
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
          <div className="section-header"><p className="eyebrow">{__t("הגנת הפרטיות")}</p><h2>{__t("מדיניות פרטיות והודעת איסוף מידע")}</h2></div>
          <div className="legal-body">
            <p><strong>{__t("בעל השליטה במידע:")}</strong>{" " + __t(
              "משרד עורכי דין מוחמד מ. קבהא (מ.ר 67912) («המשרד»). כתובת: בסמ״ה, רח' אלבוח'ארי 95, מיקוד 3002300. פרטי התקשרות: info@my-attorney.net · 052-661-1866."
            )}</p>
            <p><strong>{__t("מטרות השימוש:")}</strong>{" " + __t(
              "המידע נאסף לצורך ביצוע מיון ובדיקה ראשונית, מתן שירות משפטי וטיפול בעניין, יצירת קשר וניהול ההתקשרות בלבד, בהתאם לסעיף 11 לחוק הגנת הפרטיות, התשמ״א-1981 ולתיקון 13 לחוק."
            )}</p>
            <p><strong>{__t("סוגי מידע:")}</strong>{" " + __t(
              "פרטי זיהוי והתקשרות, מסמכים ונתונים שתמסרו לצורך הבדיקה, ומידע טכני בסיסי. מסירת המידע תלויה בהסכמתכם; אינכם חייבים למסור מידע, אך ללא מידע מסוים לא נוכל לספק את השירות."
            )}</p>
            <p><strong>{__t("העברה לצדדים שלישיים:")}</strong>{" " + __t(
              "לצורך הפעלת השירות אנו נעזרים בספקי עיבוד (אחסון בענן, מנוע ניתוח/‏AI, מערכת ניהול לקוחות וסליקת תשלומים). ייתכן עיבוד או אחסון מחוץ לישראל, בכפוף להוראות הדין. איננו מוכרים מידע ואיננו מעבירים אותו לצד שלישי שלא לצורך השירות, למעט כנדרש על פי דין."
            )}</p>
            <p><strong>{__t("שמירה ומחיקה:")}</strong>{" " + __t(
              "מידע שלא הבשיל לתיק פעיל יימחק לאחר זמן סביר. מידע בתיקי לקוח יישמר לפי חובות הדין וכללי לשכת עורכי הדין."
            )}</p>
            <p><strong>{__t("זכות עיון ותיקון:")}</strong>{" " + __t(
              "לפי סעיפים 13–14 לחוק, אתם רשאים לעיין במידע שלכם ולבקש את תיקונו או מחיקתו, בפנייה ל-info@my-attorney.net."
            )}</p>
            <p><strong>{__t("אבטחת מידע:")}</strong>{" " + __t("אנו נוקטים אמצעים לאבטחת המידע (הצפנה בתעבורה, הרשאות והגבלת גישה).") + " "}<strong>{__t("אנא הימנעו מהעלאת מסמכים או פרטים של צד שלישי שאינם נחוצים לבדיקה.")}</strong></p>
            <p><strong>{__t("הסכמה:")}</strong>{" " + __t("השימוש בכלים והעלאת מסמכים מהווים הסכמה למדיניות זו.")}</p>
          </div>
        </section>

        <section id="terms" className="section legal-section">
          <div className="section-header"><p className="eyebrow">{__t("תנאי שימוש")}</p><h2>{__t("תקנון ותנאי שימוש")}</h2></div>
          <div className="legal-body">
            <p><strong>{__t("מהות השירות:")}</strong>{" " + __t(
              "האתר מפעיל מערכת קליטה ומיון ראשוני בפיקוח המשרד. המידע והכלים אינם ייעוץ משפטי ואינם התחייבות לתוצאה. יחסי עורך דין–לקוח נוצרים רק בהסכם התקשרות ושכר טרחה חתום ולאחר בדיקת ניגוד עניינים."
            )}</p>
            <p><strong>{__t("תמחור:")}</strong>{" " + __t(
              "בדיקת/החזר עיקול — ללא עלות; שכר טרחה מותנה הצלחה בשיעור 25% בתוספת מע״מ כדין, מכל סכום שיושב בפועל בלבד («ללא זכייה — אין תשלום»). הכנת טפסים ושליחתם — ₪190 לטופס בודד ו-₪490 לסט הוצאה לפועל (המחירים כוללים מע״מ, אלא אם צוין אחרת). אגרות והוצאות חיצוניות אינן כלולות."
            )}</p>
            <p><strong>{__t("«טופס מוכן» ו«שליחה אונליין»:")}</strong>{" " + __t(
              "הכנת טופס משפטי מותאם לפרטים שנמסרו והעברתו לגורם/יעד הרלוונטי. אין בכך ערובה לקבלת הבקשה על ידי הרשות; דחיית בקשה אינה מזכה בהחזר אוטומטי, אלא לפי מדיניות הביטול שלהלן."
            )}</p>
            <p><strong>{__t("ביטול עסקה (מכר מרחוק):")}</strong>{" " + __t(
              "בהתאם לחוק הגנת הצרכן, התשמ״א-1981 ותקנותיו, ניתן לבטל עסקה בכפוף לשלב הביצוע. שירות שבוצע או החל להתבצע לפי בקשת הלקוח עשוי שלא להיות ניתן לביטול/החזר בגין החלק שבוצע. לביטול: info@my-attorney.net."
            )}</p>
            <p><strong>{__t("שכר טרחה:")}</strong>{" " + __t(
              "יוסדר בהסכם חתום טרם תחילת הטיפול, בהפרדה בין שכר טרחה, מע״מ, אגרות והוצאות, ובכפוף לזכות לבחינת סבירות לפי חוק לשכת עורכי הדין. כספי לקוחות ינוהלו בנאמנות כדין."
            )}</p>
            <p><strong>{__t("דין וסמכות שיפוט:")}</strong>{" " + __t(
              "על השימוש יחולו דיני מדינת ישראל, וסמכות השיפוט הבלעדית לבתי המשפט המוסמכים בישראל."
            )}</p>
            <p>{__t(
              "המשרד: משרד עורכי דין מוחמד מ. קבהא, בסמ״ה, רח' אלבוח'ארי 95, מיקוד 3002300 · עוסק מורשה — עו״ד מוחמד קבהא, מ.ר 67912."
            )}</p>
          </div>
        </section>

        <section id="accessibility" className="section legal-section">
          <div className="section-header"><p className="eyebrow">{__t("נגישות")}</p><h2>{__t("הצהרת נגישות")}</h2></div>
          <div className="legal-body">
            <p>{__t(
              "המשרד רואה חשיבות רבה בהנגשת שירותיו לכלל הציבור, לרבות אנשים עם מוגבלות, ופועל למען עמידה בהוראות חוק שוויון זכויות לאנשים עם מוגבלות, התשנ״ח-1998, ותקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע״ג-2013."
            )}</p>
            <p>{__t(
              "האתר נבנה בשאיפה לעמידה בהמלצות התקן הישראלי ת״י 5568 (המבוסס על WCAG 2.0) ברמה AA: מבנה סמנטי, ניגודיות צבעים, ניווט במקלדת ותמיכה בקוראי מסך."
            )}</p>
            <p>{__t(
              "מצאתם קושי בנגישות או ליקוי? נשמח לתקן. רכז הנגישות: עו״ד מוחמד קבהא — info@my-attorney.net · 052-661-1866 · בסמ״ה, רח' אלבוח'ארי 95, מיקוד 3002300."
            )}</p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-copy">
          <p className="eyebrow">{__t("בואו נדבר")}</p>
          <h2>{__t("קביעת פגישה ראשונית ללא התחייבות")}</h2>
        </div>

        <div className="footer-actions">
          <a className="primary-btn" href="tel:+972526611866">{__t("התקשר עכשיו")}</a>
          <a className="secondary-btn" href="mailto:info@my-attorney.net">info@my-attorney.net</a>
        </div>

        <div className="footer-identity">
          <p><strong>{__t("משרד עורכי דין מוחמד מ. קבהא")}</strong>{" " + __t("· עורך הדין האחראי: עו״ד מוחמד קבהא, מ.ר 67912")}</p>
          <p>{__t(
            "כתובת: בסמ״ה, רח' אלבוח'ארי 95, מיקוד 3002300 · טלפון: 052-661-1866 · דוא״ל: info@my-attorney.net"
          )}</p>
          <p className="footer-mini">{__t(
            "האתר מופעל כמערכת קליטה ומיון בפיקוח משרד עורכי דין. המידע והכלים אינם מהווים ייעוץ משפטי ואינם תחליף לייעוץ פרטני. אין בשימוש באתר כדי ליצור יחסי עורך דין–לקוח, אשר ייווצרו רק בהסכם התקשרות חתום."
          )}</p>
          <nav className="footer-legal">
            <a href="/madrich-ikul.html">{__t("מדריך: גבייה ביתר")}</a>
            <a href="/ikul-cheshbon-bank.html">{__t("עיקול חשבון בנק")}</a>
            <a href="/ikul-mascoret.html">{__t("עיקול משכורת")}</a>
            <a href="/ikul-bituach-leumi.html">{__t("עיקול ביטוח לאומי")}</a>
            <a href="/ikul-rechev.html">{__t("עיקול רכב")}</a>
            <a href="/taanat-pareti.html">{__t("טענת פרעתי")}</a>
            <a href="/schomim-mugganim.html">{__t("סכומים מוגנים")}</a>
            <a href="#privacy">{__t("מדיניות פרטיות")}</a>
            <a href="#terms">{__t("תקנון ותנאי שימוש")}</a>
            <a href="#accessibility">{__t("הצהרת נגישות")}</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default App
