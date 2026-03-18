
# محفظة QTBM - التميز المالي الرقمي (QTBM Wallet)

تطبيق محفظة رقمية متطور مبني باستخدام Next.js 15 و Firebase. تم تحسين هذا المشروع ليعمل كتطبيق أندرويد أصلي (APK).

## 🚀 دليل بناء وتصدير ملف APK النهائي

للحصول على ملف الـ APK، اتبع الخطوات التالية بالترتيب:

### الخطوة 1: تجهيز ملفات المشروع
يجب تشغيل هذا الأمر أولاً لتجميع كود الـ Next.js ومزامنتة مع مجلد الأندرويد:
```bash
npm run apk:prepare
```

### الخطوة 2: حل مشكلة SDK (في حال ظهور خطأ SDK Location not found)
إذا ظهر لك خطأ يطلب تحديد مسار الـ SDK، تأكد من أن ملف `android/local.properties` يحتوي على المسار الصحيح للـ Android SDK على جهازك. 
*   **في أنظمة Linux/Cloud:** عادة ما يكون `/home/user/Android/Sdk`.
*   **في أنظمة Windows:** عادة ما يكون `C:/Users/اسم_المستخدم/AppData/Local/Android/Sdk` (استخدم السلاش الأمامي `/`).

### الخطوة 3: بناء ملف الـ APK
لإنشاء نسخة تجريبية (Debug APK) مباشرة عبر الـ Terminal:
```bash
# لأنظمة Mac/Linux
cd android && ./gradlew assembleDebug

# لأنظمة Windows
cd android; .\gradlew assembleDebug
```
*ستجد ملف الـ APK الناتج في المجلد: `android/app/build/outputs/apk/debug/app-debug.apk`*

---
تم التطوير بواسطة **فريق QTBM الرقمي**.
