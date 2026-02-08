# 🔧 TROUBLESHOOTING GUIDE - Course Creation Issues

## Issue Summary
You reported two problems:
1. `/teacher/courses/create` page not found
2. Teacher details not showing when trying to assign courses

## Root Cause Analysis

### ✅ Problem 1: Teacher Course Creation Page
**Status**: **PAGE EXISTS** - This is likely a caching or routing issue

**File Location**: `app/teacher/courses/create/page.tsx`

**Possible Causes**:
- Browser cache
- Development server needs restart
- Middleware redirect issue

**Solutions**:
1. **Hard refresh** your browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` an click "Appr(Mac)
2. **Restart the dev server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm start
   ```
3. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   npm run build
   npm start
   ```

---

### ⚠️ Problem 2: No Teachers Available for Assignment
**Status**: **IDENTIFIED** - Teachers exist but are NOT APPROVED

**Current Database State**:
- **Total Teachers**: 6
- **Approved**: 3 ✅
- **Pending Approval**: 3 ⏳

**Why This Happens**:
The admin course creation form ONLY shows **approved** teachers in the dropdown. This is by design for security.

**Solution**:
You need to **approve pending teachers** first!

### How to Approve Teachers:

#### Step 1: Go to Admin Users Page
Navigate to: `/admin/users`

#### Step 2: Find Pending Teachers
Look for users with:
- Role: Teacher
- Status: Pending Approval

#### Step 3: Approve Them
Click the "Approve" button next to each teacher

#### Alternative: Direct Database Approval (Quick Fix)
If the admin UI is not working, run this SQL in Supabase:

```sql
-- Approve ALL pending teachers
UPDATE profiles 
SET is_approved = true 
WHERE role = 'teacher' AND is_approved = false;
```

---

## API Fix Applied

I've updated the `/api/admin/users` endpoint to:
1. Support filtering by `approved` status
2. Return data in the correct format: `{ users: [...] }`

**New API Usage**:
```javascript
// Get all approved teachers
fetch('/api/admin/users?role=teacher&approved=true')

// Get pending teachers
fetch('/api/admin/users?role=teacher&approved=false')

// Get all teachers (approved + pending)
fetch('/api/admin/users?role=teacher')
```

---

## Testing Checklist

### Test 1: Teacher Course Creation
1. Login as an **approved teacher**
2. Go to `/teacher/courses/create`
3. Fill in course details
4. Click "Launch Course"
5. ✅ Should redirect to `/teacher/courses`

### Test 2: Admin Course Assignment
1. Login as **admin**
2. Go to `/admin/courses`
3. Click "Direct Add Course"
4. **Check the instructor dropdown**:
   - Should show 3 approved teachers
   - Should NOT show pending teachers
5. Select a teacher, fill form, submit
6. ✅ Course should be created

### Test 3: Approve Teachers
1. Login as **admin**
2. Go to `/admin/users` (if functional)
3. OR run the SQL query above
4. Approve all pending teachers
5. Go back to `/admin/courses/create`
6. ✅ Dropdown should now show 6 teachers

---

## Quick Diagnostic Commands

Run these to check your system state:

```bash
# Check total courses
node scripts/check_courses_count.js

# Check teachers and approval status
node scripts/check_teachers.js

# Check videos
node scripts/check_videos_count.js
```

---

## Current System Status

| Component | Status | Count |
|-----------|--------|-------|
| Courses | ✅ Working | 8 |
| Teachers (Total) | ✅ Exist | 6 |
| Teachers (Approved) | ⚠️ Limited | 3 |
| Teachers (Pending) | ⏳ Need Approval | 3 |
| Videos | ⚠️ Schema Issue | 0 |
| Student Attendance | ❌ Table Missing | N/A |

---

## Next Steps

### Immediate Actions:
1. ✅ **Approve pending teachers** (SQL or admin UI)
2. ✅ **Hard refresh** browser for `/teacher/courses/create`
3. ✅ **Test course creation** from both teacher and admin sides

### Database Migrations Needed:
1. **Student Attendance Table**: Run `migration_student_attendance.sql`
2. **Video Schema Fix**: Run `fix_videos_schema.sql`

---

## Still Not Working?

If the issues persist after trying the above:

1. **Check browser console** for errors (F12 → Console tab)
2. **Check terminal** for server errors
3. **Verify you're logged in** with the correct role
4. **Check middleware** isn't redirecting you away

**Share the error message** and I'll help debug further!

---

**Last Updated**: 2026-02-04 21:54  
**Status**: Diagnostic Complete ✅
