import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitized}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// Helper for calling Gemini API
async function callGemini(prompt, systemInstruction = '') {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          ...(systemInstruction ? [{ text: `[System Instruction: ${systemInstruction}]\n\n` }] : []),
          { text: prompt },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API Error:', errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return text || 'No response generated.';
}

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ClassConnect API',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// File upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({
    success: true,
    file: {
      name: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimeType: req.file.mimetype,
      url: fileUrl,
    },
  });
});

// AI Chatbot with Two Possibilities (0 Default: Both, 1: Platform Guide, 2: Assignment Solver)
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history = [], subject = 'General Academic', mode = 0 } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are ClassConnect AI, the intelligent virtual study copilot and campus platform guide.

CRITICAL INSTRUCTION - ANSWER SPECIFICALLY WHAT THE STUDENT ASKS:
1. If the student has a DOUBT ABOUT THE WEBSITE / WEB PAGE (e.g. how to gave/submit an assignment, where to find notes, how to check attendance, timetable, team finder, or how to navigate ClassConnect):
   - Provide direct, clear, step-by-step instructions for using the ClassConnect web page.
   - Mention the relevant page route (e.g. /assignments, /resources, /attendance, /team-finder).
   - Tag with [ACTION:OPEN_ASSIGNMENTS] or relevant action tag.
   - Do NOT dump unrelated coding solutions or PyTorch implementations!

2. If the student asks for ASSIGNMENT HELP / ACADEMIC DOUBTS (e.g. how to solve coursework, write code, algorithms, math formulas, debugging, Transformer, Raft, Dijkstra):
   - Provide direct, step-by-step academic problem solving, code snippets with explanations, formulas, and verification steps.
   - Do NOT dump unrelated website navigation tutorials!

3. If the user explicitly asks for both or asks an open overview question ("What can you do?"), provide a concise summary of both capabilities.

Subject context: ${subject}. Use clean markdown, bullet points, and code blocks.`;

    let aiReply = null;
    try {
      aiReply = await callGemini(message, systemPrompt);
    } catch (err) {
      console.warn('Gemini call failed, falling back to smart local tutor:', err.message);
    }

    // Fallback response if Gemini API key not set or failed
    if (!aiReply) {
      aiReply = generateAcademicFallbackResponse(message, subject, mode);
    }

    res.json({
      reply: aiReply,
      source: process.env.GEMINI_API_KEY ? 'gemini-1.5-flash' : 'classconnect-knowledge-engine',
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to process AI chat request' });
  }
});

// AI Summarizer
app.post('/api/ai/summarize', async (req, res) => {
  try {
    const { content, format = 'bullet-points', targetLength = 'concise' } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required for summarization' });
    }

    const prompt = `Please summarize the following academic study material.
Summary format: ${format} (options: bullet-points, executive-summary, flashcards).
Length: ${targetLength}.

Content to summarize:
${content}

Ensure you highlight:
1. Core concepts and definitions
2. Key equations/formulas or logic
3. High-yield exam points`;

    let summary = null;
    try {
      summary = await callGemini(prompt, 'You are an expert academic summarizer specializing in university curricula.');
    } catch (err) {
      console.warn('Gemini summarizer error:', err.message);
    }

    if (!summary) {
      summary = generateFallbackSummary(content, format);
    }

    res.json({
      summary,
      source: process.env.GEMINI_API_KEY ? 'gemini-1.5-flash' : 'classconnect-knowledge-engine',
    });
  } catch (error) {
    console.error('AI Summarize Error:', error);
    res.status(500).json({ error: 'Failed to summarize content' });
  }
});

// AI Quiz Generator
app.post('/api/ai/quiz', async (req, res) => {
  try {
    const { topic = 'Data Structures', difficulty = 'Medium', count = 4 } = req.body;

    const prompt = `Generate a ${count}-question multiple-choice quiz on "${topic}" with difficulty "${difficulty}".
