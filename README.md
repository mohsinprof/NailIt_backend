# AI Interview Coach — Backend API

Node.js + Express REST API for an AI-powered interview preparation platform.
Parses resumes, calls Google Gemini to generate interview reports and resume
content, and renders PDFs on demand. Pairs with the frontend repo (`genai_frontend`).

## Features

- **Auth** — register/login with bcrypt + JWT stored in an httpOnly cookie,
  server-side token blacklist for logout, `get-me` session endpoint
- **AI interview reports** — extracts text from an uploaded resume PDF (pdf-parse)
  and generates a structured report with Gemini: match score, score reasoning,
  technical & behavioral questions, skill gaps, day-by-day preparation plan
- **Automatic report cap (low DB load)** — max **6 reports per user**; when a 7th is
  created, the oldest is deleted in the background (FIFO)
- **Tailored resume PDF** — regenerates a job-tailored resume PDF from any stored report
- **Fresh resume generator** — builds a professional resume PDF from form data,
  optionally merged with text extracted from an uploaded existing resume
- **Saved resumes library** — users store up to **3 resume PDFs** (binary in MongoDB,
  max 3 MB each), with list / download / replace / delete endpoints; ownership is
  enforced on every request

## Tech stack

Node.js · Express 5 · MongoDB (Mongoose) · JWT (httpOnly cookie) ·
Multer (memory storage) · pdf-parse · PDFKit · Google Gemini (`@google/genai`)

## Getting started

```bash
npm install
node server.js        # or: npm start  (nodemon available as a devDependency)
```

Create a `.env` file (never commit it — `.gitignore` already excludes it):

```
MONGO_URI=<your mongodb connection string>
JWT_SECRET=<random secret>
GOOGLE_GENAI_API_KEY=<gemini key for interview reports>
GEMINI_API_KEY=<gemini key for fresh resume generation>
```

## API overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/auth/register` | Create an account |
| POST   | `/api/auth/login` | Login (sets httpOnly cookie) |
| GET    | `/api/auth/logout` | Logout (blacklists the token) |
| GET    | `/api/auth/get-me` | Current user (private) |
| POST   | `/api/interview` | Generate an interview report (multipart: resume PDF + text fields) |
| GET    | `/api/interview` | List the user's reports (latest first, heavy fields excluded) |
| GET    | `/api/interview/:interviewId` | Get one report |
| DELETE | `/api/interview/:interviewId` | Delete a report (owner only) |
| GET    | `/api/interview/:interviewId/resume-pdf` | Download the job-tailored resume PDF |
| POST   | `/api/makeFreshResume/generate` | Generate a fresh resume PDF (form data and/or uploaded PDF) |
| POST   | `/api/saved-resumes` | Save a resume PDF (max 3; 409 `LIMIT_REACHED` when full) |
| GET    | `/api/saved-resumes` | List saved resumes (metadata only) |
| GET    | `/api/saved-resumes/:id/download` | Download a saved resume |
| POST   | `/api/saved-resumes/:id/replace` | Overwrite a saved slot with a new PDF |
| DELETE | `/api/saved-resumes/:id` | Delete a saved resume |

All non-auth endpoints require the auth cookie (verified by the `authuser` middleware)
and are scoped to `req.user.id`.

## Project structure

```
src/
├── app.js                       # express app + route mounting (isolated mount for savedResumes)
├── config/database.js           # mongoose connection
├── contoller/                   # request handlers (auth, interview, resumePdf, makeFreshResume)
├── helpers/enforceReportLimit.js# 6-report FIFO cap (isolated helper)
├── middleware/                  # auth (JWT) + file upload (multer, memory storage)
├── models/                      # User, InterviewReport, token blacklist
├── routes/                      # route tables per feature
├── savedResumes/                # ISOLATED FEATURE: model + controller + routes + own multer
└── services/                    # AI calls, PDF generators, pdf text extraction
```

## Design decisions

- **Isolated features & easy rollback** — the saved-resumes feature is fully
  self-contained (`src/savedResumes/`); its mount in `app.js` is wrapped in
  try/catch so a broken feature can never prevent the server from booting, and is
  marked with `=== SAVED RESUMES FEATURE ===` comment blocks for clean removal.
  See `TAILORED_RESUME_PDF_FEATURE.md` for the same pattern applied to the
  tailored-PDF feature.
- **Report cap for DB load** — reports are heavy documents (resume text + AI arrays),
  so `enforceReportLimit` trims users to their 6 newest reports, deleting only the
  `_id`s beyond the cap (`skip` + `lean`) and never blocking the HTTP response.
- **PDFs as bounded Buffers** — saved resumes are stored directly in MongoDB
  (3 MB multer limit keeps documents far below MongoDB's 16 MB cap), avoiding an
  external file store for a small, per-user library.
