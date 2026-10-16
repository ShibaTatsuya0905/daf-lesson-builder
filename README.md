# 🇩🇪 DaF Lesson Builder & AI Exam Generator

> An AI-powered lesson planning and German exam generation platform built for DaF educators.

## 📖 Overview

DaF Lesson Builder combines AI-assisted lesson planning, structured German examination generation, interactive speaking practice, and textbook processing in one web application.

The platform is designed around a key principle: AI generates educational content, while application-defined blueprints and validation rules control the examination structure.

Rather than relying on unrestricted text generation, the system uses predefined examination specifications, structured data contracts, and validation stages to reduce inconsistent questions, incorrect item counts, and malformed exam content.

### Supported examination providers

| Provider | Levels / Results | Examination skills |
| :--- | :---: | :--- |
| **Goethe-Zertifikat** | A1–C2 | Lesen, Hören, Schreiben, Sprechen |
| **telc Deutsch** | A1–C2 | Lesen, Hören, Schreiben, Sprechen, Sprachbausteine where applicable |
| **ÖSD** | A1–C2 | Lesen, Hören, Schreiben, Sprechen |
| **TestDaF** | TDN 3–5 | Lesen, Hören, Schreiben, Sprechen |

> **Important:** Examination formats vary by certificate, level, and delivery mode. The application's blueprints should be checked against current official specifications before being described as fully official or certification-compliant.

---

## 📑 Table of Contents

