import { z } from "zod";

export const campaignSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  summary: z.string().optional(),
  link_url: z.string().url("有効なURLを入力してください").optional().or(z.literal("")),
  store_id: z.string().uuid().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  is_public: z.boolean().default(false),
  sort_order: z.coerce.number().int().default(0),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;
