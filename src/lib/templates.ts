export type CategoryKey = "career" | "relationship" | "time" | "self" | "daily";

export interface CategoryTemplate {
  key: CategoryKey;
  label: string;
  icon: string;
  templates: string[];
  deepDiveQuestions: string[];
}

export const categories: CategoryTemplate[] = [
  {
    key: "career",
    label: "キャリア",
    icon: "💼",
    templates: [
      "バイト断るか迷ってる",
      "インターン行くか迷ってる",
      "内定AかBか迷ってる",
      "転職するか迷ってる",
      "昇進を目指すか迷ってる",
    ],
    deepDiveQuestions: [
      "その選択、どっちが長期的に見て良さそう？",
      "仕事・勉強で大事にしていることは？",
    ],
  },
  {
    key: "relationship",
    label: "人間関係",
    icon: "👥",
    templates: [
      "友達と遊ぶか迷ってる",
      "恋人に相談するか迷ってる",
      "上司に意見するか迷ってる",
      "断るか承諾するか迷ってる",
    ],
    deepDiveQuestions: [
      "その決断、相手との関係にどう影響しそう？",
      "自分の気持ちを優先する？相手を優先する？",
    ],
  },
  {
    key: "time",
    label: "時間管理",
    icon: "⏰",
    templates: [
      "勉強するか遊ぶか迷ってる",
      "今日中にやるか明日に回すか迷ってる",
      "休憩するか頑張るか迷ってる",
    ],
    deepDiveQuestions: [
      "どっちが後で後悔なさそう？",
      "今の自分に必要なのは休息？成長？",
    ],
  },
  {
    key: "self",
    label: "自己実現",
    icon: "🌟",
    templates: [
      "新しい趣味を始めるか迷ってる",
      "スキルを学ぶか迷ってる",
      "チャレンジするか迷ってる",
    ],
    deepDiveQuestions: [
      "やってみたい気持ちはどれくらい？",
      "失敗したらどうなる？成功したらどうなる？",
    ],
  },
  {
    key: "daily",
    label: "日常",
    icon: "📅",
    templates: [
      "買うか買わないか迷ってる",
      "行くか行かないか迷ってる",
      "食べるか食べないか迷ってる",
    ],
    deepDiveQuestions: [
      "直感的にどっちを選びたい？",
      "今日の自分に必要なのはどっち？",
    ],
  },
];

export function getCategoryByKey(key: string): CategoryTemplate | undefined {
  return categories.find((c) => c.key === key);
}
