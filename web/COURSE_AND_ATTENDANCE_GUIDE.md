# OpenSchool LMS - Course Creation & Attendance Guide

## 📚 How to Create Courses

### As a Teacher:
1. **Navigate**: Go to `/teacher/courses/create`
2. **Fill the form**:
   - Course Title (required)
   - Description (optional)
   - Thumbnail URL (optional)
3. **Click**: "Launch Course"
4. **Result**: Course is created with YOU as the instructor

### As an Admin:
1. **Navigate**: Go to `/admin/courses` → Click "Direct Add Course"
2. **Fill the form**:
   - Course Title (required)
   - Description (optional)
   - **Select Instructor** (required) - Choose from approved teachers
   - Thumbnail URL (optional)
3. **Click**: "Create Course"
4. **Result**: Course is created and assigned to the selected teacher

---

## 📋 Attendance System Explained

### How It Works:

#### **Enrollment vs Attendance**
- **Enrollment** = Student joins a course (happens ONCE)
  - This is permanent until manually removed
  - Does NOT automatically mark attendance
  
- **Attendance** = Daily presence tracking (happens EVERY class day)
  - Must be marked manually by the teacher
  - Records: Present or Absent for each student per day

#### **Teacher Workflow:**
1. Go to `/teacher/attendance`
2. Select a course from the dropdown
3. **Geo-verify** your location (must be within school boundaries)
4. View the list of enrolled students
5. Toggle each student as **Present** (green) or **Absent** (red)
6. Click **"Commit Attendance"** to save to database

#### **Student View:**
- Students can see their attendance rate on their dashboard
- Calculated as: `(Days Present / Total Days) × 100%`
- Updated in real-time after teacher commits attendance

---

## 🗄️ Database Tables

### `courses`
- Stores course information
- Links to instructor (teacher profile)

### `enrollments`
- Links students to courses
- Tracks progress percentage

### `student_attendance`
- Records daily attendance
- Fields: student_id, course_id, teacher_id, status, date
- Unique constraint: One record per student per course per day

---

## ✅ Current System Status

### Working Features:
✅ Teacher can create courses  
✅ Admin can create courses and assign to teachers  
✅ Students can enroll in courses  
✅ Teacher can mark daily attendance  
✅ Students can view their attendance rate  
✅ Video upload and streaming  
✅ Course catalog with enrollment  

### Pending Database Migrations:
⚠️ **Run these SQL scripts in Supabase:**

1. **Student Attendance Table** (`migration_student_attendance.sql`)
2. **Video Schema Fix** (`fix_videos_schema.sql`)

---

## 🚀 Quick Start Checklist

### For Teachers:
1. ✅ Login as approved teacher
2. ✅ Create a course at `/teacher/courses/create`
3. ✅ Upload video lessons at `/teacher/videos/upload`
4. ✅ Mark attendance daily at `/teacher/attendance`

### For Students:
1. ✅ Login as approved student
2. ✅ Browse courses at `/student/courses`
3. ✅ Click "Enroll Now" on any course
4. ✅ Access video lectures from course detail page
5. ✅ View attendance on dashboard

### For Admins:
1. ✅ Approve pending users at `/admin/users`
2. ✅ Create courses at `/admin/courses/create`
3. ✅ Monitor platform activity on admin dashboard

---

## 📝 Important Notes

### Attendance Logic:
- **NOT automatic** - Teacher must manually mark each day
- **Geo-fenced** - Teacher must be at school to mark attendance
- **Daily unique** - Only one attendance record per student per course per day
- **Overridable** - Teacher can change Present ↔ Absent before committing

### Course Creation:
- Teachers can only create courses for themselves
- Admins can create courses for ANY approved teacher
- All courses are immediately visible in the student catalog
- Students must manually enroll to access content

---

## 🔧 Troubleshooting

### "Could not find table 'student_attendance'"
**Fix**: Run `migration_student_attendance.sql` in Supabase SQL Editor

### "Video upload succeeds but doesn't appear in library"
**Fix**: Run `fix_videos_schema.sql` in Supabase SQL Editor

### "Cannot create course"
**Check**:
- Are you logged in as an approved teacher/admin?
- Is the course title filled in?
- (Admin only) Did you select an instructor?

### "Student can't see videos"
**Check**:
- Is the student enrolled in the course?
- Did the teacher upload videos to that specific course?
- Run the video schema migration if needed

---

## 📊 Current Database State

**Courses**: 8 courses exist  
**Videos**: 0 videos (schema needs migration)  
**Attendance**: Table needs to be created  

---

**Last Updated**: 2026-02-04  
**Version**: Production v1.0
