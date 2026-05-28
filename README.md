# AI Job Interview Trainer

AI Job Interview Trainer is a full-stack AI-powered application designed to help users prepare for technical and AI-related job interviews.

The platform allows users to practice interview questions, answer by voice or text, review answer history, and work with a structured question bank organized by topics.

The project focuses on realistic interview preparation workflows instead of simple chatbot conversations.

---

# Features

- AI-powered interview sessions
- Voice and text answer support
- Question bank with topic sorting
- Answer history tracking
- AI-generated interview feedback
- Exportable question collections
- Structured preparation workflow
- Designed for technical and AI consultant interview training

---

# Tech Stack

## Frontend
- Next.js
- React
- TypeScript
- TailwindCSS
- shadcn/ui

## Backend
- Next.js API Routes / Node.js
- Prisma ORM
- PostgreSQL

## AI Integration
- Llama models
- Groq API

---

# Installation

## 1. Clone repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd ai-job-interview-trainer
```

---

## 2. Install dependencies

Using pnpm:

```bash
pnpm install
```

Or npm:

```bash
npm install
```

---

## 3. Create environment file

Create:

```bash
.env.local
```

Example:

```env
DATABASE_URL=your_database_url
GROQ_API_KEY=your_groq_api_key
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
```

---

# Groq API Setup

1. Create an account at:
https://console.groq.com/

2. Generate an API key

3. Add the key into:

```env
GROQ_API_KEY=your_key
```

Without a valid API key, AI interview generation will not work.

---

# Database Setup

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

Optional: open Prisma Studio

```bash
npx prisma studio
```

---

# Running the Project

Start development server:

```bash
pnpm dev
```

or

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

# Recommended User Workflow

1. Register or log in
2. Configure AI API key if required
3. Select interview topic
4. Start interview session
5. Answer questions using:
   - text
   - voice input
6. Review answer history
7. Repeat weak topics regularly

---

# Project Structure

```txt
app/                → Next.js routes
components/         → reusable UI
features/           → business features
lib/                → utilities and helpers
prisma/             → database schema
public/             → static files
```

---

# Current Focus

The current development focus is:
- improving AI feedback quality
- better interview evaluation
- stronger AI consultant interview flows
- multilingual support
- advanced session analytics

---

# Future Improvements

- Speech-to-text improvements
- AI scoring system
- Personalized interview plans
- Recruiter simulation mode
- Soft skills interview mode
- PWA mobile experience

---

# Author

Built as a practical AI + Full-Stack portfolio project focused on real-world interview preparation workflows.