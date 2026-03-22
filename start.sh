#!/bin/zsh
# Qurehealth AI - Start all services
ROOT="/Users/rahulchaudhary/Documents/QurehealthAI"

echo " Stopping old processes..."
pkill -9 -f "node server" 2>/dev/null
pkill -9 -f "vite" 2>/dev/null
pkill -9 -f "nodemon" 2>/dev/null
sleep 2

echo " Starting Backend..."
cd "$ROOT/backend" && nohup npm run dev > backend.log 2>&1 &

echo " Starting Patient Frontend..."
cd "$ROOT/patientFrontend" && nohup npm run dev > patient.log 2>&1 &

echo " Starting Doctor Frontend..."
cd "$ROOT/doctorFrontend" && nohup npm run dev > doctor.log 2>&1 &

echo " Starting Admin Frontend..."
cd "$ROOT/adminFrontend" && nohup npm run dev > admin.log 2>&1 &

echo "Waiting for services to start..."
sleep 8

echo ""
echo " All services running:"
echo "    Patient Portal → http://localhost:5173"
echo "    Doctor Panel   → http://localhost:5174"
echo "    Admin Panel    → http://localhost:5175"
echo "    Backend API    → http://localhost:5001"
echo ""

open "http://localhost:5173"
