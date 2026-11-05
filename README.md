<<<<<<< HEAD
# ClassConnect 🎓
> **Connecting Students, Simplifying Campus Life.**

ClassConnect is a full-stack, AI-powered academic collaboration platform designed to unify students, faculty, and administrators in a single digital campus operating environment. Built with modern web standards, it integrates Google's Gemini API for personalized study assistance, real-time course community discussions, assignment tracking, a centralized resource repository, an intelligent teammate recommendation engine, and comprehensive administrative governance.

---

## 🌟 Highlights & Key Features

### 1. 🤖 AI Study Assistant (Google Gemini Powered)
* **Academic Tutor Chatbot:** Context-aware academic Q&A with markdown and code formatting.
* **Lecture & Note Summarizer:** Distills dense textbook excerpts or lecture notes into high-yield bullet points, executive summaries, or flashcard formats.
* **Interactive MCQ Quiz Generator:** Dynamically creates multiple-choice practice assessments with difficulty scaling, instant grading, celebratory confetti, and detailed answer explanations.
* **Concept Explainer:** Tailors explanations to three depth levels: **ELI5** (everyday analogies), **Intuitive** (undergraduate standard), or **Deep-Dive** (algorithmic & mathematical proofs).
* *Secure Architecture:* Backend API proxy ensures Google Gemini API keys are never exposed in frontend code.

### 2. 👥 User Roles & Access Control
* **Student:** Personalized timetable, assignment submission desk, attendance tracker, team matchmaking, and community forum.
* **Faculty:** Course management, assignment authoring, rubric-based submission evaluation, gradebook, and campus announcements.
* **Administrator:** Account governance (suspend/reactivate users), curriculum creation, faculty assignment, platform uptime monitoring, and audit log analysis.
* **1-Click Demo Persona Switcher:** Built-in fast toggle in the navigation bar to immediately preview the platform from the perspective of a Student (`Alex Rivera`), Faculty member (`Dr. Sarah Chen`), or Admin (`Prof. Robert Sterling`).

### 3. 💬 Class Community Discussions
* Subject-filtered discussion threads with upvoting, tags, and search.
* Peer-to-peer answers with **Faculty Verified / Accepted Answer** badges.
* Integrated question composer with course tagging.

### 4. 📝 Assignment Management & Gradebook
* **Students:** Deadlines calendar, submission status tracking (Pending, Submitted, Graded), file attachments, student notes, and celebration confetti upon submission.
* **Faculty:** Create assignments with deadlines, points, and instructions; grade student submissions with numerical scores and constructive feedback.

### 5. 📚 Centralized Resource Hub
* Courseware library organized by subject and document category (PDF Notes, Cheatsheets, Past Solved Papers, Lab Manuals).
* Searchable by keyword or uploader.
* Interactive download counter and instant document preview.
* Drag-and-drop contribution modal.

### 6. 🤝 Smart Team Finder
* AI-driven matching algorithm that pairs students based on complementary technical skills (React, Node, Python, PyTorch, Figma, Rust, Solidity).
* Real-time compatibility score calculation (e.g. 95% Match).
* Project recruitment board for Hackathons, Senior Capstones, and Research Sprints.
* 1-click invitations and team join workflows.

### 7. 📅 Academic Calendar & Attendance Tracker
* **Calendar:** View examination schedules, project milestones, guest seminars, and faculty office hours with quick event creation.
* **Attendance:** Subject-wise breakdown, institutional 75% threshold compliance check, "cushion" calculator, and interactive check-in simulator.

### 8. 🎨 Premium SaaS UI/UX
* Indigo, blue, and purple modern theme.
* Dark / Light mode toggle with persistent local state.
* Glassmorphic cards, responsive mobile drawer navigation, animated toast notifications, and global search bar with instant autocomplete.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6 |
| **Styling** | Tailwind CSS 3, Custom Glassmorphism, Google Fonts (Plus Jakarta Sans) |
| **Icons & UI** | Lucide React, Canvas Confetti |
| **Backend** | Node.js, Express.js, Multer, CORS, Dotenv |
| **Database** | Firebase Firestore (with persistent LocalStorage fallback) |
| **Authentication** | Firebase Authentication + Instant Demo Switcher |
| **File Storage** | Multer file engine / Firebase Storage ready |
| **AI Integration** | Google Gemini API (`gemini-1.5-flash`) via secure backend bridge |

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
* `npm` (v9.0.0 or higher)

### 1. Installation
Clone or navigate to the ClassConnect root directory and install all dependencies:

```bash
# Install root, client, and server dependencies in one command
npm run install:all
```