Output strictly valid JSON matching this schema:
[
  {
    "id": 1,
    "question": "Question text...",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answerIndex": 0,
    "explanation": "Why this answer is correct...",
    "hint": "Helpful hint..."
  }
]
Do not enclose in markdown codeblocks if possible, or output only the JSON.`;

    let quizData = null;
    try {
      const raw = await callGemini(prompt, 'You are a university professor creating rigorous multiple-choice assessments.');
      if (raw) {
        const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        quizData = JSON.parse(cleaned);
      }
    } catch (err) {
      console.warn('Gemini quiz parsing fallback:', err.message);
    }

    if (!quizData || !Array.isArray(quizData)) {
      quizData = generateFallbackQuiz(topic, count);
    }

    res.json({
      quiz: quizData,
      topic,
      source: process.env.GEMINI_API_KEY ? 'gemini-1.5-flash' : 'classconnect-knowledge-engine',
    });
  } catch (error) {
    console.error('AI Quiz Error:', error);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

// AI Concept Explainer
app.post('/api/ai/explain', async (req, res) => {
  try {
    const { concept, mode = 'intuitive' } = req.body;
    if (!concept) {
      return res.status(400).json({ error: 'Concept name is required' });
    }

    const prompt = `Explain the academic concept "${concept}".
Mode: "${mode}" (e.g. "eli5" = explain like I'm 5 with everyday analogy, "intuitive" = college undergrad with intuitive examples, "deep-dive" = technical analysis, time complexity, mathematical basis).

Structure your explanation into:
1. 💡 The Big Picture / Analogy
2. 🔬 Core Technical Mechanics
3. 📝 Concrete Example / Code / Calculation
4. ⚠️ Common Student Pitfalls & Exam Tips`;

    let explanation = null;
    try {
      explanation = await callGemini(prompt, 'You are a renowned university lecturer celebrated for crystal-clear explanations.');
    } catch (err) {
      console.warn('Gemini explainer fallback:', err.message);
    }

    if (!explanation) {
      explanation = generateFallbackExplanation(concept, mode);
    }

    res.json({
      explanation,

      concept,
      mode,
      source: process.env.GEMINI_API_KEY ? 'gemini-1.5-flash' : 'classconnect-knowledge-engine',
    });
  } catch (error) {
    console.error('AI Explain Error:', error);
    res.status(500).json({ error: 'Failed to explain concept' });
  }
});

// ==================== SMART KNOWLEDGE ENGINE (WEBSITE DOUBTS + ASSIGNMENT HELP) ====================
function generateAcademicFallbackResponse(question, subject, mode = 0) {
  const q = question.toLowerCase();

  // If user explicitly asks or is in mode 1 (Platform Guide only):
  if (mode === 1) {
    return generatePlatformOnlyResponse(q, subject);
  }

  // If user explicitly asks or is in mode 2 (Assignment Solver only):
  if (mode === 2) {
    return generateAssignmentSolverOnlyResponse(q, subject);
  }

  // MODE 0 (DEFAULT): SMART AUTO-DETECT
  // Directly answer what the student asked for:
  // - If asking about the website (how to gave/submit assignment, attendance, notes, team finder) -> answer the website question directly!
  // - If asking for assignment help (code, math, homework solving, transformer, raft, dijkstra) -> answer the assignment help directly!
  // - If explicitly asking for both ("what can you do", "show both") -> return both.

  const isExplicitBoth =
    q.includes('both') ||
    q.includes('two possibilities') ||
    q.includes('what can you do') ||
    q.includes('how can you help');
  if (isExplicitBoth) {
    return generateTwoPossibilitiesDefaultResponse(q, subject);
  }

  // Check if it's an assignment/coursework coding or problem solving query:
  const isAssignmentHelp =
    q.includes('help with assignment') ||
    q.includes('help solve') ||
    q.includes('solve') ||
    q.includes('solution') ||
    q.includes('code') ||
    q.includes('transformer') ||
    q.includes('attention') ||
    q.includes('raft') ||
    q.includes('consensus') ||
    q.includes('dijkstra') ||
    q.includes('algorithm') ||
    q.includes('dynamic programming') ||
    q.includes('math') ||
    q.includes('formula') ||
    q.includes('derive') ||
    q.includes('explain concept') ||
    q.includes('debug') ||
    q.includes('error');

  // Check if it's a website navigation / doubt query:
  const isWebDoubt =
    q.includes('gave') ||
    q.includes('how to give') ||
    q.includes('how to submit') ||
    q.includes('how do i submit') ||
    q.includes('where to submit') ||
    q.includes('where do i submit') ||
    q.includes('how to upload') ||
    q.includes('where to upload') ||
    q.includes('attendance') ||
    q.includes('check in') ||
    q.includes('75%') ||
    q.includes('download note') ||
    q.includes('where are note') ||
    q.includes('where can i download') ||
    q.includes('team finder') ||
    q.includes('find teammate') ||
    q.includes('timetable') ||
    q.includes('calendar') ||
    q.includes('website') ||
    q.includes('web page') ||
    q.includes('classconnect');

  if (isWebDoubt && !isAssignmentHelp) {
    return generatePlatformOnlyResponse(q, subject);
  }

  if (isAssignmentHelp && !isWebDoubt) {
    return generateAssignmentSolverOnlyResponse(q, subject);
  }

  // If question is "how to gave assignment" or "submit assignment", it's clearly a web doubt!
  if (q.includes('gave') || q.includes('give') || q.includes('submit') || q.includes('turn in') || q.includes('upload')) {
    return generatePlatformOnlyResponse(q, subject);
  }

  // Default for academic topics / coursework
  return generateAssignmentSolverOnlyResponse(q, subject);
}

function generateTwoPossibilitiesDefaultResponse(q, subject) {
  // A: Assignment Submission / Giving query
  if (
    q.includes('assignment') ||
    q.includes('give') ||
    q.includes('gave') ||
    q.includes('submit') ||
    q.includes('turn in') ||
    q.includes('homework') ||
    q.includes('upload')
  ) {
    return `### 🎯 Dual-Assist Mode (Mode 0: Default)
Here are the **Two Possibilities** to answer your request:

---

#### 📌 Possibility 1: How to Submit / Give Your Assignment on the Web Page
If you want to know **how to submit or give your assignment on ClassConnect**:
1. **Navigate**: Click **"Assignments"** in the left sidebar menu (or visit \`/assignments\`).
2. **Find Your Task**: Under the **"Pending"** tab, locate your coursework (e.g., *Assignment 4: Transformer Attention* or *Lab 5: Raft Consensus*).
3. **Click "Submit"**: Click the blue **"Submit"** button on the assignment card.
4. **Upload Work**: Drag & drop your PDF, code file (\`.py\`, \`.zip\`), or paste a GitHub link in the comments box.
5. **Confirm**: Click **"Confirm Submission"** — you will see celebration confetti 🎉 and your status will change to **"Submitted ✓"**!
6. **Track Grades**: Switch to the **"Submitted"** tab to view professor feedback and score breakdown.

[ACTION:OPEN_ASSIGNMENTS]

---

#### 💡 Possibility 2: Assignment & Coursework Problem Solver
If you need **academic help solving, writing, or coding the assignment**:
- **Starter Code & Implementation**: I can generate complete implementations for PyTorch, Python, C++, Go, or JavaScript.
- **Formulas & Algorithm Steps**:
  $$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$
- **Edge Cases & Verification**: I can check your code for memory leaks, vanishing gradients, or boundary condition bugs.
- **Direct Debugging**: Paste your code or error message right here in the chat and I will debug it step-by-step!

> 💬 *Try asking me:* **"Help me write the Transformer attention layer for Assignment 4"** or **"Explain the Raft consensus leader election for Lab 5."**`;
  }

  // B: Attendance / Check in query
  if (q.includes('attendance') || q.includes('check in') || q.includes('absent') || q.includes('present') || q.includes('75%')) {
    return `### 🎯 Dual-Assist Mode (Mode 0: Default)
Here are the **Two Possibilities** to answer your request:

---

#### 📌 Possibility 1: ClassConnect Attendance Web Page Guide
1. **Open Tracker**: Click **"Attendance"** in the sidebar (or visit \`/attendance\`).
2. **Monitor Compliance**: Review your overall attendance percentage and the 75% university policy threshold.
3. **Cushion Calculation**: Check how many classes you can miss or how many consecutive lectures you need to attend to stay safe.
4. **Check In**: Click the green **"Check In"** button on your ongoing class card to mark your presence.

[ACTION:OPEN_ATTENDANCE]

---

#### 💡 Possibility 2: Academic Attendance Recovery & Study Plan
- **Missed Lecture Catch-up**: Use our **Summarizer** tab to quickly review lecture notes for any class you missed.
- **Priority Courses**: Focus on classes with lower attendance cushions first to maintain exam eligibility.`;
  }

  // C: Resource / Notes query
  if (q.includes('note') || q.includes('resource') || q.includes('download') || q.includes('pdf') || q.includes('material')) {
    return `### 🎯 Dual-Assist Mode (Mode 0: Default)
Here are the **Two Possibilities** to answer your request:

---

#### 📌 Possibility 1: How to Download Notes from the Resource Hub
1. **Navigate**: Click **"Resource Hub"** in the sidebar (or visit \`/resources\`).
2. **Filter & Search**: Select your subject (*Deep Learning AI405, Distributed Systems CS301, Algorithms CS204*) or filter by document format (*PDF Notes, Cheatsheets, Solved Past Papers*).
3. **Download**: Click the blue **"Download"** button on any card to save it immediately to your device!

[ACTION:OPEN_RESOURCES]

---

#### 💡 Possibility 2: Instant AI Notes Summary & Exam Prep
- **1-Page Cheatsheet**: Paste any long lecture text into the **"Summarizer"** tab above to get a high-yield exam summary.
- **Self-Assessment Quiz**: Switch to the **"Quiz Maker"** tab to test your retention with 4 practice MCQs on that topic.`;
  }

  // D: Team / Project query
  if (q.includes('team') || q.includes('partner') || q.includes('hackathon') || q.includes('project')) {
    return `### 🎯 Dual-Assist Mode (Mode 0: Default)
Here are the **Two Possibilities** to answer your request:

---

#### 📌 Possibility 1: ClassConnect Team Finder Web Page Guide
1. **Open Team Finder**: Click **"Team Finder"** in the sidebar (or visit \`/team-finder\`).
2. **Filter Peers**: Filter students by programming skills (*React, Python, PyTorch, Figma, Go, Solidity*).
3. **AI Compatibility Match**: Review the AI-calculated compatibility score based on complementary skills.
4. **Send Invites**: Click **"Invite"** to ask peers to join your team, or switch to the **"Project Teams"** tab to post a new project vacancy.

[ACTION:OPEN_TEAM_FINDER]

---

#### 💡 Possibility 2: Project Architecture & System Design
- **Idea Generation**: Need a capstone project idea? I can suggest modern AI, Cloud, or Web3 architectures.
- **Task Breakdown**: I can structure your project into agile milestones, GitHub repository setups, and database schemas.`;
  }

  // E: Timetable & Schedule query
  if (q.includes('timetable') || q.includes('schedule') || q.includes('routine') || q.includes('calendar') || q.includes('class')) {
    return `### 🎯 Dual-Assist Mode (Mode 0: Default)
Here are the **Two Possibilities** to answer your request:

---

#### 📌 Possibility 1: ClassConnect Timetable & Academic Calendar Guide
1. **Today's Classes**: Check the timetable widget directly on your **Student Dashboard** (\`/\`).
2. **Full Calendar**: Click **"Academic Calendar"** in the sidebar (\`/calendar\`) to view weekly lecture schedules, lab sessions, and exam dates.

[ACTION:OPEN_CALENDAR]

---

#### 💡 Possibility 2: Academic Time Management & Study Blocks
- **Pomodoro Technique**: Block 50 minutes of deep study followed by 10 minutes of active recall.
- **Exam Preparation Schedule**: I can build a customized 2-week revision timetable tailored to your upcoming test dates.`;
  }

  // F: General / Academic Concept Query (Default)
  return `### 🎯 Dual-Assist Mode (Mode 0: Default)
Here are the **Two Possibilities** to answer your request:

---

#### 📌 Possibility 1: ClassConnect Web Page Navigation
- **Assignments**: Submit coursework and track scores at \`/assignments\`.
- **Resource Hub**: Download lecture slides and cheatsheets at \`/resources\`.
- **Community Forum**: Ask academic doubts and view verified answers at \`/community\`.
- **Team Finder**: Recruit peers for projects at \`/team-finder\`.
- **Attendance**: Monitor your 75% rule compliance at \`/attendance\`.

[ACTION:OPEN_ASSIGNMENTS]

---

#### 💡 Possibility 2: Academic Coursework & Problem Solver
Regarding **"${q}"** (${subject}):
1. **Concept Breakdown**: Problems in this subject require verifying boundary conditions ($n=0$, $n=1$), recursive depth, and asymptotic space-time trade-offs.
2. **Code & Formula Support**: I can generate starter code, pseudocode, and mathematical derivations for your assignments.
3. **Practice Quiz**: Test your retention with 4 practice questions using our built-in **Quiz Maker** tab above!

> 💬 *Try asking me:* **"How to gave assignment on web page?"** or **"Help me write code for Assignment 4."**`;
}

