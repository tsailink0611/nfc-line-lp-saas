import { z } from "zod";

export const companySettingsSchema = z.object({
  company_name: z.string().min(1, "会社名は必須です"),
  company_name_en: z.string().optional(),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "有効なカラーコードを入力してください"),
  secondary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "有効なカラーコードを入力してください").optional().or(z.literal("")),
  description: z.string().optional(),
});

export const lpSettingsSchema = z.object({
  hero_catch: z.string().optional(),
  hero_subcatch: z.string().optional(),
  cta_label: z.string().min(1, "CTA文言は必須です"),
  footer_text: z.string().optional(),
  theme_type: z.string().default("default"),
  industry_type: z.string().default("real_estate"),
  hero_background_url: z
    .string()
    .url("有効なURLを入力してください")
    .optional()
    .or(z.literal("")),
  webhook_url: z
    .string()
    .url("有効なURLを入力してください")
    .optional()
    .or(z.literal("")),
  webhook_secret: z.string().optional(),
});

export type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;
export type LpSettingsFormData = z.infer<typeof lpSettingsSchema>;
