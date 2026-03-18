
# محفظة QTBM - التميز المالي الرقمي (QTBM Wallet)

تطبيق محفظة رقمية متطور مبني باستخدام Next.js 15 و Firebase. تم تحسين هذا المشروع ليعمل كتطبيق أندرويد أصلي (APK).

## 🚀 دليل بناء وتصدير ملف APK النهائي

بعد الانتهاء من البرمجة، اتبع هذه الخطوات في الـ **Terminal** للحصول على التطبيق:

### الخطوة 1: تجهيز الملفات (تجميع المشروع)
```bash
# بناء نسخة الويب الثابتة ومزامنتها مع مجلد الأندرويد
npm run apk:prepare
```

### الخطوة 2: إنشاء ملف APK (عبر Command Line)
لإنشاء نسخة تجريبية (Debug APK) مباشرة:
```bash
# للأنظمة الشبيهة بـ Linux/Mac
cd android && ./gradlew assembleDebug

# لأنظمة Windows (PowerShell)
cd android; .\gradlew assembleDebug
```
*ستجد ملف الـ APK الناتج في المجلد: `android/app/build/outputs/apk/debug/app-debug.apk`*

### الخطوة 3: (اختياري) عبر Android Studio
إذا كنت تفضل استخدام الواجهة الرسومية:
1. افتح **Android Studio**.
2. اختر **Open Project** وحدد مجلد `android` الموجود في هذا المشروع.
3. من القائمة العلوية اختر: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.

---
تم التطوير بواسطة **فريق QTBM الرقمي**.