function generatePlatformOnlyResponse(q, subject) {
  if (q.includes('attendance') || q.includes('check in') || q.includes('75%')) {
    return `### 🏫 ClassConnect Web Page Guide: Attendance Tracker

1. **How to Check Your Attendance**:
   - Click **"Attendance"** in the left sidebar (or visit \`/attendance\`).
   - View your overall percentage across all courses and check your status against the mandatory **75% minimum rule**.
   - Check the **"Cushion"** column to see how many classes you can afford to miss or how many consecutive classes you must attend.

2. **How to Check In**:
   - When a faculty member opens check-in for an ongoing class, click the green **"Check In"** button to log your attendance in real-time.

[ACTION:OPEN_ATTENDANCE]

> 💡 *Need study tips or academic advice for your classes? Just ask me!*`;
  }

  if (q.includes('note') || q.includes('resource') || q.includes('download') || q.includes('pdf')) {
    return `### 🏫 ClassConnect Web Page Guide: Resource Hub

1. **How to Download Lecture Notes**:
   - Click **"Resource Hub"** in the sidebar (or visit \`/resources\`).
   - Filter by your subject (e.g. *AI405 - Deep Learning*, *CS301 - Distributed Systems*, *CS204 - Algorithms*).
   - Filter by format: **PDF Notes**, **Cheatsheets**, **Past Exam Papers**, or **Lab Manuals**.
   - Click the blue **"Download"** button on any card to save the file immediately.

2. **Faculty Resource Upload**:
   - Faculty members can click the **"Upload Resource"** button at the top to publish lecture slides or sample code for students.

[ACTION:OPEN_RESOURCES]

> 💡 *Want me to summarize lecture notes or create practice quizzes? Switch to the Summarizer or Quiz Maker tab above!*`;
  }

  if (q.includes('team') || q.includes('partner') || q.includes('hackathon') || q.includes('project')) {
    return `### 🏫 ClassConnect Web Page Guide: Smart Team Finder

1. **How to Find Project Teammates**:
   - Click **"Team Finder"** in the left sidebar (or visit \`/team-finder\`).
   - Browse students and filter by technical skills (*React, Python, PyTorch, Figma, Go, Solidity, Node.js*).
   - Check the **AI Compatibility Match %** calculated based on complementary skill sets.
   - Click **"Invite"** to send an instant team collaboration request!

2. **How to Create a Project Team**:
   - Switch to the **"Project Teams"** tab and click **"Create Team"** to recruit peers for capstone projects or hackathons.

[ACTION:OPEN_TEAM_FINDER]

> 💡 *Need project architecture or tech stack suggestions for your team? Just ask me!*`;
  }

  if (q.includes('timetable') || q.includes('schedule') || q.includes('routine') || q.includes('calendar') || q.includes('class')) {
    return `### 🏫 ClassConnect Web Page Guide: Timetable & Calendar

1. **Today's Classes**:
   - View your current daily class schedule and room numbers directly on the **Student Dashboard** (\`/\`).

2. **Full Academic Calendar**:
   - Click **"Academic Calendar"** in the sidebar (\`/calendar\`) to browse weekly lectures, lab sessions, and upcoming exam dates.

[ACTION:OPEN_CALENDAR]

> 💡 *Need a revision schedule or study plan for exams? Just ask me!*`;
  }

  return `### 🏫 ClassConnect Web Page Guide: How to Submit / Give Your Assignment

Here is exactly how to submit or give your assignment on the ClassConnect website:

1. **Navigate to Assignments**:
   - Click **"Assignments"** in the left sidebar menu (or visit \`/assignments\`).

2. **Locate Your Coursework**:
   - In the **"Pending"** tab, find the assignment (e.g. *Assignment 4: Transformer Attention* or *Lab 5: Raft Consensus*).
   - Review the deadline, total points, and faculty instructions.

3. **Open Submission Modal**:
   - Click the blue **"Submit"** button on the assignment card.

4. **Upload Your Deliverable**:
   - Drag and drop your deliverable file (PDF, \`.py\`, \`.zip\`) or paste your GitHub repository link in the comments field.

5. **Confirm & Celebrate**:
   - Click **"Confirm Submission"** — you will see a celebration confetti 🎉 animation and the assignment status changes to **"Submitted ✓"**!

6. **Track Grades & Feedback**:
   - Switch to the **"Submitted"** tab to check your grade, score, and faculty comments once reviewed.

[ACTION:OPEN_ASSIGNMENTS]

> 💡 *Need help solving or coding this assignment? Just ask me: **"Help me solve Assignment 4"**!*`;
}

