# 🇩🇪 DaF Lesson Builder & AI Exam Generator

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/Prisma-6.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma ORM" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Google%20Gemini-Generative%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini AI" />
  <img src="https://img.shields.io/badge/License-MIT-F7DF1E?style=for-the-badge" alt="MIT License" />
</p>

> **An enterprise-grade pedagogical platform and deterministic CEFR exam generation engine for German language educators (DaF), test-prep institutions, and examination boards.**  
> Enforces **Master Blueprints** for **Goethe-Zertifikat**, **telc**, **ÖSD**, and **TestDaF** across levels **A1 to C2** and **TDN 3 to 5**.

---

## 📑 Table of Contents

- [The Core Problem & Architecture](#-the-core-problem--architecture)
- [System Pipeline Flow](#-system-pipeline-flow)
- [Official Blueprint Coverage Matrix](#-official-blueprint-coverage-matrix)
- [Key Features](#-key-features)
- [Screenshots & UI Previews](#-screenshots--ui-previews)
- [Tech Stack Breakdown](#-tech-stack-breakdown)
- [Project Directory Structure](#-project-directory-structure)
- [System & Browser Requirements](#-system--browser-requirements)
- [Installation & Quickstart](#-installation--quickstart)
- [Environment Variables (.env)](#-environment-variables-env)
- [REST API Endpoints](#-rest-api-endpoints)
- [Super Admin Credentials](#-super-admin-credentials)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)
- [Production Deployment](#-production-deployment)
- [License](#-license)

---

## 💡 The Core Problem & Architecture

Standard LLM text generation prompts fail when applied to accredited European language certifications (CEFR). When asked to *"create a B1 German test"*, generative models routinely hallucinate non-existent sections, invent inaccurate question counts, alter point scales, and violate test duration guidelines.

**DaF Lesson Builder solves this by treating test specifications as System Law:**
- **Deterministic Skeletons:** Blueprint engines dictate the exact number of parts (*Teile*), item counts, durations, and answer mechanics.
- **Content-Only Generation:** The AI operates exclusively as a text copywriter, generating German passages, questions, distractors, and model answers within locked structural parameters.
- **Quality Gates:** A multi-tier validation gate intercepts every AI payload, verifying schema compliance, answer consistency, item counts, and CEFR grading rubrics before rendering.

---

## 🔄 System Pipeline Flow

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        1. MASTER BLUEPRINTS                            │
│   Hardcoded parameters: Provider, Level, Skill, Teil, Item Count,      │
│   Duration, Scoring Rubrics, Generation Rules                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        2. EXAM SKELETON ENGINE                         │
│   Constructs deterministic task contracts & strict field whitelists    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        3. DACH-CONTEXT CASE ENGINE                     │
│   Discovers real-world scenarios in Germany, Austria, and Switzerland  │
│   with SHA-256 semantic fingerprinting to prevent repetition           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        4. CONTENT SYNTHESIS (GEMINI)                   │
│   Generates passages, audio transcripts, items, and answer keys        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        5. 6-LAYER EXAM VALIDATOR                       │
│   Validates: Structure • Item Counts • Distractors • Correct Answers   │
│   • CEFR Rubrics • Auto-healing of alternate field names               │
│                 ┌─────────────────┴─────────────────┐                  │
│                 ▼                                   ▼                  │
│              [PASS]                              [FAIL]                │
│                 │                                   │                  │
│                 │                           Retry / Repair (max 3)     │
└─────────────────┼──────────────────────────────────────────────────────┘
                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   6. DUAL-MODE WORKSHEET RENDERING                     │
│   Teacher worksheet (with answer keys) / Student blank answer sheet    │
└────────────────────────────────────────────────────────────────────────┘
📊 Official Blueprint Coverage Matrix
The engine provides 24 official blueprints:
Provider	Level	Skills Included	Total Parts (Teile)	Total Items	Duration
Goethe-Zertifikat	A1	Lesen, Hören, Schreiben, Sprechen	11	35 items + 2 tasks	80 min
Goethe-Zertifikat	A2	Lesen, Hören, Schreiben, Sprechen	13	40 items + 2 tasks	105 min
Goethe-Zertifikat	B1	Lesen, Hören, Schreiben, Sprechen	15	60 items + 6 tasks	180 min
Goethe-Zertifikat	B2	Lesen, Hören, Schreiben, Sprechen	13	60 items + 4 tasks	195 min
Goethe-Zertifikat	C1	Lesen, Hören, Schreiben, Sprechen	12	60 items + 4 tasks	215 min
Goethe-Zertifikat	C2	Lesen, Hören, Schreiben, Sprechen	11	60 items + 4 tasks	220 min
telc Deutsch	A1	Lesen, Hören, Schreiben, Sprechen	11	30 items + 2 tasks	60 min
telc Deutsch	A2	Lesen, Hören, Schreiben, Sprechen	10	30 items + 1 task	80 min
telc Deutsch	B1	Lesen, Sprachbausteine, Hören, Schreiben, Sprechen	12	60 items + 1 letter	165 min
telc Deutsch	B2	Lesen, Sprachbausteine, Hören, Schreiben, Sprechen	12	60 items + 1 letter	165 min
telc Deutsch	C1	Lesen, Sprachbausteine, Hören, Schreiben, Sprechen	11	55 items + 1 task	180 min
telc Deutsch	C2	Lesen, Sprachbausteine, Hören, Schreiben, Sprechen	11	55 items + 1 task	180 min
ÖSD	A1	Lesen, Hören, Schreiben, Sprechen	11	30 items + 2 tasks	80 min
ÖSD	A2	Lesen, Hören, Schreiben, Sprechen	8	25 items + 1 task	95 min
ÖSD	B1	Lesen, Hören, Schreiben, Sprechen	15	60 items + 6 tasks	180 min
ÖSD	B2	Lesen, Hören, Schreiben, Sprechen	11	40 items + 2 tasks	150 min
ÖSD	C1	Lesen, Hören, Schreiben, Sprechen	10	40 items + 2 tasks	170 min
ÖSD	C2	Lesen, Hören, Schreiben, Sprechen	11	40 items + 2 tasks	190 min
TestDaF (Paper)	TDN 3/4/5	Lesen, Hören, Schreiben, Sprechen	14	55 items + 8 tasks	155 min
TestDaF (Digital)	TDN 3/4/5	Lesen, Hören, Schreiben, Sprechen	23	64 items + 9 tasks	150 min
✨ Key Features
1. 🎯 Examination Generator
Skills On-Demand: Generate single-skill modules (e.g., Reading only, Writing only, Listening only, Grammar only) or complete consolidated exams (Full Mock Test).
Format Integrity: telc-only Sprachbausteine are automatically locked and hidden for Goethe, ÖSD, and TestDaF.
Audio Synthesizer: Includes authentic German audio tracks generated via SpeechSynthesis with variable playback speeds (0.8x, 0.9x real-test, 1.0x standard).
2. 🎙️ Virtual Oral Exam Room (Mündliche Prüfung)
Voice-first examination room running natively in the browser.
Real-time transcription captures spoken German and sends it to the AI proctor.
Generates official Kandidatenblätter (candidate prompt sheets) with structured Leitpunkte.
Official CEFR Rubric Scoring: 25 points across 4 criteria (Total: 100 points, Pass threshold: 60) with error corrections highlighting grammar, pronunciation, and vocabulary mistakes.
3. 📋 Drag-and-Drop Lesson Planner (Kanban Workflow)
Assemble complete lesson plans using specialized pedagogical cards: Warm-up (Einstieg), Vocabulary (Wortschatz), Grammar (Grammatik), Speaking (Sprechen), Listening (Hören), Reading (Lesen), Writing (Schreiben), Interactive Quizzes, Flashcards.
Smart time budgeting with real-time feedback on curriculum pace.
TipTap ProseMirror Rich-Text Editor with German umlaut hotkeys (ä, ö, ü, ß) and color-coding for articles (der - blue, die - red, das - green).
4. 📚 Smart Textbook & PDF Ingestion Engine
Automated TOC Detection: Upload multi-page textbook PDFs; AI identifies chapter titles, themes, and page ranges.
Deep Lexical Parsing: Converts reading pages into tabular vocabulary with articles, plurals, translations, and contextual examples.
Client-side PDF page slicer for extracting targeted lesson chapters without server upload overhead.
5. 🖨️ Dual-Mode Worksheet Export
Teacher View: Includes answer keys, listening transcripts, and instructional guidance.
Student View: Automatically hides answers, formatting exercises with clean blank response fields.
One-click print-ready DIN A4 PDF generation and Microsoft Word (.doc) export.
📸 Screenshots & UI Previews
Master Blueprint Exam Generator	Virtual Oral Exam Room
(Select skills, certificates, and CEFR levels)	(Real-time voice simulation with live transcription)
Kanban Lesson Planner	Dual-Mode Worksheet Preview
(Drag-and-drop pedagogical blocks)	(Student view with clean blank answer sheets)
🛠️ Tech Stack Breakdown
Frontend
Framework: React 18, TypeScript, Vite
Styling: Tailwind CSS (Dark/Light mode support)
Component Primitives: Lucide React Icons
Drag & Drop: @dnd-kit/core, @dnd-kit/sortable
Rich Text Engine: TipTap Editor (ProseMirror based)
State Management: Zustand with client-side persistence
Speech Engine: Web Speech API (SpeechRecognition + SpeechSynthesisUtterance)
Backend
Runtime: Node.js 18+, Express.js, TypeScript
Database & ORM: Prisma ORM, MySQL (compatible with PostgreSQL/SQLite)
AI Integration: Google Generative AI SDK (@google/generative-ai), Google AI File Manager
File & PDF Processing: pdf-lib, multer
Security & Auth: JSON Web Tokens (Access + Refresh tokens), Bcrypt password hashing, Nodemailer
📂 Project Directory Structure
code
Text
GIAOAN_V2/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema (User, Lesson, Block, Book, CaseMemory)
│   │   └── seed.ts                   # Initial textbook dataset
│   ├── src/
│   │   ├── common/
│   │   │   ├── base.repository.ts    # Generic CRUD repository
│   │   │   └── prisma.ts             # Prisma singleton instance
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts    # JWT verification & role authorization
│   │   ├── modules/
│   │   │   ├── admin/                # Admin management, users, and textbook curriculum
│   │   │   ├── ai/
│   │   │   │   ├── ai.controller.ts  # AI endpoints
│   │   │   │   ├── ai.routes.ts      # AI route declarations
│   │   │   │   ├── ai.service.ts     # Core LLM prompt orchestration & fallback pool
│   │   │   │   ├── caseEngine.ts     # DACH scenario discovery & semantic hashing
│   │   │   │   ├── examBlueprintEngine.ts # Skeleton builder & contract resolver
│   │   │   │   ├── examBlueprints.ts # 24 official master exam blueprints
│   │   │   │   ├── examSchema.ts     # Blueprint TypeScript interfaces
│   │   │   │   └── examValidator.ts  # 6-layer exam validation & auto-healing
│   │   │   ├── auth/                 # Authentication, OTP registration & recovery
│   │   │   ├── book/                 # Textbook ingestion APIs
│   │   │   └── lesson/               # Lesson plan builder & autosave persistence
│   │   └── index.ts                  # Express server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── activities/           # Pedagogical block components (Wortschatz, Lesen...)
│   │   │   ├── admin/                # Admin Portal Dashboard
│   │   │   ├── Builder/              # Kanban Drag-and-Drop Canvas & BlockItem
│   │   │   ├── Editor/               # TipTap Editor with German syntax highlighting
│   │   │   ├── layout/               # Header, Sidebar, QuickToolbar
│   │   │   ├── modals/               # Exam generator, oral simulator, PDF scanner modals
│   │   │   └── preview/              # DocumentPreview (Student & Teacher worksheets)
│   │   ├── services/                 # API Client, AI Service, Export Service
│   │   ├── store/                    # Zustand stores (useLessonStore, useAuthStore)
│   │   ├── types/                    # Frontend TypeScript interfaces
│   │   ├── App.tsx                   # Main application layout
│   │   └── main.tsx                  # React entry point
│   ├── package.json
│   └── vite.config.ts
└── README.md
💻 System & Browser Requirements
Supported Browsers: Google Chrome or Microsoft Edge (required for native Web Speech API recognition).
Microphone Access: Ensure microphone permissions are granted for the oral exam simulator.
Operating System TTS Voices: Install native German voice packages (e.g., German - Stefan/Katja/Google Deutsch) in Windows or macOS settings for audio playback.
🚀 Installation & Quickstart
1. Clone Repository
code
Bash
git clone https://github.com/ShibaTatsuya0905/daf-lesson-builder.git
cd daf-lesson-builder
2. Backend Setup & Database Migration
Navigate to the backend directory and install dependencies:
code
Bash
cd backend
npm install
Configure your environment variables by creating .env (See the Environment Variables section below). Generate the Prisma Client and migrate your database:
code
Bash
npx prisma generate
npx prisma db push
(Optional) Seed sample textbook curriculum:
code
Bash
npx tsx prisma/seed.ts
Start the backend development server:
code
Bash
npx tsx src/index.ts
The backend will boot at http://localhost:3000.
3. Frontend Setup
Open a new terminal and enter the frontend directory:
code
Bash
cd frontend
npm install
Start the Vite development server:
code
Bash
npm run dev
The application interface will be live at http://localhost:5173.
🔐 Environment Variables (.env)
Create a .env file in the backend/ directory with the following variables:
code
Env
# Server Port
PORT=3000

# Database Connection String (MySQL example)
DATABASE_URL="mysql://root:password@localhost:3306/daf_lesson_builder"

# JWT Authentication Secrets
JWT_ACCESS_SECRET="your_jwt_access_secret_here"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your_jwt_refresh_secret_here"
JWT_REFRESH_EXPIRES_IN="7d"

# Google Gemini API Key (Obtain from https://aistudio.google.com/)
GEMINI_API_KEY="AIzaSy...your_gemini_api_key..."

# Optional: SMTP Configuration for OTP password resets
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Default Super Admin account credentials (auto-created on initial run)
ADMIN_EMAIL="admin@daf.de"
ADMIN_PASSWORD="Admin@DaF#2026_SecureKey!"
📡 REST API Endpoints
Method	Endpoint	Description	Auth Required
POST	/api/auth/register-with-otp	Register teacher account with OTP	No
POST	/api/auth/login	Login and receive access/refresh tokens	No
POST	/api/auth/refresh	Refresh expired access tokens	No
GET	/api/auth/me	Fetch authenticated user profile	Yes
POST	/api/ai/generate-exam	Generate certified CEFR exam from Blueprint	Optional
POST	/api/ai/simulate-speaking	Interactive turn-by-turn oral exam dialogue	Optional
POST	/api/ai/scan-document	Deep-scan PDF documents for lesson blocks	Optional
POST	/api/ai/slice-pdf	Extract specific page ranges from a PDF	No
GET	/api/lessons	List saved lesson plans	Yes
POST	/api/lessons	Create and save a new lesson plan	Yes
PUT	/api/lessons/:id	Update an existing lesson plan	Yes
GET	/api/admin/books	List official textbook curricula	Admin Only
POST	/api/admin/books/detect-toc	Auto-detect TOC from textbook PDF	Admin Only
POST	/api/admin/books/auto-ingest	Auto-ingest textbook lesson pages	Admin Only
👑 Super Admin Credentials
The backend automatically seeds a default Super Administrator account on its initial run:
Email: admin@daf.de
Password: Admin@DaF#2026_SecureKey!
Log in with this account to open the Admin Dashboard, manage registered instructors, adjust curriculum metadata, and batch-ingest textbooks.
❓ Troubleshooting & FAQs
1. "AI Engine: Quota Exceeded (429 Too Many Requests)"
Cause: Google Gemini Free Tier limits requests to 15 RPM (Requests Per Minute) and 1,500 RPD (Requests Per Day).
Solution: The built-in executeWithFallback mechanism automatically applies exponential backoff (1.5s, 3s, 6s) and falls back to alternate models in the pool (gemini-flash-lite-latest). If quota persists, wait 60 seconds or use an API key with tier-1 billing.
2. "The provided value for the column is too long: context" (Prisma Error P2000)
Cause: MySQL defaults Prisma String fields to VARCHAR(191), which can be exceeded by detailed C1/C2 context descriptions.
Solution: The AI service automatically truncates strings using .slice(0, 190) as a defensive measure. To store full-length texts in production, add @db.Text to the context, roles, and options fields in backend/prisma/schema.prisma and run npx prisma db push.
3. Speech Recognition not picking up audio
Cause: Browser permissions are blocked, or an unsupported browser is in use.
Solution: Ensure you are using Google Chrome or Microsoft Edge, grant microphone access, and verify that your system input device is working correctly.
📦 Production Deployment
To compile and bundle both services for production:
code
Bash
# Build Backend
cd backend
npm run build

# Build Frontend
cd ../frontend
npm run build
Production-optimized client assets will be emitted to frontend/dist/.
📄 License
This project is licensed under the terms of the MIT License.
Copyright (c) 2026 ShibaTatsuya0905. All rights reserved.
You are free to use, modify, distribute, and integrate this software into both non-profit and commercial educational platforms.