*(Alternatively, run `npm install` inside the root, `client`, and `server` folders.)*

---

### 2. Environment Variables Configuration

#### A. Backend Gemini AI Configuration (`server/.env`)
Create a file named `.env` inside the `server/` directory:

```env
PORT=5000
# (Optional) Add your Google Gemini API Key from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here
```

> **Note:** If `GEMINI_API_KEY` is left blank, ClassConnect automatically operates in its built-in **Intelligent Academic Engine Mode**, providing curated, realistic responses for all tutoring, summarization, quizzes, and explanations.

#### B. Frontend Firebase Configuration (`client/.env`)
Create a file named `.env` inside the `client/` directory:

```env
# Optional: Live Firebase Project Credentials
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Backend Proxy URL
VITE_API_URL=http://localhost:5000
```

> **Demo Mode vs Firebase:** If Firebase credentials are not provided, ClassConnect automatically runs in **Demo Mode with Persistent Local Storage**. All assignment submissions, new discussion posts, created courses, attendance logs, and teams are fully functional and persist across browser reloads!

---

### 3. Running the Application

You can start both the backend server and frontend client concurrently with a single command from the root directory:

```bash
npm run dev
```

* **Frontend Client:** [http://localhost:3000](http://localhost:3000)
* **Backend API:** [http://localhost:5000](http://localhost:5000)
* **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

*(To run them separately in distinct terminal tabs: `npm run server` and `npm run client`)*

---

## 🔑 Pre-Configured Demo Accounts

For immediate evaluation and demonstration, use the quick switcher in the top navigation bar or log in with these credentials:

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Student** | Alex Rivera | `alex.rivera@university.edu` | `password123` |
| **Faculty** | Dr. Sarah Chen | `sarah.chen@university.edu` | `password123` |
| **Admin** | Prof. Robert Sterling | `robert.sterling@university.edu` | `password123` |

---

## 📂 Project Structure

```
ClassConnect/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Global navigation, search, role switch, theme
│   │   │   ├── Sidebar.jsx         # Responsive sidebar with badges & mobile drawer
│   │   │   └── Footer.jsx          # Clean attribution & system indicators
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Firebase Auth + demo roles state
│   │   │   ├── DataContext.jsx     # Unified reactive persistence store
│   │   │   ├── NotificationContext.jsx # Toast manager & notification center
│   │   │   └── ThemeContext.jsx    # Dark/light mode sync
│   │   ├── data/
│   │   │   └── mockData.js         # Realistic academic seed dataset
│   │   ├── pages/
│   │   │   ├── StudentDashboard.jsx# Student overview, timetable, tasks, attendance
│   │   │   ├── FacultyDashboard.jsx# Faculty desk, submissions gradebook, notices
│   │   │   ├── AdminDashboard.jsx  # Account directory, courses, system logs
│   │   │   ├── Community.jsx       # Discussion forum, answers, tags, upvoting
│   │   │   ├── Assignments.jsx     # Student turn-in & faculty grading
│   │   │   ├── ResourceHub.jsx     # Searchable repository & uploads
│   │   │   ├── AIAssistant.jsx     # Gemini chatbot, summarizer, quiz, explainer
│   │   │   ├── SmartTeamFinder.jsx # Skill matchmaking & project recruitment
│   │   │   ├── CalendarPage.jsx    # Academic events & deadlines
│   │   │   ├── AttendancePage.jsx  # Compliance calculator & check-in
│   │   │   ├── ProfilePage.jsx     # User bio, skills, and links
│   │   │   ├── Login.jsx           # Sign in with 1-click demo buttons
│   │   │   ├── Register.jsx        # Account registration
│   │   │   └── ForgotPassword.jsx  # Password recovery flow
│   │   ├── services/
│   │   │   ├── aiService.js        # Backend API caller & offline fallbacks
│   │   │   └── firebase.js         # Firebase App/Auth/Firestore initialization
│   │   ├── App.jsx                 # Routing & layout configuration
│   │   ├── index.css               # Tailwind directives & glassmorphic styling
│   │   └── main.jsx                # React DOM entrypoint
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── src/
│   │   └── server.js               # Express API, Gemini bridge, Multer upload
│   ├── uploads/                    # Local storage directory for uploads
│   ├── .env.example
│   └── package.json
├── package.json                    # Root monorepo orchestration
└── README.md
```

---

## 🛡️ License & Academic Integrity
ClassConnect is developed for higher education innovation. Built with high cohesion, modularity, and accessibility standards.

=======
# Class_connect
>>>>>>> 8a95b048be5f2b67b8bab655e2fc2dfd8bd87be2
