# OpenSchool Production Readiness Status

This document tracks the improvements made to bring the project from "Demo-Ready" to "Production-Ready".

## 🛡️ Security & Integrity (Completed)

1.  **Strict Geo-Fencing (Attendance):**
    *   Removed demo bypass that allowed marking attendance if no fences were set.
    *   Now requires at least one school boundary to exist.
2.  **Schema Validation (Zod):**
    *   Implemented `lib/validations.ts` for consistent data sanitization.
    *   Applied strict validation to `Profile`, `Attendance`, `Course`, and **Video Upload** APIs.
    *   Prevents malformed data or "Oversized" text inputs (e.g., massive bios or titles).
3.  **Strengthened RLS Policies:**
    *   Updated `Course` table to only allow **Approved** Teachers or Admins to create courses.
    *   Updated `Attendance` table to only allow **Approved** Teachers to mark attendance.
    *   Prevents unapproved users from adding data even if they bypass the UI.

## ⚙️ Backend Stability (Completed)

1.  **Data Consistency:**
    *   Added `updated_at` timestamps to profile updates.
    *   Improved error reporting in API routes (now returns structured Zod error details).
2.  **Middleware Management:**
    *   Retained `proxy.ts` (as requested) to ensure no interference with heavy PeerTube video streams.

## 🚧 Upcoming Tasks (Roadmap)

1.  **Environment Audit:** Create a health-check script to verify all production `.env` variables.
2.  **Dormant User Cleanup:** Implement a policy/script for handling unapproved accounts older than 30 days.
3.  **IP-Based Verification:** Add optional IP-matching for attendance to further prevent GPS spoofing.

---
*Last updated: 2026-02-13*
