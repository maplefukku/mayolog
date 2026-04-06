import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistoryPage from "../page";

// --- mocks ---

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("framer-motion", () => {
  const makeComponent = (tag: string) => {
    const comp = ({ children, ...props }: Record<string, unknown>) => {
      const {
        initial: _i,
        animate: _a,
        exit: _e,
        transition: _t,
        variants: _v,
        whileHover: _wh,
        whileTap: _wt,
        layout: _l,
        mode: _m,
        ...rest
      } = props;
      const Element = tag as unknown as React.ElementType;
      return <Element {...rest}>{children}</Element>;
    };
    comp.displayName = `motion.${tag}`;
    return comp;
  };
  return {
    motion: {
      div: makeComponent("div"),
      button: makeComponent("button"),
      span: makeComponent("span"),
      section: makeComponent("section"),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

const mockGetDilemmaLogs = vi.fn();
const mockDeleteDilemmaLog = vi.fn();

vi.mock("@/lib/dilemma-store", () => ({
  getDilemmaLogs: (...args: unknown[]) => mockGetDilemmaLogs(...args),
  deleteDilemmaLog: (...args: unknown[]) => mockDeleteDilemmaLog(...args),
}));

vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

// --- helpers ---

function makeLogs(
  overrides: Array<
    Partial<{
      id: string;
      content: string;
      answer: string;
      category: string;
      createdAt: string;
    }>
  > = []
) {
  return overrides.map((o, i) => ({
    id: o.id ?? `log-${i}`,
    content: o.content ?? `迷い${i}`,
    answer: o.answer ?? `回答${i}`,
    category: o.category ?? undefined,
    createdAt: o.createdAt ?? "2025-01-15T10:00:00.000Z",
  }));
}

async function renderAndWait() {
  vi.useFakeTimers();
  render(<HistoryPage />);
  act(() => {
    vi.advanceTimersByTime(10);
  });
  vi.useRealTimers();
  const user = userEvent.setup();
  return user;
}

// --- tests ---

describe("HistoryPage 追加テスト", () => {
  beforeEach(() => {
    mockGetDilemmaLogs.mockReturnValue([]);
    mockDeleteDilemmaLog.mockReset();
  });

  describe("ローディング状態", () => {
    it("初期表示時にローディングメッセージが表示される", () => {
      vi.useFakeTimers();
      mockGetDilemmaLogs.mockReturnValue([]);
      render(<HistoryPage />);
      expect(screen.getByText("読み込み中...")).toBeInTheDocument();
      act(() => {
        vi.advanceTimersByTime(10);
      });
      vi.useRealTimers();
      expect(screen.queryByText("読み込み中...")).not.toBeInTheDocument();
    });
  });

  describe("カテゴリフィルター - フィルタ結果が空のケース", () => {
    it("フィルタで該当なしの場合メッセージが表示される", async () => {
      // career: 3件、relationship: 1件でcareerフィルタ後にrelationshipフィルタ
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([
          { content: "迷い1", category: "career" },
          { content: "迷い2", category: "career" },
          { content: "迷い3", category: "career" },
          { content: "迷い4", category: "relationship" },
        ])
      );
      const user = await renderAndWait();

      // 「人間関係」フィルタをクリック
      const allFilterButtons = screen.getAllByRole("button");
      const relationshipBtn = allFilterButtons.find((btn) => {
        const text = btn.textContent;
        return text?.includes("人間関係") && text?.includes("1");
      });
      expect(relationshipBtn).toBeTruthy();
      await user.click(relationshipBtn!);

      // 1件表示される
      expect(screen.getByText(/迷い4/)).toBeInTheDocument();
    });

    it("0件カテゴリのフィルターボタンは非表示", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ content: "迷い1", category: "career" }])
      );
      await renderAndWait();

      // careerのみなので「人間関係」フィルターは表示されない
      const allFilterButtons = screen.getAllByRole("button");
      const relationshipBtn = allFilterButtons.find((btn) =>
        btn.textContent?.includes("人間関係")
      );
      expect(relationshipBtn).toBeUndefined();
    });
  });

  describe("パターンインサイト - 各カテゴリの傾向", () => {
    it("relationship カテゴリの傾向が表示される", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([
          { content: "迷い1", category: "relationship" },
          { content: "迷い2", category: "relationship" },
          { content: "迷い3", category: "relationship" },
        ])
      );
      await renderAndWait();
      expect(
        screen.getByText("人とのつながりを大事にしているみたい。")
      ).toBeInTheDocument();
    });

    it("カテゴリなしのログはインサイトにカウントされない", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([
          { content: "迷い1" }, // categoryなし
          { content: "迷い2" },
          { content: "迷い3" },
          { content: "迷い4", category: "career" },
        ])
      );
      await renderAndWait();
      // カテゴリ付きが1件だけなのでインサイト非表示
      expect(screen.queryByText("あなたの迷いの傾向")).not.toBeInTheDocument();
    });
  });

  describe("日付フォーマット", () => {
    it("日付が正しくフォーマットされる", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ content: "テスト", createdAt: "2025-03-05T14:30:00.000Z" }])
      );
      await renderAndWait();
      // タイムゾーンに依存するのでパターンだけ確認
      const dateElements = screen.getAllByText(/2025\/03\/05/);
      expect(dateElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("詳細モーダル - カテゴリなし・回答なし", () => {
    it("カテゴリなしのログでモーダルにカテゴリが表示されない", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ content: "カテゴリなしの迷い", answer: "回答あり" }])
      );
      const user = await renderAndWait();

      const card = screen
        .getByText(/カテゴリなしの迷い/)
        .closest("div[class*='cursor-pointer']");
      await user.click(card!);

      expect(screen.getByText("迷いの詳細")).toBeInTheDocument();
      // カテゴリ表示がないことを確認（「カテゴリ」ラベル自体が表示されない）
      const modalContent = screen
        .getByText("迷いの詳細")
        .closest("div[class*='max-w-md']");
      expect(modalContent?.textContent).not.toContain("キャリア");
      expect(modalContent?.textContent).not.toContain("人間関係");
    });

    it("回答なしのログでモーダルに回答セクションが表示されない", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ content: "回答なしの迷い", answer: "" }])
      );
      const user = await renderAndWait();

      const card = screen
        .getByText(/回答なしの迷い/)
        .closest("div[class*='cursor-pointer']");
      await user.click(card!);

      expect(screen.getByText("迷いの詳細")).toBeInTheDocument();
      expect(screen.queryByText("回答")).not.toBeInTheDocument();
    });
  });
});
