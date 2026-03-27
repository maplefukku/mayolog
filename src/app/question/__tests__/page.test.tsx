import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams("q=テスト&cat="),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/lib/templates", () => ({
  getCategoryByKey: () => null,
}));

import QuestionPage from "../page";

describe("QuestionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        questions: [
          {
            text: "テスト質問1",
            options: ["選択肢A", "選択肢B", "選択肢C"],
          },
          {
            text: "テスト質問2",
            options: ["選択肢D", "選択肢E", "選択肢F"],
          },
        ],
      }),
    } as Response);
  });

  it("スキップボタンが表示される", async () => {
    render(<QuestionPage />);
    const skipButton = await screen.findByText("スキップして結果を見る");
    expect(skipButton).toBeInTheDocument();
  });

  it("スキップボタンクリックでlocalStorageに記録される", async () => {
    render(<QuestionPage />);
    const skipButton = await screen.findByText("スキップして結果を見る");

    fireEvent.click(skipButton);

    const events = JSON.parse(
      localStorage.getItem("mayolog_skip_events") || "[]"
    );
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      question: "テスト質問1",
      input: "テスト",
    });
    expect(events[0].timestamp).toBeDefined();
  });

  it("スキップボタンクリックで結果画面に遷移する", async () => {
    render(<QuestionPage />);
    const skipButton = await screen.findByText("スキップして結果を見る");

    fireEvent.click(skipButton);

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining("/result?q=")
    );
  });

  it("スキップイベントが累積して記録される", async () => {
    localStorage.setItem(
      "mayolog_skip_events",
      JSON.stringify([{ question: "過去の質問", input: "過去", timestamp: "2026-01-01T00:00:00.000Z" }])
    );

    render(<QuestionPage />);
    const skipButton = await screen.findByText("スキップして結果を見る");

    fireEvent.click(skipButton);

    const events = JSON.parse(
      localStorage.getItem("mayolog_skip_events") || "[]"
    );
    expect(events).toHaveLength(2);
    expect(events[0].question).toBe("過去の質問");
    expect(events[1].question).toBe("テスト質問1");
  });
});
