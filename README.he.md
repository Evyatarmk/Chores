# 🧹 CHORES – אפליקציה לניהול מטלות הבית

**CHORES** היא אפליקציית React Native שנועדה לעזור למשפחות ולשותפים לדירה לנהל את משימות היום־יום בצורה מסודרת ויעילה. האפליקציה כוללת ניהול משימות, אירועים בלוח שנה, רשימות מותאמות, צ'אט בזמן אמת, אזור אישי ושיתוף יומי בסטורי.

## 🚀 תכונות עיקריות

- ✅ **ניהול משימות** – יצירת משימות, עריכתן וסימון כהושלמו.
- 📅 **לוח שנה לאירועים** – ניהול אירועים אישיים ומשפחתיים.
- 📝 **רשימות מותאמות** – לדוגמה: קניות, תכנון שבועי ועוד.
- 💬 **צ'אט בזמן אמת** – שיחה בין בני הבית באמצעות Firebase.
- 📸 **סטורי** – שיתוף תמונות ועדכונים יומיים עם בני הבית.
- 👤 **אזור אישי** – ניהול פרופיל משתמש אישי.
- 🛡 **אימות והרשאות** – כניסה מאובטחת עם JWT.
- 🗃 **Entity Framework Core** – לטיפול יעיל במידע בצד השרת.

## 🛠 טכנולוגיות בשימוש

- **React Native (באמצעות Expo)**
- **Firebase (Realtime Database ו־Storage)**
- **.NET Core עם Entity Framework**
- **JWT (JSON Web Tokens)**

## 📷 תמונות מסך

### 🔐 מסך התחברות

![Login Screen](screenshots/login.png)

---

### 🧾 משימות ואירועים בלוח שנה

![Tasks Screen](screenshots/tasks.png)

---

### 🏠 מסך הבית

![Home Screen 1](screenshots/home1.png)  
![Home Screen 2](screenshots/home2.png)

---

### 📋 מסך רשימות

![Lists Screen](screenshots/lists.png)

---

## 🏁 איך מריצים את האפליקציה

כדי להריץ את האפליקציה מקומית:

```bash
git clone https://github.com/Evyatarmk/Chores.git
cd Chores
npm install
npx expo start --tunnel
