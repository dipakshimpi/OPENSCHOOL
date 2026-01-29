# Debugging Video Access Issues

The error "Video not found or access denied" usually happens for one of three reasons:

1.  **Database Linkage:** The video exists but is not linked to the correct Course.
2.  **Permissions (RLS):** The student is not enrolled in the course, so the database hides the video.
3.  **Data Type Mismatch:** The ID matches the PeerTube format, but the table might still be expecting something else (unlikely since we fixed it to TEXT).

## Step 1: Diagnose the Database Status
Run the following SQL query in your **Supabase SQL Editor** to see exactly what is going on with this video.

```sql
-- Check Video details and Course Linkage
SELECT 
    v.id AS video_id, 
    v.title AS video_title, 
    v.peertube_url,
    v.course_id, 
    c.title AS course_title
FROM public.videos v
LEFT JOIN public.courses c ON v.course_id = c.id
WHERE v.id = 'a2LnJAUDn6XwoFcWyaGrFr';
```

### Analysis of Result:
*   **0 Rows Returned:** The video was NOT inserted properly. You need to run the `INSERT` command again.
*   **`course_id` is NULL:** The video is floating and not attached to any course. The student dashboard won't show it.
*   **Rows Returned OK:** Proceed to Step 2.

## Step 2: Fix the Linkage (If course_id is NULL)
If the video exists but has no course, verify your Course ID first, then run this:

```sql
-- Update the video to belong to your specific course
-- Replace 'YOUR_COURSE_UUID_HERE' with the actual ID from public.courses
UPDATE public.videos 
SET course_id = 'YOUR_COURSE_UUID_HERE' 
WHERE id = 'a2LnJAUDn6XwoFcWyaGrFr';
```

## Step 3: Verify Enrollment
Even if the video is linked, the **Row Level Security (RLS)** policy says: *"Only students enrolled in this course can see its videos."*

Check if your current student user is enrolled:
```sql
SELECT * FROM public.enrollments 
WHERE course_id = (SELECT course_id FROM public.videos WHERE id = 'a2LnJAUDn6XwoFcWyaGrFr');
```

If you are not enrolled, go to the Student Dashboard and click **"Enroll"** on that course card.