function generateAssignmentSolverOnlyResponse(q, subject) {
  if (q.includes('transformer') || q.includes('attention') || q.includes('deep learning')) {
    return `### 💻 Assignment Helper: Transformer Multi-Head Attention Guide
**Subject:** Deep Learning & AI (AI405)

#### 1. Core Mathematical Formula
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right) V$$

#### 2. Complete PyTorch Implementation
\`\`\`python
import torch
import torch.nn as nn
import math

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model=512, num_heads=8):
        super().__init__()
        assert d_model % num_heads == 0, "d_model must be divisible by num_heads"
        self.d_k = d_model // num_heads
        self.num_heads = num_heads
        self.qkv_proj = nn.Linear(d_model, 3 * d_model)
        self.out_proj = nn.Linear(d_model, d_model)

    def forward(self, x, mask=None):
        B, L, D = x.shape
        # 1. Project to Q, K, V
        qkv = self.qkv_proj(x).chunk(3, dim=-1)
        q, k, v = [t.view(B, L, self.num_heads, self.d_k).transpose(1, 2) for t in qkv]
        
        # 2. Scaled Dot-Product Attention
        scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(self.d_k)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        weights = torch.softmax(scores, dim=-1)
        
        # 3. Concatenate heads and project out
        context = torch.matmul(weights, v).transpose(1, 2).contiguous().view(B, L, D)
        return self.out_proj(context)
\`\`\`

#### 3. Homework Verification Checklist:
- [x] Input tensor dimension handles arbitrary batch size $B$ and sequence length $L$.
- [x] Divide scores by $\\sqrt{d_k}$ to prevent softmax gradients from vanishing.
- [x] Test edge case with padded sequences using the attention mask.

> 📌 *When you finish writing your code, submit your deliverable in the [Assignments tab](/assignments)!*`;
  }

  if (q.includes('raft') || q.includes('consensus') || q.includes('distributed')) {
    return `### 💻 Assignment Helper: Distributed Raft Consensus Leader Election
**Subject:** Distributed Cloud Systems (CS301)

#### 1. Raft State Machine Transitions
- **Follower**: Listens for heartbeats (\`AppendEntries\`). If election timeout expires without heartbeats, increments currentTerm and transitions to **Candidate**.
- **Candidate**: Votes for itself, broadcasts \`RequestVote\` RPCs. If majority granted, transitions to **Leader**.
- **Leader**: Periodically sends empty \`AppendEntries\` heartbeats to assert authority and prevent new elections.

#### 2. Key Code Logic (Python / Go)
\`\`\`python
import time
import random

class RaftNode:
    def __init__(self, node_id, peers):
        self.node_id = node_id
        self.peers = peers
        self.current_term = 0
        self.voted_for = None
        self.state = "Follower" # Follower | Candidate | Leader
        self.reset_election_timeout()

    def reset_election_timeout(self):
        # Randomized election timeout prevents split votes
        self.timeout = random.uniform(0.150, 0.300) 
        self.last_heartbeat = time.time()

    def start_election(self):
        self.state = "Candidate"
        self.current_term += 1
        self.voted_for = self.node_id
        votes_received = 1
        print(f"Node {self.node_id} initiated election for Term {self.current_term}")
\`\`\`

#### 3. Common Student Pitfalls:
- Forgetting randomized timeouts (causes election split ties).
- Overwriting \`voted_for\` in the same term without receiving a higher term.

> 📌 *Once tested across nodes, package your code and submit it in the [Assignments tab](/assignments)!*`;
  }

  return `### 💻 Assignment & Academic Problem Solver
**Subject:** ${subject}

#### 1. Algorithmic Strategy:
- **Input / Output Specification**: Formulate constraints and pre-conditions.
- **Divide and Conquer / Dynamic Programming**: Break complex requirements into subproblems with memoization.
- **Complexity Guardrails**: Guarantee $\\mathcal{O}(n \\log n)$ time and $\\mathcal{O}(n)$ auxiliary space.

#### 2. Starter Template & Debugging Support:
- Need code in **Python, PyTorch, C++, Java, or Go**? Just ask me for the exact implementation!
- Paste any compiler error or traceback and I will explain the fix line-by-line.

> 📌 *Ready to turn in your homework? Visit the [Assignments tab](/assignments) to submit.*`;
}

