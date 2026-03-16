import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { StaffLpData } from "@/types/database";
import { HeroSection } from "@/components/lp/hero-section";
import { ProfileSection } from "@/components/lp/profile-section";
import { SpecialtySection } from "@/components/lp/specialty-section";
import { StoreSection } from "@/components/lp/store-section";
import { CampaignSection } from "@/components/lp/campaign-section";
import { GallerySection } from "@/components/lp/gallery-section";
import { VideoSection } from "@/components/lp/video-section";
import { MapSection } from "@/components/lp/map-section";
import { LineCtaSection } from "@/components/lp/line-cta-section";
import { FooterSection } from "@/components/lp/footer-section";
import { FloatingCta } from "@/components/lp/floating-cta";

// ISR: 60秒キャッシュ
export const revalidate = 60;

export async function generateStaticParams() {
  const supabase = await createClient();
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

  const company = staff.company as { company_name: string } | null;
  const name = `${staff.last_name} ${staff.first_name}`;

  return {
    title: `${name} | ${company?.company_name ?? ""}`,
    description: `${name}（${staff.position ?? ""}）のページです。LINEでお気軽にご相談ください。`,
  };
}

async function getStaffData(slug: string): Promise<StaffLpData | null> {
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

  return {
    ...staff,
    store,
    company,
    badges: badges ?? [],
    galleries: galleries ?? [],
    campaigns: campaigns ?? [],
    lp_settings: lpSettings,
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

  const ctaLabel = data.lp_settings?.cta_label ?? "LINEで相談する";
  const staffName =
    data.display_name ?? `${data.last_name} ${data.first_name}`;

  return (
    <div className="mx-auto max-w-md bg-white shadow-xl">
      <HeroSection staff={data} />
      <ProfileSection staff={data} />
      <SpecialtySection staff={data} />
      <StoreSection store={data.store} />
      <CampaignSection campaigns={data.campaigns} />
      <GallerySection galleries={data.galleries} />
      <VideoSection youtubeUrl={data.youtube_url} />
      <MapSection embedUrl={data.store.google_map_embed_url} />
      <LineCtaSection
        lineUrl={data.staff_line_url}
        ctaLabel={ctaLabel}
        staffName={staffName}
      />
      <FooterSection company={data.company} lpSettings={data.lp_settings} />
      <FloatingCta lineUrl={data.staff_line_url} ctaLabel={ctaLabel} />
    </div>
  );
}
