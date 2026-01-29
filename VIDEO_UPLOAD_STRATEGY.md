# How Teachers Upload Videos (Production Strategy)

You asked: *"How does a normal teacher upload videos when the site is live (deployed)?"*

Here are the two ways to handle this. We currently use **Method 1**, but **Method 2** is the professional goal.

---

## 🛑 Method 1: The "Two-Portal" Way (Current)
*This is the easiest to build but harder for the teacher.*

**The Setup:**
1. You host OpenSchool at `www.openschool.com`.
2. You host PeerTube at `video.openschool.com`.

**The Teacher's Experience:**
1. **Teacher Login:** The teacher has to log in to `video.openschool.com` first.
2. **Upload:** They upload their video file there (just like YouTube).
3. **Copy Link:** They copy the video URL (e.g., `https://video.openschool.com/w/xyz...`).
4. **Switch Sites:** They go to `www.openschool.com`, log in as a teacher.
5. **Paste:** They create a lesson and paste that link.

**Verdict:** It works, but it's "clunky". Teachers need two accounts and have to juggle two websites.

---

## ✨ Method 2: The "Seamless" Way (Recommended)
*This makes PeerTube invisible. The teacher only ever sees OpenSchool.*

**The Setup:**
1. Connect OpenSchool to PeerTube using a **Master API Key**.
2. OpenSchool acts as the "messenger."

**The Teacher's Experience:**
1. **Teacher Login:** Teacher logs in to `www.openschool.com`.
2. **Upload:** They click a **"Upload Lesson Video"** button inside your form.
3. **Select File:** They pick `math_lesson.mp4` from their laptop.
4. **Done:** They hit "Save".

**What happens behind the scenes (The Magic):**
1. OpenSchool takes the file.
2. OpenSchool secretly calls the PeerTube API (`POST /api/v1/videos/upload`).
3. It uses a hidden **"System Account"** to upload the video.
4. PeerTube sends back the new ID (`uuid`).
5. OpenSchool saves that ID to the database automatically.

**Result:** The teacher thinks they uploaded it to your website. They don't even know PeerTube exists.

---

## 🛠️ How to Build Method 2 (The "Idea")

Since you asked specifically *how* this works technically:

### 1. The "System User"
You don't ask every teacher to create a PeerTube account.
*   You create **ONE** admin account on PeerTube (e.g., `system_upload@openschool.com`).
*   OpenSchool uses this account's password/token to do all the work.

### 2. The Flow
1.  **Frontend (React):** Teacher selects a file. We use `FormData` to send it to our Next.js API.
2.  **Backend (Next.js):** Our API route receives the file.
    *   It effectively says: *"Hey PeerTube, here is a video file. Please host it for me."*
3.  **PeerTube:** Replies: *"Okay, received. Here is the new Video ID: `7f9b...`"*
4.  **Database:** We save `7f9b...` into the `videos` table linked to that Teacher's course.

### 3. Benefits
*   **No extra logins:** Teacher only knows OpenSchool.
*   **Control:** You control where the videos go.
*   **Professional:** It feels like a premium app (like Udemy or Coursera).

### Summary
To achieve this, we simply need to write a new API Route (`/api/videos/upload`) that acts as the bridge between your Frontend form and the PeerTube server.
