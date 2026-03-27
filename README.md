# DeepGuard - Deepfake Detection System 🛡️

DeepGuard is an advanced forensic tool designed to detect deepfakes, voice clones, and AI-generated media to protect digital identity.

## 🚀 Features

- **Multimodal Analysis:** Scans videos, audio, and images for AI manipulation.
- **Neural Pattern Detection:** Analyzes visual artifacts (blinking, skin texture) and audio biometrics (frequency mismatch).
- **Forensic Dashboard:** Detailed reports with confidence scores and reasoning.
- **Full-Stack Architecture:** React frontend with an Express backend ready for Python integration.

## 🛠️ Tech Stack

- **Frontend:** React 19, Tailwind CSS, Motion, Lucide Icons.
- **Backend:** Node.js (Express), TypeScript.
- **AI Engine:** Google Gemini API (Multimodal) & Python (OpenCV).

## 📂 Project Structure

- `src/`: React frontend components and services.
- `server.ts`: Express server handling API requests and Vite middleware.
- `detector.py`: Python script for local forensic analysis using OpenCV.
- `metadata.json`: Application metadata and permissions.

## 🚦 Getting Started

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd deepguard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env` file and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

## 🛡️ Security & Privacy

DeepGuard is built with privacy in mind. All analysis is performed using secure neural layers, and no data is stored without user consent.

---
*Developed for Digital Identity Protection.*
