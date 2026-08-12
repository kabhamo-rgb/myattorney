# MyAttorney / קו-הדין — פלטפורמה משפטית מאוחדת

איחוד של שתי הגרסאות למערכת אחת:

- **גרסה A** (גיבוי 2026-07-29) — *אזור צוות / Back-office*: ניהול פניות (לידים), יומן ומועדים, דיונים ומוכנות תיק, משימות, התחברות צוות עם קוד והרשאות, הגדרות משרד, יומן פעילות, ייצוא CSV.
- **גרסה B** (גיבוי 2026-08-12) — *אתר ופורטל לקוח*: אתר שיווקי, פורטל לקוח אישי, העלאת מסמכים ובדיקה מיידית, הפקת סט טפסים, שליחה למשרד.

שתי הגרסאות חולקות עכשיו **Backend אחד**, **יומן פעילות אחד**, ו**מאגר נתונים אחד** — כך שטופס "צור קשר" באתר יוצר פנייה שמופיעה מיד בצנרת הפניות של הצוות.

## מבנה
```
myattorney-unified/
├─ app/            Frontend — React 19 + TypeScript + Vite
│  └─ src/
│     ├─ App.tsx        אתר ציבורי + פורטל לקוח (גרסה B)
│     ├─ Backoffice.tsx אזור צוות (גרסה A)  ← נטען בכתובת #staff
│     └─ main.tsx       ניתוב בין אתר לאזור צוות
├─ server/         Backend — Node + Express (REST API + מגיש את האתר הבנוי)
│  ├─ index.js
│  └─ data/        אחסון JSON (נזרע אוטומטית מנתוני 29/07)
├─ Dockerfile      דימוי יחיד לפריסה
├─ render.yaml     פריסה ל-Render (Node + דיסק מתמיד)
└─ package.json
```

## שלוש נקודות כניסה
| כתובת | מי | מה |
|-------|----|----|
| `/` | מבקרים/לקוחות | אתר שיווקי + פורטל לקוח + טופס יצירת קשר |
| `/?client=oren#portal` | לקוח | פורטל אישי (מסמכים, טפסים, יומן) |
| `/#staff` | צוות המשרד | אזור ניהול (לידים, יומן, דיונים, משימות, הגדרות) |

**כניסת צוות (ברירת מחדל לפיתוח):** `admin` / `1234` — **חובה להחליף לפני עלייה לאוויר** (ראו "אבטחה").

## הרצה מקומית
```bash
# חלון 1 — Backend
npm --prefix server install
npm --prefix server start        # http://localhost:4000

# חלון 2 — Frontend (dev, עם proxy ל-API)
npm --prefix app install
npm --prefix app run dev         # http://localhost:5173
```

## בנייה + הרצת פרודקשן (שירות יחיד)
```bash
npm --prefix app install && npm --prefix app run build   # בונה app/dist
npm --prefix server install
node server/index.js             # מגיש גם את האתר וגם את ה-API על פורט אחד
# → http://localhost:4000
```

## פריסה אונליין
המערכת דורשת סביבה שמריצה **Node.js** ומאפשרת **אחסון קבצים מתמיד** (לא אחסון סטטי בלבד).

**אפשרות 1 — Render / Railway / Fly (מומלץ, הכי פשוט):**
דחיפת התיקייה ל-GitHub → יצירת Web Service מסוג Node → הקובץ `render.yaml` כבר מוכן (כולל דיסק מתמיד ו-healthcheck). לאחר מכן מפנים את הדומיין שרכשת (`my-attorney.net`) ל-CNAME של השירות.

**אפשרות 2 — Docker (VPS / כל ענן):**
```bash
docker build -t myattorney .
docker run -d -p 80:4000 \
  -v myattorney_data:/app/server/data \
  -v myattorney_uploads:/app/server/uploads \
  --name myattorney myattorney
```

**אפשרות 3 — VPS עם PM2:**
```bash
npm --prefix app install && npm --prefix app run build
npm --prefix server install
pm2 start server/index.js --name myattorney
# מציבים Nginx כ-reverse proxy ל-127.0.0.1:4000 + תעודת SSL (certbot)
```

> אחסון שיתופי/cPanel זול שמריץ רק PHP/סטטי **לא** יריץ את השרת. אם זה מה שרכשת — אפשר לפצל: אתר סטטי אצלו + השרת ב-Render, ולכוון את `VITE_API_BASE_URL` לכתובת השרת בזמן ה-build.

## אבטחה — לפני עלייה לאוויר
1. **החלף את קוד ה-PIN של admin**: ערוך `server/data/staff-users.json` — השדה `pinHash` הוא Base64 של הקוד. למשל קוד `7391` → `echo -n 7391 | base64` → `NzM5MQ==`.
2. הוסף עוד משתמשי צוות באותו קובץ (role: `admin` או `lawyer`).
3. הגדר `PORT` וכל משתני סביבה דרך הסביבה, לא בקוד.
4. ודא HTTPS (הפלטפורמות לעיל מספקות תעודה אוטומטית).

## API עיקרי
ציבורי: `POST /api/leads`, `GET /api/documents/:profileId`, `POST /api/documents`, `POST /api/dispatches`, `GET /health`
צוות (דורש `Authorization: Bearer <token>`): `POST /api/staff/login`, `GET/PATCH/DELETE /api/leads`, `GET/POST/PATCH/DELETE /api/events|hearings|tasks`, `GET/PUT /api/settings`, `GET /api/audit`, `GET /api/reports/leads.csv`
