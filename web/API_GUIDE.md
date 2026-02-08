# 🌐 The Role of APIs in OpenSchool

In our project, the **API (Application Programming Interface)** acts as the "messenger" or "waiter" between your **Website (Frontend)** and your **Database (Backend/Supabase)**.

## 🏗️ How It Works

Imagine a restaurant:
1.  **You (Frontend)** sit at the table and look at the menu.
2.  **The Kitchen (Database)** has all the ingredients and cooks the food.
3.  **The Waiter (API)** takes your order to the kitchen and brings the food back to you.

You never go into the kitchen yourself – you just talk to the waiter.

---

## 📍 Where We Use APIs in OpenSchool

We use **Next.js API Routes** (files inside `app/api/...`) to handle almost every data action.

### 1. Fetching Data (Reading)
When a student visits the **Course Catalog**, the page doesn't talk to the database directly. Use `GET` requests.

-   **Frontend**: `fetch('/api/courses')`
-   **API File**: `app/api/courses/route.ts`
-   **Action**: The API asks Supabase for the list of courses and sends it to the page.

### 2. Sending Data (Writing)
When an Admin **approves a teacher**, they click a button. Use `PATCH` or `POST` requests.

-   **Frontend**: `fetch('/api/admin/users', { method: 'PATCH', ... })`
-   **API File**: `app/api/admin/users/route.ts`
-   **Action**: The API tells Supabase to change `is_approved` to `true`.

### 3. Talking to External Services
When a teacher **uploads a video**, we need to talk to **PeerTube** (not just our database).

-   **Frontend**: `fetch('/api/videos/upload')`
-   **API File**: `app/api/videos/upload/route.ts`
-   **Action**: This API takes the video file and sends it secretly to the PeerTube server using a special "Secret Key" (Token) that the user never sees.

---

## 🛡️ Why Do We Need Them?

1.  **Security**: We keep our "Secret Keys" (like the Supabase Admin Key or PeerTube Token) inside the API files on the server. If the Frontend talked directly to PeerTube, users could steal your keys!
2.  **Central Control**: If we want to change how "Approval" works, we change it in **one place** (the API). We don't have to change every button in the app.
3.  **Data Safety**: The API checks "Is this user actually an Admin?" before running the command. The Frontend is easily hacked; the API is secure.

## 📂 Key API Files in Your Project

| API Route | Purpose | Used In File |
| :--- | :--- | :--- |
| `/api/courses` | Get all courses | `app/student/courses/page.tsx` |
| `/api/admin/users` | Approve teachers | `app/admin/teachers/page.tsx` |
| `/api/videos` | Get list of lessons | `app/student/videos/page.tsx` |
| `/api/enrollments` | Enroll a student | `app/student/courses/page.tsx` |
| `/api/stats` | Dashboard numbers | `app/student/page.tsx` |
