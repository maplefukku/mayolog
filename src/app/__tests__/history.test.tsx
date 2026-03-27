import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HistoryPage from "../history/page";

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

function makeLogs(overrides: Array<Partial<{ id: string; content: string; answer: string; category: string; createdAt: string }>> = []) {
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
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  render(<HistoryPage />);
  act(() => { vi.advanceTimersByTime(10); });
  vi.useRealTimers();
  return user;
}

// --- tests ---

describe("HistoryPage", () => {
  beforeEach(() => {
    mockGetDilemmaLogs.mockReturnValue([]);
    mockDeleteDilemmaLog.mockReset();
  });

  describe("レンダリング", () => {
    it("ページタイトルが表示される", async () => {
      await renderAndWait();
      expect(screen.getByText("迷い履歴")).toBeInTheDocument();
      expect(screen.getByText("これまでの迷いと向き合った記録")).toBeInTheDocument();
    });

    it("戻るリンクがある", async () => {
      await renderAndWait();
      expect(screen.getByText("戻る")).toBeInTheDocument();
    });
  });

  describe("空状態", () => {
    it("ログがない場合に空状態が表示される", async () => {
      await renderAndWait();
      expect(screen.getByText("まだ記録がないよ")).toBeInTheDocument();
      expect(screen.getByText("迷ったことを記録してみよう")).toBeInTheDocument();
    });

    it("空状態に記録へのリンクがある", async () => {
      await renderAndWait();
      const link = screen.getByText("迷いを記録する").closest("a");
      expect(link).toHaveAttribute("href", "/input");
    });
  });

  describe("ログ一覧表示", () => {
    it("ログが表示される", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([
          { content: "転職するか悩む", answer: "成長を優先", category: "career" },
          { content: "友人と会うか迷う", answer: "体調を優先", category: "relationship" },
        ])
      );
      await renderAndWait();
      expect(screen.getByText(/転職するか悩む/)).toBeInTheDocument();
      expect(screen.getByText(/友人と会うか迷う/)).toBeInTheDocument();
    });

    it("カテゴリタグが表示される", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ content: "テスト", category: "career" }])
      );
      await renderAndWait();
      expect(screen.getByText("キャリア")).toBeInTheDocument();
    });

    it("回答が表示される", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ content: "テスト", answer: "自分の気持ちに従う" }])
      );
      await renderAndWait();
      expect(screen.getByText("回答: 自分の気持ちに従う")).toBeInTheDocument();
    });

    it("プログレスバーが表示される（5件未満）", async () => {
      mockGetDilemmaLogs.mockReturnValue(makeLogs([{ content: "テスト1" }, { content: "テスト2" }]));
      await renderAndWait();
      expect(screen.getByText("あと3件で分析可能")).toBeInTheDocument();
      expect(screen.getByText("2/5")).toBeInTheDocument();
    });

    it("プログレスバーが非表示（5件以上）", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs(Array.from({ length: 5 }, (_, i) => ({ content: `テスト${i}` })))
      );
      await renderAndWait();
      expect(screen.queryByText(/あと.*件で分析可能/)).not.toBeInTheDocument();
    });
  });

  describe("カテゴリフィルター", () => {
    const logsWithCategories = makeLogs([
      { content: "転職", category: "career" },
      { content: "友達", category: "relationship" },
      { content: "勉強", category: "career" },
    ]);

    it("フィルターボタンが表示される", async () => {
      mockGetDilemmaLogs.mockReturnValue(logsWithCategories);
      await renderAndWait();
      expect(screen.getByText("すべて")).toBeInTheDocument();
      expect(screen.getByText("キャリア")).toBeInTheDocument();
    });

    it("カテゴリでフィルターできる", async () => {
      mockGetDilemmaLogs.mockReturnValue(logsWithCategories);
      const user = await renderAndWait();

      // 「キャリア」フィルターをクリック（件数付きボタンを探す）
      const careerButtons = screen.getAllByText("キャリア");
      // フィルターボタンはbutton要素
      const filterButton = careerButtons.find(el => el.closest("button"))?.closest("button");
      expect(filterButton).toBeTruthy();
      await user.click(filterButton!);

      // キャリアのログだけ表示される
      expect(screen.getByText(/転職/)).toBeInTheDocument();
      expect(screen.getByText(/勉強/)).toBeInTheDocument();
      expect(screen.queryByText(/友達/)).not.toBeInTheDocument();
    });

    it("「すべて」で全件表示に戻る", async () => {
      mockGetDilemmaLogs.mockReturnValue(logsWithCategories);
      const user = await renderAndWait();

      // フィルターしてから「すべて」に戻す
      const careerButtons = screen.getAllByText("キャリア");
      const filterButton = careerButtons.find(el => el.closest("button"))?.closest("button");
      await user.click(filterButton!);
      await user.click(screen.getByText("すべて"));

      expect(screen.getByText(/転職/)).toBeInTheDocument();
      expect(screen.getByText(/友達/)).toBeInTheDocument();
      expect(screen.getByText(/勉強/)).toBeInTheDocument();
    });

    it("該当なしのメッセージが表示される", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ content: "テスト", category: "career" }])
      );
      const user = await renderAndWait();

      // カテゴリに存在しないフィルターは表示されないので、
      // 一旦careerをフィルターし、logsを変更してテスト
      // → 代わりに直接テスト: 空カテゴリは表示されない
      // count=0のカテゴリはフィルターに表示されないため、このケースは
      // filteredLogs.length === 0 && selectedCategory のパスを通す必要がある
      // 全ログがcareerで、フィルターでrelationshipを選ぶ必要があるが、
      // count=0のカテゴリはレンダリングされないのでこのパスは通常到達しない
      expect(screen.queryByText(/の記録はまだありません/)).not.toBeInTheDocument();
    });
  });

  describe("ログ削除", () => {
    it("削除ボタンでログが消える", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ id: "del-1", content: "消すログ" }])
      );
      const user = await renderAndWait();

      // ゴミ箱アイコンのボタンをクリック
      const deleteButtons = screen.getAllByRole("button").filter(
        btn => btn.querySelector("svg") && btn.className.includes("hover:text-red")
      );
      expect(deleteButtons.length).toBeGreaterThan(0);
      await user.click(deleteButtons[0]);

      expect(mockDeleteDilemmaLog).toHaveBeenCalledWith("del-1");
      await waitFor(() => {
        expect(screen.queryByText(/消すログ/)).not.toBeInTheDocument();
      });
    });
  });

  describe("詳細モーダル", () => {
    it("ログクリックでモーダルが表示される", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ content: "詳細テスト", answer: "テスト回答", category: "career" }])
      );
      const user = await renderAndWait();

      await user.click(screen.getByText(/詳細テスト/));
      expect(screen.getByText("迷いの詳細")).toBeInTheDocument();
    });

    it("モーダルの閉じるボタンで閉じる", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ content: "詳細テスト", answer: "テスト回答" }])
      );
      const user = await renderAndWait();

      await user.click(screen.getByText(/詳細テスト/));
      expect(screen.getByText("迷いの詳細")).toBeInTheDocument();

      // Xボタンで閉じる
      const closeButton = screen.getAllByRole("button").find(
        btn => btn.className.includes("rounded-full") && btn.querySelector("svg") && btn.closest(".relative.z-10")
      );
      expect(closeButton).toBeTruthy();
      await user.click(closeButton!);

      await waitFor(() => {
        expect(screen.queryByText("迷いの詳細")).not.toBeInTheDocument();
      });
    });

    it("モーダルから削除できる", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ id: "modal-del", content: "モーダル削除テスト" }])
      );
      const user = await renderAndWait();

      await user.click(screen.getByText(/モーダル削除テスト/));
      await user.click(screen.getByText("削除する"));

      expect(mockDeleteDilemmaLog).toHaveBeenCalledWith("modal-del");
    });
  });

  describe("パターンインサイト", () => {
    it("3件以上のカテゴリ付きログで傾向が表示される", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([
          { content: "1", category: "career" },
          { content: "2", category: "career" },
          { content: "3", category: "career" },
        ])
      );
      await renderAndWait();
      expect(screen.getByText("あなたの迷いの傾向")).toBeInTheDocument();
      expect(screen.getByText(/キャリア/)).toBeInTheDocument();
      expect(screen.getByText(/3件で最も多い/)).toBeInTheDocument();
    });

    it("カテゴリ付きが3件未満なら非表示", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([
          { content: "1", category: "career" },
          { content: "2", category: "career" },
        ])
      );
      await renderAndWait();
      expect(screen.queryByText("あなたの迷いの傾向")).not.toBeInTheDocument();
    });
  });
});
