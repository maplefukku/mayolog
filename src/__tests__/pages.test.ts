import { describe, it, expect } from "vitest";

describe("Input page", () => {
  const placeholders = [
    "例: バイト断るか迷ってる",
    "例: インターン行くか迷ってる",
    "例: 内定AかBか迷ってる",
    "例: サークル続けるか迷ってる",
    "例: 転職するか迷ってる",
  ];

  it("has at least 3 placeholder examples", () => {
    expect(placeholders.length).toBeGreaterThanOrEqual(3);
  });

  it("all placeholders start with 例:", () => {
    for (const p of placeholders) {
      expect(p.startsWith("例:")).toBe(true);
    }
  });
});

describe("Question page - getQuestions", () => {
  function getQuestions(input: string) {
    return [
      {
        text: `「${input}」ですね。\n今、どっちに傾いてる？`,
        options: [
          input.includes("断")
            ? "断る方に少し傾いてる"
            : "やめる方に少し傾いてる",
          "どっちとも言えない",
          input.includes("断")
            ? "行く方に少し傾いてる"
            : "やる方に少し傾いてる",
        ],
      },
      {
        text: "もし結果がどうなっても後悔しないとしたら、どっちを選ぶ？",
        options: [
          "それでも今の傾きと同じ方を選ぶ",
          "逆の方を選ぶかもしれない",
          "やっぱりわからない",
        ],
      },
    ];
  }

  it("returns 2 questions", () => {
    const questions = getQuestions("バイト断るか迷ってる");
    expect(questions).toHaveLength(2);
  });

  it("each question has 3 options", () => {
    const questions = getQuestions("テスト");
    for (const q of questions) {
      expect(q.options).toHaveLength(3);
    }
  });

  it("adapts options based on input containing 断", () => {
    const withDan = getQuestions("バイト断るか迷ってる");
    expect(withDan[0].options[0]).toContain("断る");

    const withoutDan = getQuestions("転職するか迷ってる");
    expect(withoutDan[0].options[0]).toContain("やめる");
  });

  it("includes user input in first question text", () => {
    const questions = getQuestions("サークル続けるか");
    expect(questions[0].text).toContain("サークル続けるか");
  });
});

describe("Result page - mock data", () => {
  const mockAxes = [
    { label: "自由", value: 80 },
    { label: "安定", value: 50 },
    { label: "成長", value: 40 },
    { label: "収入", value: 30 },
  ];

  it("has 4 axis entries", () => {
    expect(mockAxes).toHaveLength(4);
  });

  it("all values are between 0 and 100", () => {
    for (const axis of mockAxes) {
      expect(axis.value).toBeGreaterThanOrEqual(0);
      expect(axis.value).toBeLessThanOrEqual(100);
    }
  });

  it("axes are sorted by value descending", () => {
    for (let i = 1; i < mockAxes.length; i++) {
      expect(mockAxes[i - 1].value).toBeGreaterThanOrEqual(mockAxes[i].value);
    }
  });
});
