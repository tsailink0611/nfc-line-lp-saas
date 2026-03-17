type Props = {
  title: string;
  subtitle?: string;
};

export function SectionHeading({ title, subtitle }: Props) {
  return (
    <div className="mb-6">
      <h2 className="flex items-center gap-3 text-lg font-bold text-gray-900 font-[family-name:var(--font-serif)]">
        <span
          className="block h-6 w-1 rounded-full"
          style={{ backgroundColor: "var(--lp-secondary)" }}
        />
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 pl-4 text-sm text-gray-500">{subtitle}</p>
      )}
    </div>
  );
}
