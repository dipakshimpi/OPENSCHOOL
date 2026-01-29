This ensures your Secure Operations (Day 4) are fully functional.

## PHASE 1: Teacher Approval (Zero Trust)
**Goal:** Confirm a new teacher cannot log in until approved.

1.  **Sign Up as Teacher:**
    *   Go to `http://localhost:3000/auth/signup`.
    *   Create a NEW account with role **"Teacher"** (e.g., `teacher_test@school.com`).
    *   *Result:* automatic redirect to `/auth/pending` (or dashboard if bug exists).
2.  **Verify Block:**
    *   Try to manually go to `http://localhost:3000/teacher`.
    *   *Result:* Should bounce you back to `/auth/pending`.
3.  **Admin Approval:**
    *   Open a new Incognito window.
    *   Log in as **Admin**.
    *   Go to `http://localhost:3000/admin/teachers`.
    *   Find `teacher_test` (Badge should say **PENDING**).
    *   Click **"Approve Account"**.
    *   *Result:* Badge changes to **VERIFIED**.
4.  **Confirm Access:**
    *   Go back to the Teacher window.
    *   Refresh the page.
    *   *Result:* Redirects to Teacher Dashboard successfully.

---

## PHASE 2: Video Security (PeerTube & Proxy)
**Goal:** Confirm videos are private and can only be played via our app.

1.  **Upload to PeerTube:**
    *   Go to `http://127.0.0.1:9000` -> Login as `root`.
    *   Upload a dummy video (short clip).
    *   **CRITICAL:** Set Privacy to **"Internal"** or **"Private"**.
2.  **Get ID:**
    *   Copy the video UUID from the PeerTube URL (e.g., `512...`).
3.  **Test Proxy (Security Check):**
    *   In your browser, try to open: `http://localhost:3000/api/videos/stream/[VIDEO_UUID]`.
    *   *Result (Student):* Should return a JSON with `stream_url`.
    *   *Result (Public/Incognito):* Should return `401 Unauthorized`.

---

## PHASE 3: Rate Limiting (Anti-Spam)
**Goal:** Confirm the server blocks too many requests.

1.  **Spam Refresh:**
    *   Go to any page (e.g., Dashboard).
    *   Hold down `Ctrl + R` (Refresh) rapidly for 10-15 seconds.
2.  **Observe Block:**
    *   *Result:* The page should eventually stop loading and show **"429 Too Many Requests"** (or a plain text message).
3.  **Verify Console:**
    *   Check your VS Code terminal running `npm run dev`.
    *   You might see logs about "Rate limit exceeded".
4.  **Check Upstash:**
    *   Go to your Upstash Dashboard.
    *   You should see a spike in the "Requests" chart.

---

## PHASE 4: Video Player Protection
**Goal:** Confirm the player prevents easy theft.

1.  **Right Click:**
    *   Play a video in the app.
    *   Right-click on the video.
    *   *Result:* Menu should be disabled (or custom menu).
2.  **Download Button:**
    *   Hover over the controls.
    *   *Result:* No "Download" button should be visible.
3.  **Watermark:**
    *   Look at the video corners.
    *   *Result:* You should see your email lightly overlaid on the video.
