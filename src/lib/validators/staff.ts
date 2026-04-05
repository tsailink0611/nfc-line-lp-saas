import { z } from "zod";

export const staffSchema = z.object({
  store_id: z.string().uuid("店舗を選択してください"),
  staff_code: z.string().optional(),
  slug: z.string().min(1, "スラッグは必須です").max(100, "スラッグは100文字以内で入力してください").regex(/^[a-z0-9-]+$/, "スラッグは英小文字・数字・ハイフンのみ使用可能です"),
  last_name: z.string().min(1, "姓は必須です"),
  first_name: z.string().min(1, "名は必須です"),
  last_name_en: z.string().optional(),
  first_name_en: z.string().optional(),
  display_name: z.string().optional(),
  position: z.string().optional(),
  career_years: z.coerce.number().int().min(0).optional().nullable(),
  profile_text: z.string().optional(),
  specialties_text: z.string().optional(),
  staff_line_url: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  company_mobile_number: z.string().optional(),
  youtube_url: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  booking_url: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  line_notify_user_id: z.string().optional(),
  is_public: z.boolean().default(false),
  sort_order: z.coerce.number().int().default(0),
});

export type StaffFormData = z.infer<typeof staffSchema>;
