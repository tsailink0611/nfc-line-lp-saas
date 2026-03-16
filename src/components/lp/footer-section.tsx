import type { Company, LpSettings } from "@/types/database";

type Props = {
  company: Company;
  lpSettings: LpSettings | null;
};

export function FooterSection({ company, lpSettings }: Props) {
  return (
    <footer className="border-t border-gray-200 bg-gray-900 px-6 py-8 text-center">
      {company.logo_url && (
        <img
          src={company.logo_url}
          alt={company.company_name}
          className="mx-auto h-8 object-contain brightness-0 invert"
        />
      )}
      <p className="mt-3 text-sm text-gray-400">{company.company_name}</p>
      {lpSettings?.footer_text && (
        <p className="mt-2 whitespace-pre-wrap text-xs text-gray-500">
          {lpSettings.footer_text}
        </p>
      )}
      <p className="mt-4 text-xs text-gray-600">
        &copy; {new Date().getFullYear()} {company.company_name}
      </p>
    </footer>
  );
}
