import { z } from "zod";

export const companySchema = z.object({
  company_name: z.string().min(1, "会社名は必須です"),
  company_code: z
    .string()
    .min(1, "会社コードは必須です")
    .regex(/^[A-Z0-9-]+$/, "英大文字・数字・ハイフンのみ使用できます"),
  company_name_en: z.string().optional(),
  industry_type: z.enum(["automotive", "real_estate", "construction", "general"], {
    errorMap: () => ({ message: "業種を選択してください" }),
  }),
  primary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "有効なカラーコードを入力してください")
    .default("#1a1a2e"),
  secondary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "有効なカラーコードを入力してください")
    .default("#c8a951"),
  description: z.string().optional(),
});

export type CompanyFormData = z.infer<typeof companySchema>;