function generateFallbackSummary(content, format) {
  const words = content.split(/\s+/).slice(0, 30).join(' ');
  return `### 📑 Study Summary & Key Takeaways

**Primary Focus Area:** Academic Synthesis  
**Examinee Overview:** Summarized from "${words}..."

#### 📌 Core Highlights:
- **Central Principle:** The underlying theory focuses on modular structure, high cohesion, and scalable application architecture.
- **Key Equation / Method:** Invariant analysis guarantees correctness across varying input states and operational parameters.
- **Critical Distinction:** Differentiate between theoretical worst-case limits and typical practical performance.

#### 🎯 High-Yield Exam Takeaway:
Be prepared to write code or draw block diagrams illustrating how components exchange messages or execute state transitions under edge conditions.`;
}

function generateFallbackQuiz(topic, count) {
  return [
    {
      id: 1,
      question: `In ${topic}, what is the main advantage of using a balanced binary search tree over an unsorted array?`,
      options: [
        'Guaranteed O(log n) search, insertion, and deletion',
        'Requires O(1) space complexity always',
        'Elements can only be numbers',
        'Eliminates the need for memory pointers',
      ],
      answerIndex: 0,
      explanation: 'Balanced BSTs (such as AVL or Red-Black trees) maintain a logarithmic height O(log n), ensuring fast searches and updates.',
      hint: 'Think about binary search efficiency vs linear scan.',
    },
    {
      id: 2,
      question: `Which data structure operates strictly on a First-In, First-Out (FIFO) principle?`,
      options: ['Stack', 'Queue', 'Max-Heap', 'Priority Trie'],
      answerIndex: 1,
      explanation: 'A Queue enforces FIFO order where elements are enqueued at the rear and dequeued from the front.',
      hint: 'Like standing in a line at a campus coffee shop.',
    },
    {
      id: 3,
      question: `What is the worst-case time complexity of QuickSort when a poor pivot is repeatedly chosen?`,
      options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
      answerIndex: 2,
      explanation: 'When the pivot is consistently the smallest or largest element (e.g. already sorted array without randomized pivot), QuickSort degrades to O(n²).',
      hint: 'Partitioning produces subproblems of size 0 and n-1.',
    },
    {
      id: 4,
      question: `In modern RESTful APIs, which HTTP method is typically idempotent and used to replace an existing resource?`,
      options: ['POST', 'PUT', 'PATCH', 'CONNECT'],
      answerIndex: 1,
      explanation: 'PUT is idempotent: sending the exact same PUT request multiple times produces the identical side-effect on the server resource.',
      hint: 'Starts with P and replaces the target entity entirely.',
    },
  ].slice(0, count);
}

