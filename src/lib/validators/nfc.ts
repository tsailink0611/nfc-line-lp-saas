import { z } from "zod";

export const nfcTokenSchema = z.object({
  staff_member_id: z.string().uuid("担当者を選択してください"),
  note: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type NfcTokenFormData = z.infer<typeof nfcTokenSchema>;
