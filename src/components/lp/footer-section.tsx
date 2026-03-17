import Image from "next/image";
import type { Company, LpSettings } from "@/types/database";

type Props = {
  company: Company;
  lpSettings: LpSettings | null;
};

export function FooterSection({ company, lpSettings }: Props) {
  return (
    <footer
      className="px-6 py-8 text-center sm:px-8"
      style={{ backgroundColor: "var(--lp-primary)", color: "var(--lp-hero-sub)" }}
    >
      {company.logo_url && (
        <Image
          src={company.logo_url}
          alt={company.company_name}
          width={120}
          height={32}
          className="mx-auto h-8 w-auto object-contain brightness-0 invert"
        />
      )}
      <p className="mt-3 text-sm" style={{ color: "var(--lp-hero-text)" }}>
        {company.company_name}
      </p>
      {lpSettings?.footer_text && (
        <p className="mt-2 whitespace-pre-wrap text-xs opacity-60">
          {lpSettings.footer_text}
        </p>
      )}
      <p className="mt-4 text-xs opacity-40">
        &copy; {new Date().getFullYear()} {company.company_name}
      </p>
    </footer>
  );
}
