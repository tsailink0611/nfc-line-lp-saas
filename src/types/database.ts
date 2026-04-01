export type Company = {
  id: string;
  company_code: string;
  company_name: string;
  company_name_en: string | null;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Store = {
  id: string;
  company_id: string;
  store_code: string;
  store_name: string;
  postal_code: string | null;
  address: string | null;
  phone: string | null;
  business_hours: string | null;
  regular_holiday: string | null;
  google_map_embed_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type StaffMember = {
  id: string;
  company_id: string;
  store_id: string;
  staff_code: string | null;
  slug: string;
  last_name: string;
  first_name: string;
  last_name_en: string | null;
  first_name_en: string | null;
  display_name: string | null;
  position: string | null;
  career_years: number | null;
  profile_text: string | null;
  specialties_text: string | null;
  main_image_url: string | null;
  sub_image_url: string | null;
  staff_line_url: string | null;
  company_mobile_number: string | null;
  youtube_url: string | null;
  booking_url: string | null;
  is_public: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type StaffBadge = {
  id: string;
  staff_member_id: string;
  label: string;
  sort_order: number;
};

export type Gallery = {
  id: string;
  staff_member_id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

export type Campaign = {
  id: string;
  company_id: string;
  store_id: string | null;
  title: string;
  summary: string | null;
  image_url: string | null;
  link_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_public: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type NfcToken = {
  id: string;
  company_id: string;
  staff_member_id: string;
  token: string;
  target_path: string;
  note: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LpSettings = {
  id: string;
  company_id: string;
  hero_catch: string | null;
  hero_subcatch: string | null;
  cta_label: string;
  footer_text: string | null;
  theme_type: string;
  industry_type: string | null;
  hero_background_url: string | null;
  webhook_url: string | null;
  webhook_secret: string | null;
  created_at: string;
  updated_at: string;
};

export type PageVisit = {
  id: string;
  staff_member_id: string;
  visited_at: string;
  user_agent: string | null;
  referrer: string | null;
};

export type NfcResolution = {
  id: string;
  nfc_token_id: string;
  company_id: string | null;
  event_type: string;
  resolved_at: string;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
};

export type AdminUser = {
  id: string;
  company_id: string;
  auth_user_id: string | null;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type StaffLpData = StaffMember & {
  store: Store;
  company: Company;
  badges: StaffBadge[];
  galleries: Gallery[];
  campaigns: Campaign[];
  lp_settings: LpSettings | null;
};