- [Core Architecture](#core-architecture)
- [Generation Pipeline](#generation-pipeline)
- [Blueprint Coverage](#blueprint-coverage)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [API Reference](#api-reference)
- [Administrator Account](#administrator-account)
- [Troubleshooting](#troubleshooting)
- [Production Build](#production-build)
- [License](#license)

---

## 🏗️ Core Architecture

### The problem
Large language models can generate convincing educational content, but they may also invent examination sections, change question counts, produce inconsistent answer keys, or ignore level-specific requirements.

DaF Lesson Builder addresses these challenges through a structured generation pipeline.

| Component | Responsibility |
| :--- | :--- |
| **Master Blueprints** | Define examination structure, task types, item counts, timing, and scoring rules |
| **Exam Skeleton Engine** | Creates a structured exam template before AI generation |
| **DACH Case Engine** | Develops contextual scenarios based on everyday life, education, and work in Germany, Austria, and Switzerland |
| **AI Content Synthesis** | Generates passages, questions, distractors, transcripts, and sample answers |
| **Exam Validator** | Checks schema compliance, question counts, answer consistency, and configured grading rules |
| **Worksheet Renderer** | Produces teacher and student versions of examination materials |

### Design principles
- **Structure before generation:** Create the examination skeleton before requesting content from the AI.
- **Controlled AI output:** Restrict generated content to explicitly permitted fields.
- **Validation before rendering:** Reject or repair invalid output before displaying the final examination.
- **Contextual diversity:** Use scenario metadata and fingerprints to reduce repetitive case generation.
- **Separation of concerns:** Keep examination rules, AI orchestration, persistence, and user-interface rendering in separate modules.

---

## 🔄 Generation Pipeline

```mermaid
flowchart TD
    A["Master Examination Blueprints"] --> B["Exam Skeleton Engine"]
    B --> C["DACH Case Engine"]
    C --> D["Gemini Content Generation"]
    D --> E["Exam Validation"]
    E --> F{"Validation Result"}
    F -->|Pass| G["Worksheet Rendering"]
    F -->|Fail| H["Retry or Repair"]
    H --> D
    G --> I["Teacher Version"]
    G --> J["Student Version"]

    classDef input fill:#dbeafe,stroke:#2563eb,color:#1e3a8a
    classDef process fill:#f3e8ff,stroke:#9333ea,color:#581c87
    classDef success fill:#dcfce7,stroke:#16a34a,color:#14532d
    classDef retry fill:#ffedd5,stroke:#ea580c,color:#9a3412

    class A input
    class B,C,D,E process
    class G,I,J success
    class H retry
The validation and repair process uses configurable retry limits. Successful output is rendered into teacher-facing and student-facing worksheets.
📊 Blueprint Coverage
The current project documentation describes 24 master blueprint configurations.
Provider	Level / Mode	Skills	Documented duration
Goethe-Zertifikat	A1	Lesen, Hören, Schreiben, Sprechen	80 min
Goethe-Zertifikat	A2	Lesen, Hören, Schreiben, Sprechen	105 min
Goethe-Zertifikat	B1	Lesen, Hören, Schreiben, Sprechen	180 min
Goethe-Zertifikat	B2	Lesen, Hören, Schreiben, Sprechen	195 min
Goethe-Zertifikat	C1	Lesen, Hören, Schreiben, Sprechen	215 min
Goethe-Zertifikat	C2	Lesen, Hören, Schreiben, Sprechen	220 min
telc Deutsch	A1	Lesen, Hören, Schreiben, Sprechen	60 min
telc Deutsch	A2	Lesen, Hören, Schreiben, Sprechen	80 min
telc Deutsch	B1	Lesen, Sprachbausteine, Hören, Schreiben, Sprechen	165 min
telc Deutsch	B2	Lesen, Sprachbausteine, Hören, Schreiben, Sprechen	165 min
telc Deutsch	C1	Lesen, Sprachbausteine, Hören, Schreiben, Sprechen	180 min
telc Deutsch	C2	Lesen, Sprachbausteine, Hören, Schreiben, Sprechen	180 min
ÖSD	A1	Lesen, Hören, Schreiben, Sprechen	80 min
ÖSD	A2	Lesen, Hören, Schreiben, Sprechen	95 min
ÖSD	B1	Lesen, Hören, Schreiben, Sprechen	180 min
ÖSD	B2	Lesen, Hören, Schreiben, Sprechen	150 min
ÖSD	C1	Lesen, Hören, Schreiben, Sprechen	170 min
ÖSD	C2	Lesen, Hören, Schreiben, Sprechen	190 min
TestDaF	Paper-based	Lesen, Hören, Schreiben, Sprechen	155 min
TestDaF	Digital	Lesen, Hören, Schreiben, Sprechen	150 min
The TestDaF configurations support result targets TDN 3, TDN 4, and TDN 5.
Coverage note: The table summarizes the configurations described by the project. Exact task counts, timing, scoring, and the number of distinct blueprint records should be verified against examBlueprints.ts and the current examination specifications.
✨ Key Features
1. AI Examination Generator
Generate individual skill modules or complete mock examinations.
Select a provider, level, skill, and examination mode.
Generate reading passages, listening transcripts, questions, distractors, and answer keys.
Support configured grammar-focused exercises and telc Sprachbausteine.
Validate generated output against the selected blueprint.
Render student worksheets without answer keys and teacher worksheets with solutions.
2. Virtual Oral Examination Room
Practice German speaking through an interactive browser-based examination experience.
Capture spoken responses using the Web Speech API where supported.
Transcribe speech and integrate it into the configured AI conversation workflow.
Generate candidate prompt sheets with structured Leitpunkte.
Provide rubric-based feedback on grammar, vocabulary, and other configured assessment criteria.
Support iterative speaking practice.
Note: Browser speech recognition and speech synthesis depend on browser support, operating-system voices, and microphone permissions. Automated feedback should be treated as practice assistance rather than an official examination result.
3. Drag-and-Drop Lesson Planner
Build structured German lessons through a visual Kanban-style workflow. Available pedagogical blocks include:
Einstieg and warm-up activities
Wortschatz and vocabulary practice
Grammatik exercises
Lesen and Hören activities
Schreiben and Sprechen tasks
Interactive quizzes and flashcards
Additional capabilities include lesson time budgeting, rich-text editing, and German-character support for ä, ö, ü, and ß.
4. Textbook and PDF Processing
Turn textbook material into reusable lesson resources.
Detect table-of-contents entries and chapter page ranges.
Extract relevant PDF page ranges.
Analyze reading passages and vocabulary.
Organize extracted vocabulary with articles, plurals, translations, and contextual examples.
Integrate extracted material into lesson-planning workflows.
5. Worksheet Export
Prepare classroom-ready examination materials.
Mode	Contents
Teacher	Questions, answer keys, listening transcripts, and configured instructional guidance
Student	Questions and blank response fields without teacher-only solutions
The application includes print-oriented A4 layouts and document export functionality, subject to the implemented export service.
🛠️ Technology Stack
Frontend
Technology	Purpose
React 18	Component-based user interface
TypeScript 5	Static typing
Vite 5	Development server and build tooling
Tailwind CSS 3	Responsive styling and theme support
Zustand	Client-side state management
Lucide React	Interface icons
@dnd-kit	Drag-and-drop lesson planning
TipTap / ProseMirror	Rich-text editing
Web Speech API	Browser speech recognition and synthesis
Backend
Technology	Purpose
Node.js 18+	JavaScript runtime
Express.js 4	REST API
TypeScript	Backend type safety
Prisma ORM 6	Database access and schema management
MySQL	Relational persistence
Google Generative AI SDK	AI content generation
pdf-lib	PDF processing
Multer	File upload handling
JSON Web Tokens	Authentication
bcrypt	Password hashing
Nodemailer	Email delivery for configured authentication workflows
Database compatibility: MySQL is the documented setup. PostgreSQL and SQLite require compatible Prisma configuration, schema adjustments, and migration testing before they can be considered supported.
📂 Project Structure
code
Text
GIAOAN_V2/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── common/
│   │   │   ├── base.repository.ts
│   │   │   └── prisma.ts
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts
│   │   ├── modules/
│   │   │   ├── admin/
│   │   │   ├── ai/
│   │   │   │   ├── ai.controller.ts
│   │   │   │   ├── ai.routes.ts
│   │   │   │   ├── ai.service.ts
│   │   │   │   ├── caseEngine.ts
│   │   │   │   ├── examBlueprintEngine.ts
│   │   │   │   ├── examBlueprints.ts
│   │   │   │   ├── examSchema.ts
│   │   │   │   └── examValidator.ts
│   │   │   ├── auth/
│   │   │   ├── book/
│   │   │   └── lesson/
│   │   └── index.ts
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── activities/
│   │   │   ├── admin/
│   │   │   ├── Builder/
│   │   │   ├── Editor/
│   │   │   ├── layout/
│   │   │   ├── modals/
│   │   │   └── preview/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   └── images/
└── README.md
💻 Requirements
Before installation, ensure the following tools are available:
Node.js 18 or later
npm
MySQL server
Google Gemini API key
Git
For speaking simulation, use a compatible version of Google Chrome or Microsoft Edge and grant microphone permission when prompted.
🚀 Installation
1. Clone the repository
code
Bash
git clone https://github.com/ShibaTatsuya0905/daf-lesson-builder.git
cd daf-lesson-builder
2. Configure the backend
code
Bash
cd backend
npm install
Create a .env file in the backend/ directory using the configuration described below.
Create the database in MySQL, then generate Prisma Client and synchronize the schema:
code
Bash
npx prisma generate
npx prisma db push
If the project includes the optional seed script:
code
Bash
npx tsx prisma/seed.ts
Start the backend using the development command configured by the project:
code
Bash
npx tsx src/index.ts
Expected local API address: http://localhost:3000
3. Start the frontend
Open a second terminal:
code
Bash
cd frontend
npm install
npm run dev
Open the Vite development URL shown in the terminal, typically: http://localhost:5173
Setup note: These commands assume the existing project scripts, dependencies, database schema, and environment configuration match the repository. If a command differs from your package.json, follow the scripts actually defined in the project.
🔐 Environment Configuration
Create backend/.env:
code
Env
# Server
PORT=3000

# MySQL
DATABASE_URL="mysql://root:password@localhost:3306/daf_lesson_builder"

# JWT authentication
JWT_ACCESS_SECRET="replace_with_a_long_random_secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="replace_with_another_long_random_secret"
JWT_REFRESH_EXPIRES_IN="7d"

# Google Gemini
GEMINI_API_KEY="your_gemini_api_key"

# Optional SMTP configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-email-app-password"

# Optional initial administrator configuration
ADMIN_EMAIL="admin@daf.de"
ADMIN_PASSWORD="replace_with_a_unique_strong_password"
Security recommendations
Never commit .env files, API keys, SMTP credentials, or production secrets.
Keep .env.example populated with placeholder values only.
Generate unique, unpredictable JWT secrets.
Change any default administrator password immediately.
Ensure administrator initialization is safe to run repeatedly.
Do not expose private API keys in frontend environment variables.
📡 API Reference
The following endpoints describe the documented API surface. Verify request schemas, response payloads, and middleware configuration in the backend before integrating external clients.
Method	Endpoint	Description
POST	/api/auth/register-with-otp	Register a teacher account using OTP
POST	/api/auth/login	Authenticate and obtain tokens
POST	/api/auth/refresh	Refresh an access token
GET	/api/auth/me	Retrieve the authenticated user profile
POST	/api/ai/generate-exam	Generate examination content
POST	/api/ai/simulate-speaking	Run an interactive speaking session
POST	/api/ai/scan-document	Analyze a document for lesson resources
POST	/api/ai/slice-pdf	Extract a PDF page range
GET	/api/lessons	Retrieve saved lesson plans
POST	/api/lessons	Create a lesson plan
PUT	/api/lessons/:id	Update a lesson plan
GET	/api/admin/books	Retrieve textbook curriculum data
POST	/api/admin/books/detect-toc	Detect textbook table-of-contents entries
POST	/api/admin/books/auto-ingest	Process textbook material
Authentication and authorization requirements should be confirmed in the corresponding route and middleware definitions.
👑 Administrator Account
If the backend implements automatic administrator seeding, configure the initial administrator through environment variables or the project's documented initialization process.
For security, this README does not publish a reusable default administrator password. If you are deploying a fresh instance:
Set a unique administrator email and password.
Confirm that the initialization process creates the account as expected.
Sign in and verify access to administrator functions.
Rotate credentials before exposing the application to other users.
Disable public access to any setup-only administrative mechanism.
❓ Troubleshooting
Gemini quota errors
Symptom: The AI service returns HTTP 429 or reports quota exhaustion.
Possible causes:
Requests exceed the current model or project quota.
The selected model is unavailable under the active API plan.
Billing, request limits, or daily quotas restrict generation.
Recommended checks:
Review the quota and usage information for your Google AI project.
Confirm that the selected model is available to your API key.
Use bounded exponential backoff for temporary rate limits.
Fall back only to models supported by the configured API and account.
Return a clear error if every configured model fails.
Retries cannot overcome an exhausted quota by themselves.
Prisma error P2000
Symptom: A value exceeds the supported length of a database column.
Recommended checks:
Inspect the affected field in schema.prisma.
Use an appropriate text column for long passages and contextual descriptions.
Generate the updated Prisma Client.
Apply and verify the database schema changes.
For MySQL, a field may use a mapping such as: context String? @db.Text
Only apply this mapping to fields whose actual data requirements justify it.
Speech recognition does not work
Possible causes:
Microphone access is blocked.
The browser does not support the required recognition API.
The selected input device is unavailable.
The operating system lacks an appropriate German speech or text-to-speech voice.
Recommended checks:
Open the application in a supported browser.
Grant microphone permission.
Verify the selected input device.
Test the browser's speech recognition and synthesis support.
Check German language and voice settings.
📦 Production Build
Build the backend using the script defined in backend/package.json:
code
Bash
cd backend
npm run build
Build the frontend:
code
Bash
cd ../frontend
npm run build
The frontend production bundle is typically emitted to: frontend/dist/
Note: Before deploying, verify the production database connection, environment variables, authentication configuration, CORS policy, upload limits, and AI quota handling. Do not use the development server as a production hosting strategy.
📄 License
This project is distributed under the MIT License.
See the LICENSE file for the complete terms.
Copyright © 2026 ShibaTatsuya0905.