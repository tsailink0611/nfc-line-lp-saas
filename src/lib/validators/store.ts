import { z } from "zod";

export const storeSchema = z.object({
  store_code: z.string().min(1, "店舗コードは必須です"),
  store_name: z.string().min(1, "店舗名は必須です"),
  postal_code: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  business_hours: z.string().optional(),
  regular_holiday: z.string().optional(),
  google_map_embed_url: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  is_active: z.boolean().default(true),
});

export type StoreFormData = z.infer<typeof storeSchema>;
