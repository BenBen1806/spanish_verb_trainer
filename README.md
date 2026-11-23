# Spanish Verb Trainer | מאמן פעלים בספרדית

![Spanish Flag](https://img.shields.io/badge/Language-Spanish-FFC400?style=for-the-badge&logo=spain&logoColor=C60B1E)
![Hebrew UI](https://img.shields.io/badge/UI-Hebrew-blue?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge)

An interactive, responsive web application designed to help Hebrew speakers master Spanish verb conjugations across various tenses and pronouns.

## 🚀 Features

- **Practice Mode**: Dynamic quizzes that prompt you to conjugate verbs based on a specific tense and subject. Includes real-time feedback and contextual example sentences.
- **Verb Library**: A searchable database of common Spanish verbs with full conjugation tables for all supported tenses.
- **Weak Verbs (SRS)**: An adaptive learning system that tracks your mistakes and identifies "Weak Verbs" for targeted practice sessions.
- **7 Grammatical Tenses**:
  - Presente (הווה)
  - Pretérito Indefinido (עבר פשוט)
  - Pretérito Perfecto (עבר מורכב)
  - Pretérito Imperfecto (עבר תיאורי)
  - Futuro Simple (עתיד פשוט)
  - Presente de Subjuntivo (סובחונטיבו)
  - Imperativo (ציווי)
- **Virtual Accent Keyboard**: Quick-access buttons for Spanish special characters (á, é, í, ó, ú, ñ, ¡, ¿).
- **Text-to-Speech (TTS)**: Hear the pronunciation of verbs and example sentences in a natural Spanish accent.
- **Dark Mode Support**: Seamlessly switch between light and dark themes.
- **Progress Tracking**: Monitor your streak, accuracy, and total practiced verbs.

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (via CDN)
- **Icons**: [Font Awesome](https://fontawesome.com/)
- **Data Persistence**: `LocalStorage` (stores your SRS progress and preferences)
- **Manifest**: PWA-ready with `manifest.json`

## 📂 File Structure

- `index.html`: The main UI structure and layout.
- `app.js`: Application logic, state management, and SRS algorithms.
- `verbs.json`: The central database containing verb metadata and conjugation rules.
- `manifest.json`: PWA configuration for mobile/desktop installation.

## 🚦 Getting Started

### Prerequisites
Since the app fetches data from `verbs.json` using the Fetch API, it must be run through a web server to avoid CORS issues.

### Running Locally
1. Clone or download the project repository.
2. Open the folder in your preferred IDE (e.g., VS Code).
3. Use a local server extension like **Live Server** (VS Code) to launch the `index.html`.
4. Alternatively, if you have Python installed, run:
   ```bash
   python -m http.server 8000
   ```
   Then navigate to `http://localhost:8000` in your browser.

---

# גרסה בעברית

![שפת ממשק](https://img.shields.io/badge/ממשק-עברית-blue?style=for-the-badge)
![ספרדית](https://img.shields.io/badge/שפה-ספרדית-FFC400?style=for-the-badge&logo=spain&logoColor=C60B1E)
![PWA](https://img.shields.io/badge/PWA-מוכן-orange?style=for-the-badge)

אפליקציית רשת אינטראקטיבית ורספונסיבית המיועדת לדוברי עברית, הלומדים ומתרגלים נטיות פעלים בספרדית במגוון זמנים וגופים.

## 🚀 תכונות מרכזיות

- **מצב תרגול (Practice Mode)**: שאלונים דינמיים המבקשים להטות פעלים לפי זמן וגוף דיקדוקי. כולל משוב מיידי, משפטי דוגמה והקשר.
- **ספריית פעלים (Verb Library)**: מאגר פעלים בר חיפוש הכולל טבלאות נטייה מלאות לכל הזמנים הנתמכים.
- **פעלים חלשים (מערכת SRS)**: אלגוריתם חכם לסירוגין (Spaced Repetition System) העוקב אחר טעויות ומזהה פעלים שדורשים תרגול ממוקד.
- **7 זמנים דקדוקיים**:
  - **Presente** (הווה)
  - **Pretérito Indefinido** (עבר פשוט / מוגדר)
  - **Pretérito Perfecto** (עבר מורכב)
  - **Pretérito Imperfecto** (עבר תיאורי)
  - **Futuro Simple** (עתיד פשוט)
  - **Presente de Subjuntivo** (סובחונטיבו / דרך התלוי)
  - **Imperativo** (ציווי)
- **מקלדת תווים מיוחדים**: מקשים מהירים להקלדת תווים וסימנים בספרדית (`á`, `é`, `í`, `ó`, `ú`, `ñ`, `¡`, `¿`).
- **הקראת שמע (TTS)**: שמיעת ההגייה הנכונה של הפעלים ומשפטי הדוגמה במבטא ספרדי טבעי.
- **תמיכה במצב כהה (Dark Mode)**: מעבר נוח בין ערכות נושא בהירות וכהות.
- **מעקב מתקדם**: מעקב בזמן אמת אחר רצף תשובות נכונות (Streak), אחוזי דיוק ומספר הפעלים שתורגלו.

## 🛠️ טכנולוגיות

- **פרונטאנד**: HTML5, CSS3, JavaScript (ES6+)
- **עיצוב**: [Tailwind CSS](https://tailwindcss.com/) (באמצעות CDN)
- **אייקונים**: [Font Awesome](https://fontawesome.com/)
- **אחסון נתונים**: `LocalStorage` (שמירת התקדמות, העדפות ונתוני SRS בדפדפן)
- **אפליקציית רשת (PWA)**: תמיכה בהתקנה על מסך הבית באמצעות `manifest.json`

## 📂 מבנה הפרויקט

- `index.html`: המבנה והממשק הראשי של האפליקציה.
- `app.js`: לוגיקת האפליקציה, ניהול המצב ואלגוריתם ה-SRS.
- `verbs.json`: מאגר הנתונים של הפעלים וחוקי הנטייה.
- `manifest.json`: הגדרות PWA להתקנה במכשירים ניידים ושולחניים.

## 🚦 הוראות הרצה

### דרישות מוקדמות
יש להריץ את האפליקציה דרך שרת רשת מקומי (למניעת שגיאות CORS בטעינת ה-JSON).

### הרצה מקומית
1. הורד את הפרויקט ופתח אותו בעורך קוד.
2. השתמש ב-**Live Server** (ב-VS Code) או בשרת Python: `python -m http.server 8000`.
3. גלוש לכתובת המתאימה בדפדפן.

---
*Created for Spanish language learners | נוצר עבור לומדי ספרדית*

