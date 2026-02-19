#!/bin/zsh
# QureHealth AI - Start all services
ROOT="/Users/rahulchaudhary/Documents/QurehealthAI"

echo "🔄 Stopping old processes..."
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

echo "🚀 Starting Backend..."
cd "$ROOT/backend" && node server.js >> backend.log 2>&1 &

echo "🚀 Starting Patient Frontend..."
cd "$ROOT/patientFrontend" && npm run dev >> patient.log 2>&1 &

echo "🚀 Starting Doctor Frontend..."
cd "$ROOT/doctorFrontend" && npm run dev >> doctor.log 2>&1 &

echo "🚀 Starting Admin Frontend..."
cd "$ROOT/adminFrontend" && npm run dev >> admin.log 2>&1 &

echo "⏳ Waiting for services..."
sleep 6

echo ""
echo "✅ All services running:"
echo "   🌐 Landing Page  → http://localhost:5173"
echo "   👨‍⚕️ Doctor Panel  → http://localhost:5174"
echo "   🛡️  Admin Panel   → http://localhost:5175"
echo "   🔧 Backend API   → http://localhost:5001"
echo ""

open "http://localhost:5173/clear"
