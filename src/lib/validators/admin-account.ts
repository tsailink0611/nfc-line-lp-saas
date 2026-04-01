import { z } from "zod";

export const adminAccountSchema = z.object({
  company_id: z.string().uuid("会社IDが不正です"),
  name: z.string().min(1, "氏名は必須です"),
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z
    .string()
    .min(8, "パスワードは8文字以上で設定してください")
    .regex(/[A-Z]/, "大文字を1文字以上含めてください")
    .regex(/[0-9]/, "数字を1文字以上含めてください"),
});

export type AdminAccountFormData = z.infer<typeof adminAccountSchema>;