function generateFallbackExplanation(concept, mode) {
  return `### Concept Explanation: ${concept}
*(Mode: ${mode.toUpperCase()})*

#### 💡 1. The Big Picture
Imagine you are organizing a university library with millions of textbooks. If books are scattered randomly, finding a single title takes hours. The concept of **${concept}** is like an intelligent index system that lets you locate and manage information almost instantly.

#### 🔬 2. Core Technical Mechanics
- **Structural Partition:** Divides the problem space into deterministic subsets.
- **Invariants:** Maintains stability guarantees throughout concurrent transformations.
- **Resource Efficiency:** Minimizes computation by caching repeated intermediate states.

#### 📝 3. Concrete Application
In software systems, this pattern is widely applied in database querying, compiler syntax parsing, and network packet routing.

#### ⚠️ 4. Common Student Pitfalls
- Forgetting to handle empty or single-element boundary states.
- Assuming average-case performance applies when data distribution is heavily skewed.
- Always analyze both auxiliary space complexity alongside time complexity!`;
}

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 ClassConnect Backend running at http://localhost:${PORT}`);
  console.log(`🤖 Gemini AI Mode: ${process.env.GEMINI_API_KEY ? 'Active (Gemini 1.5 Flash)' : 'Fallback Knowledge Engine (Add GEMINI_API_KEY in .env to activate live API)'}`);
});
