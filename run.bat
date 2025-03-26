@echo off
echo 🚀 Starting the services...

:: Start backend setup
cd backend
echo 📦 Installing backend dependencies...
start cmd /k "npm install"
cd ..

:: Start frontend setup
cd frontend
echo 📦 Installing frontend dependencies...
start cmd /k "npm install"

echo ⏳ Waiting for 4 minutes before starting the backend server...
timeout /t 150 /nobreak

echo 🌐 Starting frontend development server...
start cmd /k "npm run start"

cd ..
cd backend

echo ⚙️ Starting backend server...
start /b cmd /k "node server.js"




echo ✅ Both frontend and backend are running!
pause
