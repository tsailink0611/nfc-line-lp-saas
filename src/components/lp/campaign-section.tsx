import type { Campaign } from "@/types/database";

type Props = {
  campaigns: Campaign[];
};

export function CampaignSection({ campaigns }: Props) {
  if (campaigns.length === 0) return null;

  return (
    <section className="border-t border-gray-100 px-6 py-10">
      <h2 className="text-lg font-bold text-gray-900">キャンペーン</h2>
      <div className="mt-4 space-y-4">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
          >
            {campaign.image_url && (
              <img
                src={campaign.image_url}
                alt={campaign.title}
                className="h-40 w-full object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-bold text-gray-900">{campaign.title}</h3>
              {campaign.summary && (
                <p className="mt-1 text-sm text-gray-600">{campaign.summary}</p>
              )}
              {campaign.link_url && (
                <a
                  href={campaign.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
                >
                  詳細を見る
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
