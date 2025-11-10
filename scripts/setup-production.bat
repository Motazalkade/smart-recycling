@echo off
echo === إعداد موقع إعادة التدوير الذكي للإنتاج ===

echo تثبيت dependencies...
call scripts\setup.bat

echo بناء الواجهة الأمامية...
cd frontend
npm run build
cd ..

echo نسخ ملفات البناء...
if exist "backend\public" rmdir /s /q "backend\public"
mkdir backend\public
xcopy "frontend\dist\*" "backend\public\" /E /I /Y

echo إعداد الخادم للإنتاج...
copy "backend\.env" "backend\.env.production"

echo.
echo تم الإعداد للإنتاج بنجاح!
echo لتشغيل التطبيق: cd backend && npm start
echo.
pause