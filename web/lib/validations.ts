import { z } from "zod";

export const profileSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name too long"),
    phone_number: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional().nullable(),
    bio: z.string().max(500, "Bio too long").optional().nullable(),
    department: z.string().max(50, "Department name too long").optional().nullable(),
    grade: z.string().max(20, "Grade too long").optional().nullable(),
    address: z.string().max(200, "Address too long").optional().nullable(),
    avatar_url: z.string().url("Invalid image URL").optional().nullable().or(z.literal("")),
});

export const attendanceSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    accuracy: z.number().optional().nullable(),
    deviceInfo: z.record(z.string(), z.any()).optional().nullable(),
    adminOverride: z.boolean().optional().default(false),
    overrideReason: z.string().max(200).optional().nullable(),
});

export const courseSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title too long"),
    description: z.string().max(1000, "Description too long").optional().nullable(),
    thumbnail_url: z.string().url("Invalid image URL").optional().nullable().or(z.literal("")),
});

export const videoSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title too long"),
    description: z.string().max(1000, "Description too long").optional().nullable(),
    courseId: z.string().uuid("Invalid Course ID"),
});
