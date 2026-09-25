# 🧠 Synapse Study - Medical Education Platform

**Synapse Study** is a modern, high-performance web application designed for medical students to master complex preclinical and clinical subjects like **Immunology**, **Microbiology**, **Pathology**, **Physiology**, **Pharmacology**, **Surgery**, and **Final Part 2 Medicine** through interactive digital flashcards, clinical summary dashboards, active recall drilling, and timed practice exams.

> 🌐 **Live Deployments**:
> - Production: [https://synapsestudykkl.vercel.app/](https://synapsestudykkl.vercel.app/)
> - Mirror (Cloudflare Pages): [https://synapse-study-kkl.pages.dev/](https://synapse-study-kkl.pages.dev/)

---

## ✨ Key Features

### 📇 1. Interactive Medical Flashcards (1,070+ Cards)
- **3D Card Flip Animation**: Hardware-accelerated CSS 3D perspective flips for question stems and answers.
- **Categorized Modules**: Comprehensive coverage across **Microbiology**, **Immunology**, **Pathophysiology**, and **Final Part 2 Medicine: Endocrinology**.
- **Bookmark & Mastery System**: Mark cards as **💚 Know (Mastered)** or **📌 Needs Review** with real-time counters and filter tabs.
- **Cloud & LocalStorage Sync**: Student progress syncs seamlessly with Supabase backend and persists offline.
- **LaTeX Math & Chemical Equations**: Rendered with KaTeX (e.g. $\text{Ca}^{2+}$, $\text{Na}^+/\text{K}^+ \text{-ATPase}$, $> 11 \text{ mmol/L}$).
- **Keyboard Shortcuts**: Arrow keys (`←` / `→`) to navigate, `Space` / `Enter` to flip.

### 📊 2. Universal Clinical Dashboards
- **Dense Clinical Cards Grid**: High-density disease, pathogen, and pharmacotherapy cards designed for rapid clinical reference.
- **Multi-Module Support**:
  - **Immunology Database** (39 clinical entities)
  - **Microbiology Database** (48 pathogen profiles)
  - **Final Part 2 - Endocrinology Database** (20 high-yield clinical entities & management protocols)
- **Glassmorphism Toolbar**: Instant filtering by Subject Module, Main Category, and Sub-Category.

### 🎯 3. Timed Practice Exam & Quiz Simulation
- **5 Comprehensive Exam Modules**: 160 board-style clinical MCQs with 5 distinct choices (`A` through `E`) and textbook-grounded rationales.
  - Pathophysiology - Dehydration & Fluid Balance (30 Qs)
  - Endocrine System - Module 1 (30 Qs)
  - Endocrine System - Module 2 (40 Qs)
  - Final Part 2 Medicine - Endocrinology (30 Qs)
  - Physiology Interactive Practice Exam (30 Qs)
- **Student Full Name Input**: Required student identification for verifiable screenshot submissions.
- **Dynamic Question Count & Sub-Topic Filtering**: Select 5, 10, 20, or All questions, filtered by sub-topic.
- **Allocated Countdown Timer**: 2 minutes per question with audio/visual alerts and auto-submit on time expiry.
- **Verified Score Certificate**:
  - Displays Student Name, Score %, Correct Count, Time Taken, and Verification Timestamp.
  - **📸 Save Certificate Image (PNG)**: 1-click 2x Retina high-resolution PNG download via `html-to-image`.
  - **📋 Copy Image to Clipboard**: Direct image copy for clinical submissions or study groups.

### 📖 4. Definitions & Short Questions (SQ) Active Recall
- **Medical Terminology Drill**: High-yield clinical definitions and short-essay questions.
- **Speed-Drill Active Recall Mode**: Test knowledge with self-test mask/reveal triggers.
- **🔊 Native Audio Pronunciation**: 1-click medical pronunciation powered by the Web Speech Synthesis API.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core**: React 19, Vite 8, Tailwind CSS v4 (`@tailwindcss/postcss`).
- **Backend & Auth**: Supabase (PostgreSQL, Row Level Security, Auth BaaS), Edge Reverse Proxy.
- **Icons & Graphics**: Lucide React.
- **Math & Chemistry**: KaTeX (`katex`).
- **Export & Canvas**: `html-to-image`.
- **Offline & PWA Resilience**: Stale-While-Revalidate Service Worker (`sw.js`).
- **Automated Data Pipeline**: Custom Node.js ES module parser ([`update.js`](update.js)) supporting CSV and Excel files.
- **CI/CD & Hosting**: Vercel Serverless & Cloudflare Pages dual deployment.

---

## 📂 Project Structure

```text
├── dashboard_excel_files/      # Source CSV/Excel files for Dashboards
├── flash_cards_excel_files/    # Source CSV/Excel files for Flashcards (1,070+ cards)
├── quiz_excel_files/           # Source Excel practice exams (160 MCQs)
├── src/
│   ├── components/
│   │   ├── flashcards/         # FlashcardView, Flashcard, FilterBar, CardControls
│   │   ├── dashboard/          # DashboardView, DashboardToolbar, PathogenDetailGrid
│   │   ├── quiz/               # QuizView, QuizSetup, QuizCard, QuizResult
│   │   ├── definitions/        # DefinitionView, DefinitionCard, SpeedDrill
│   │   ├── Header.jsx          # Top Navigation Bar with active tab states
│   │   └── KatexText.jsx       # KaTeX formula renderer
│   ├── context/                # AuthContext (Supabase authentication state machine)
│   ├── lib/                    # Supabase client & Edge proxy configuration
│   ├── data/                   # Generated JSON databases (data.json, dashboards_data.json, quizzes_data.json)
│   ├── App.jsx                 # Main application view manager
│   └── index.css               # Tailwind CSS v4 configuration & theme variables
├── public/
│   ├── _redirects              # Cloudflare Pages SPA & Supabase proxy rewrites
│   └── sw.js                   # Offline caching Service Worker
├── vercel.json                 # Vercel Edge proxy rewrites & CORS headers
├── update.js                   # Node.js automated ingestion script for CSV/Excel data
└── package.json
```

---

## 🚀 Getting Started

### 1. Installation & Local Development

```bash
# Clone repository
git clone https://github.com/KhantKyawLin/synapse_study_kkl.git
cd synapse_study_kkl

# Install dependencies
npm install

# Run local development server
npm run dev
```

### 2. Production Build

```bash
npm run build
```

---

## 🤖 Data Ingestion

To add new flashcards, dashboards, or quizzes:
1. Drop your `.csv` or `.xlsx` files into the corresponding directory (`flash_cards_excel_files/`, `dashboard_excel_files/`, or `quiz_excel_files/`).
2. Run the update script:
   ```bash
   node update.js
   ```
3. Commit and push to GitHub — both Vercel and Cloudflare Pages will automatically redeploy the updated content live!

---

## 📄 License
Developed by **[Khant Kyaw Lin](https://github.com/KhantKyawLin)**. Designed for medical students and healthcare educators.
