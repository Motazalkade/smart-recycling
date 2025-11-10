@echo off
echo === تشغيل موقع إعادة التدوير الذكي في وضع التطوير ===

echo تثبيت dependencies إذا لم تكن مثبتة...
if not exist "backend\node_modules" (
  echo تثبيت dependencies للBackend...
  cd backend && npm install && cd ..
)

if not exist "frontend\node_modules" (
  echo تثبيت dependencies للFrontend...
  cd frontend && npm install && cd ..
)

echo تشغيل التطبيق...
start cmd /k "cd backend && npm run dev"
timeout /t 3
start cmd /k "cd frontend && npm run serve"

echo.
echo تم تشغيل التطبيق بنجاح!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:8080
echo.
pause