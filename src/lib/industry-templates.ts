export type LineBenefit = {
  title: string;
  description: string;
  color: string;
};

export type IndustryTemplate = {
  label: string;
  lineBenefits: LineBenefit[];
  nfcLabel: string;
};

const templates: Record<string, IndustryTemplate> = {
  real_estate: {
    label: "不動産・建築",
    lineBenefits: [
      {
        title: "新着物件情報",
        description: "希望条件に合う物件をいち早くお届け",
        color: "#e74c3c",
      },
      {
        title: "内見予約",
        description: "LINEから簡単に内見日程を調整",
        color: "#b09060",
      },
      {
        title: "ローン相談",
        description: "住宅ローンの事前審査をサポート",
        color: "#27ae60",
      },
      {
        title: "お得なキャンペーン",
        description: "限定特典やイベント情報を配信",
        color: "#3498db",
      },
    ],
    nfcLabel: "タッチで担当者ページへ",
  },
  construction: {
    label: "建築・リフォーム",
    lineBenefits: [
      {
        title: "施工事例",
        description: "最新の施工事例をお届け",
        color: "#e74c3c",
      },
      {
        title: "見積もり相談",
        description: "LINEから簡単にお見積り依頼",
        color: "#b09060",
      },
      {
        title: "アフターサポート",
        description: "メンテナンス時期をお知らせ",
        color: "#27ae60",
      },
      {
        title: "イベント情報",
        description: "完成見学会や相談会のご案内",
        color: "#3498db",
      },
    ],
    nfcLabel: "タッチで担当者ページへ",
  },
  automotive: {
    label: "自動車",
    lineBenefits: [
      {
        title: "リコール・重要情報",
        description: "お車の安全に関する情報をお届け",
        color: "#e74c3c",
      },
      {
        title: "新型車・限定モデル",
        description: "最新モデル情報をいち早く配信",
        color: "#b09060",
      },
      {
        title: "車検・メンテナンス",
        description: "点検時期を事前にお知らせ",
        color: "#27ae60",
      },
      {
        title: "キャンペーン情報",
        description: "季節のお得な情報を配信",
        color: "#3498db",
      },
    ],
    nfcLabel: "タッチで担当者ページへ",
  },
  general: {
    label: "汎用",
    lineBenefits: [
      {
        title: "最新情報",
        description: "サービスの最新情報をお届け",
        color: "#e74c3c",
      },
      {
        title: "かんたん予約",
        description: "LINEから簡単にご予約",
        color: "#b09060",
      },
      {
        title: "サポート",
        description: "お困りごとをLINEで気軽に相談",
        color: "#27ae60",
      },
      {
        title: "限定特典",
        description: "LINE登録者限定のお得な情報",
        color: "#3498db",
      },
    ],
    nfcLabel: "タッチで担当者ページへ",
  },
};

export function getIndustryTemplate(type: string | undefined): IndustryTemplate {
  return templates[type ?? "real_estate"] ?? templates.general;
}
