import { createClient } from "@/lib/supabase/server";
import { createStaticClient } from "@/lib/supabase/static";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { StaffLpData } from "@/types/database";
import { generateThemeVars } from "@/lib/theme";
import { getIndustryTemplate } from "@/lib/industry-templates";
import { HeroSection } from "@/components/lp/hero-section";
import { ProfileSection } from "@/components/lp/profile-section";
import { SpecialtySection } from "@/components/lp/specialty-section";
import { StoreSection } from "@/components/lp/store-section";
import { CampaignSection } from "@/components/lp/campaign-section";
import { GallerySection } from "@/components/lp/gallery-section";
import { MapSection } from "@/components/lp/map-section";
import { LineBenefitsSection } from "@/components/lp/line-benefits";
import { LineStepsSection } from "@/components/lp/line-steps-section";
import { FooterSection } from "@/components/lp/footer-section";
import { FloatingCta } from "@/components/lp/floating-cta";
import { PageTracker } from "@/components/lp/page-tracker";
import { OfferBanner } from "@/components/lp/offer-banner";

// ISR: 60秒キャッシュ
export const revalidate = 60;

export async function generateStaticParams() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return [];

  const supabase = createStaticClient();
  const { data } = await supabase
    .from("staff_members")
    .select("slug")
    .eq("is_public", true);

  return (data ?? []).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: staff } = await supabase
    .from("staff_members")
    .select("last_name, first_name, position, company:companies(company_name)")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (!staff) return { title: "担当者が見つかりません" };

  const company = staff.company as unknown as { company_name: string } | null;
  const name = `${staff.last_name} ${staff.first_name}`;

  return {
    title: `${name} | ${company?.company_name ?? ""}`,
    description: `${name}（${staff.position ?? ""}）のページです。LINEでお気軽にご相談ください。`,
  };
}

async function getStaffData(slug: string): Promise<StaffLpPageData | null> {
  const supabase = await createClient();

  const { data: staff } = await supabase
    .from("staff_members")
    .select("*")
    .eq("slug", slug)
    .eq("is_public", true)
    .single();

  if (!staff) return null;

  const [
    { data: store },
    { data: company },
    { data: badges },
    { data: galleries },
    { data: campaigns },
    { data: lpSettings },
  ] = await Promise.all([
    supabase.from("stores").select("*").eq("id", staff.store_id).single(),
    supabase.from("companies").select("*").eq("id", staff.company_id).single(),
    supabase
      .from("staff_badges")
      .select("*")
      .eq("staff_member_id", staff.id)
      .order("sort_order"),
    supabase
      .from("galleries")
      .select("*")
      .eq("staff_member_id", staff.id)
      .order("sort_order"),
    supabase
      .from("campaigns")
      .select("*")
      .eq("company_id", staff.company_id)
      .eq("is_public", true)
      .or(`store_id.is.null,store_id.eq.${staff.store_id}`)
      .order("sort_order"),
    supabase
      .from("lp_settings")
      .select("*")
      .eq("company_id", staff.company_id)
      .single(),
  ]);

  if (!store || !company) return null;

  // 今月のタップ数（社会的証明バッジ用）
  let monthly_tap_count = 0;
  const { data: tokens } = await supabase
    .from("nfc_tokens")
    .select("id")
    .eq("staff_member_id", staff.id);

  if (tokens && tokens.length > 0) {
    const tokenIds = tokens.map((t) => t.id);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("nfc_resolutions")
      .select("*", { count: "exact", head: true })
      .in("nfc_token_id", tokenIds)
      .gte("resolved_at", thirtyDaysAgo);
    monthly_tap_count = count ?? 0;
  }

  return {
    ...staff,
    store,
    company,
    badges: badges ?? [],
    galleries: galleries ?? [],
    campaigns: campaigns ?? [],
    lp_settings: lpSettings,
    monthly_tap_count,
  };
}

export default async function StaffLpPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getStaffData(slug);

  if (!data) notFound();

  const industryType = data.lp_settings?.industry_type ?? "real_estate";
  const template = getIndustryTemplate(industryType);
  const ctaLabel = data.lp_settings?.cta_label ?? template.defaultCtaLabel;
  const themeVars = generateThemeVars(data.company, data.lp_settings);

  return (
    <div
      className="min-h-screen"
      style={{
        ...themeVars,
        background: `linear-gradient(135deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 85%, black) 100%)`,
      } as React.CSSProperties}
    >
      <div className="mx-auto max-w-2xl bg-white shadow-2xl lg:my-8 lg:rounded-2xl lg:overflow-hidden">
        <HeroSection staff={data} template={template} monthlyTapCount={data.monthly_tap_count} />
        <ProfileSection staff={data} />
        <SpecialtySection staff={data} specialtyLabel={template.specialtyLabel} />
        <CampaignSection campaigns={data.campaigns} />
        <GallerySection galleries={data.galleries} />
        <LineStepsSection template={template} lineUrl={data.staff_line_url} ctaLabel={ctaLabel} staffSlug={data.slug} />
        <StoreSection store={data.store} storeLabel={template.storeLabel} />
        <MapSection embedUrl={data.store.google_map_embed_url} />
        <LineBenefitsSection industryType={industryType} ctaLabel={ctaLabel} lineUrl={data.staff_line_url} staffSlug={data.slug} />
        <FooterSection company={data.company} lpSettings={data.lp_settings} />
<<<<<<< HEAD
        <FloatingCta lineUrl={data.staff_line_url} ctaLabel={ctaLabel} staffSlug={data.slug} />
        <PageTracker staffMemberId={data.id} />
        {data.lp_settings?.offer_banner_text && (
          <OfferBanner
            text={data.lp_settings.offer_banner_text}
            lineUrl={data.staff_line_url}
            ctaLabel={ctaLabel}
            staffId={data.id}
            staffSlug={data.slug}
          />
        )}
      </div>
    </div>
  );
}
