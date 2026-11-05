// Frontend service to call ClassConnect Backend AI & Upload routes

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function askGeminiChat(message, subject = 'General Academic', mode = 0, history = []) {
  try {
    const res = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, subject, mode, history }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.warn('Backend chat offline, using smart local study assistant:', error);
    return {
      reply: getSmartOfflineReply(message, subject, mode),
      source: 'offline-local-engine',
    };
  }
}

export async function summarizeText(content, format = 'bullet-points', targetLength = 'concise') {
  try {
    const res = await fetch(`${API_BASE}/api/ai/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, format, targetLength }),
    });

    if (!res.ok) throw new Error('Summarization failed');
    return await res.json();
  } catch (error) {
    console.warn('Backend summarizer offline, using local engine:', error);
    const snippet = content.slice(0, 80);
    return {
      summary: `### 📑 High-Yield Study Summary

- **Primary Subject:** Analysis of "${snippet}..."
- **Core Formula / Logic:** Key concepts maintain invariants across variable input sizes.
- **Exam Warning:** Pay attention to space-time trade-offs and edge case boundary evaluations.
- **Recommendation:** Form a study group in **Smart Team Finder** to review these notes together!`,
      source: 'offline-local-engine',
    };
  }
}

export async function generateQuiz(topic = 'Data Structures', difficulty = 'Medium', count = 4) {
  try {
    const res = await fetch(`${API_BASE}/api/ai/quiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, difficulty, count }),
    });

    if (!res.ok) throw new Error('Quiz generation failed');
    return await res.json();
  } catch (error) {
    console.warn('Backend quiz offline, returning curated assessment:', error);
    return {
      topic,
      source: 'offline-local-engine',
      quiz: [
        {
          id: 1,
          question: `Which data structure is optimal for implementing LRU (Least Recently Used) cache in O(1) time?`,
          options: [
            'Doubly Linked List + Hash Map',
            'Binary Search Tree + Stack',
            'Array + Min-Heap',
            'Trie + Circular Queue',
          ],
          answerIndex: 0,
          explanation:
            'A Doubly Linked List enables O(1) node removal and insertion at head/tail, while a Hash Map allows O(1) lookup.',
          hint: 'You need fast node splice together with constant-time key lookup.',
        },
        {
          id: 2,
          question: `In dynamic programming, what two properties must a problem have to be solvable using DP?`,
          options: [
            'Optimal substructure and overlapping subproblems',
            'Linear equations and non-zero determinants',
            'Greedy choice property and negative cycle absence',
            'Continuous differentiable functions and convex hulls',
          ],
          answerIndex: 0,
          explanation:
            'Optimal substructure means the optimal solution contains optimal sub-solutions. Overlapping subproblems means recursive calls reuse solutions.',
          hint: 'Think about memoizing repeated subproblems.',
        },
        {
          id: 3,
          question: `What is the amortized cost of an insertion into a dynamic array that doubles in size when full?`,
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
          answerIndex: 0,
          explanation:
            'Although individual doubling copies n elements (O(n)), over n insertions the total work is proportional to 2n, making amortized time O(1).',
          hint: 'Think about aggregate banking method.',
        },
        {
          id: 4,
          question: `What does the CAP theorem state is impossible for a distributed data store to guarantee simultaneously?`,
          options: [
            'Consistency, Availability, and Partition Tolerance',
            'Concurrency, Atomicity, and Performance',
            'Computation, Asynchrony, and Persistence',
            'Cryptography, Authentication, and Privacy',
          ],
          answerIndex: 0,
          explanation:
            'Eric Brewer\'s CAP theorem establishes that in the presence of network partitions (P), a distributed system can only choose between Consistency (C) or Availability (A).',
          hint: 'C-A-P.',
        },
      ].slice(0, count),
    };
  }
}

export async function explainConcept(concept, mode = 'intuitive') {
  try {
    const res = await fetch(`${API_BASE}/api/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept, mode }),
    });

    if (!res.ok) throw new Error('Explanation failed');
    return await res.json();
  } catch (error) {
    console.warn('Backend explainer offline, using local engine:', error);
    return {
      concept,
      mode,
      source: 'offline-local-engine',
      explanation: `### Concept Deep-Dive: ${concept}
*(Mode: ${mode.toUpperCase()})*

#### 💡 The Intuition
Think of **${concept}** like an airport air traffic control tower. Rather than every plane directly talking to every other plane (which scales as $\\mathcal{O}(n^2)$), all coordination runs through a centralized protocol, guaranteeing safety, order, and synchronization.

#### 🔬 Engineering Mechanics
1. **State Isolation**: Components do not mutate external state directly.
2. **Determinism**: Given identical inputs, outputs are guaranteed predictable.
3. **Fault Containment**: Errors in one branch do not cascade across the entire system.

#### 📝 Concrete Example
In modern software, this pattern is widely applied in database querying, compiler syntax parsing, and network packet routing.`,
    };
  }
}

export async function uploadFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  } catch (error) {
    console.warn('Backend file upload offline, mocking local upload:', error);
    return {
      success: true,
      file: {
        name: file.name,
        filename: file.name,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        url: URL.createObjectURL(file),
      },
    };
  }
}

// Client-side smart knowledge engine (Website Doubts + Assignment Help)
function getSmartOfflineReply(message, subject, mode = 0) {
  const q = message.toLowerCase();

  // Mode 1: Platform & Web Page Guide Only
  if (mode === 1) {
    return getPlatformGuide(q, subject);
  }

  // Mode 2: Assignment & Coursework Problem Solver Only
  if (mode === 2) {
    return getAssignmentHelp(q, subject);
  }

  // Mode 0 (Default): Smart Auto-Detect
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
    return getBothGuide(q, subject);
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
    return getPlatformGuide(q, subject);
  }

  if (isAssignmentHelp && !isWebDoubt) {
    return getAssignmentHelp(q, subject);
  }

  // If question is "how to gave assignment" or "submit assignment", it's clearly a web doubt!
  if (q.includes('gave') || q.includes('give') || q.includes('submit') || q.includes('turn in') || q.includes('upload')) {
    return getPlatformGuide(q, subject);
  }

  // Default for academic topics / coursework
  return getAssignmentHelp(q, subject);
}

function getPlatformGuide(q, subject) {
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

function getAssignmentHelp(q, subject) {
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

function getBothGuide(q, subject) {
  return `### 🎯 ClassConnect AI: Dual Overview
I can help you with both website doubts and academic coursework:

---

#### 🏫 1. ClassConnect Website Guide
- **Submitting Assignments**: Visit \`/assignments\` to view pending coursework and submit files with instant confirmation.
- **Downloading Notes**: Visit \`/resources\` to search and download PDF notes and past exam papers.
- **Attendance Tracking**: Visit \`/attendance\` to check your 75% rule cushion and check into active classes.
- **Team Finder**: Visit \`/team-finder\` to find project peers matched by complementary skills.

[ACTION:OPEN_ASSIGNMENTS]

---

#### 💻 2. Assignment & Coursework Helper
- **Code Generation**: PyTorch, Python, C++, Go, and JavaScript implementations.
- **Concept Deep-Dives**: Detailed explanations of algorithms, consensus protocols, and neural architectures.
- **Debugging**: Step-by-step code and formula fixes.

> 💬 *Ask what you need directly:* **"How to gave assignment on web page?"** or **"Help me solve Assignment 4"**!`;
}
