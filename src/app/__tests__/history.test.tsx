import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act, within } from "@testing-library/react";
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
  render(<HistoryPage />);
  act(() => { vi.advanceTimersByTime(10); });
  vi.useRealTimers();
  const user = userEvent.setup();
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
      // フィルターボタンとカテゴリタグの両方に出るのでgetAllByTextを使う
      const elements = screen.getAllByText("キャリア");
      expect(elements.length).toBeGreaterThanOrEqual(2); // フィルター + タグ
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
      { content: "転職についての迷い", category: "career" },
      { content: "友達との付き合い", category: "relationship" },
      { content: "勉強の方向性", category: "career" },
    ]);

    it("フィルターボタンが表示される", async () => {
      mockGetDilemmaLogs.mockReturnValue(logsWithCategories);
      await renderAndWait();
      // 「すべて」はフィルターにのみ存在
      expect(screen.getByText("すべて")).toBeInTheDocument();
      // 「キャリア」はフィルターとカードの両方に存在するので複数OK
      expect(screen.getAllByText("キャリア").length).toBeGreaterThanOrEqual(1);
    });

    it("カテゴリでフィルターできる", async () => {
      mockGetDilemmaLogs.mockReturnValue(logsWithCategories);
      const user = await renderAndWait();

      // フィルターの「すべて」ボタンの隣にある「キャリア」をクリック
      // フィルターはボタン内にラベル+件数がある
      const allFilterButtons = screen.getAllByRole("button");
      const careerFilterBtn = allFilterButtons.find(btn => {
        const text = btn.textContent;
        return text?.includes("キャリア") && text?.includes("2");
      });
      expect(careerFilterBtn).toBeTruthy();
      await user.click(careerFilterBtn!);

      expect(screen.getByText(/転職についての迷い/)).toBeInTheDocument();
      expect(screen.getByText(/勉強の方向性/)).toBeInTheDocument();
      expect(screen.queryByText(/友達との付き合い/)).not.toBeInTheDocument();
    });

    it("「すべて」で全件表示に戻る", async () => {
      mockGetDilemmaLogs.mockReturnValue(logsWithCategories);
      const user = await renderAndWait();

      // フィルター
      const allFilterButtons = screen.getAllByRole("button");
      const careerFilterBtn = allFilterButtons.find(btn => {
        const text = btn.textContent;
        return text?.includes("キャリア") && text?.includes("2");
      });
      await user.click(careerFilterBtn!);

      // 「すべて」で戻す
      await user.click(screen.getByText("すべて"));

      expect(screen.getByText(/転職についての迷い/)).toBeInTheDocument();
      expect(screen.getByText(/友達との付き合い/)).toBeInTheDocument();
      expect(screen.getByText(/勉強の方向性/)).toBeInTheDocument();
    });
  });

  describe("ログ削除", () => {
    it("削除ボタンでログが消える", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ id: "del-1", content: "消すログの内容" }])
      );
      const user = await renderAndWait();

      // カード内の削除ボタン（Trash2アイコン付き、size-7のボタン）
      const card = screen.getByText(/消すログの内容/).closest("div[class*='cursor-pointer']");
      expect(card).toBeTruthy();
      const deleteBtn = within(card!).getAllByRole("button").find(
        btn => btn.className.includes("size-7")
      );
      expect(deleteBtn).toBeTruthy();
      await user.click(deleteBtn!);

      expect(mockDeleteDilemmaLog).toHaveBeenCalledWith("del-1");
      await waitFor(() => {
        expect(screen.queryByText(/消すログの内容/)).not.toBeInTheDocument();
      });
    });
  });

  describe("詳細モーダル", () => {
    it("ログクリックでモーダルが表示される", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ content: "詳細テスト用の迷い", answer: "テスト回答", category: "daily" }])
      );
      const user = await renderAndWait();

      // カード本体をクリック
      const card = screen.getByText(/詳細テスト用の迷い/).closest("div[class*='cursor-pointer']");
      await user.click(card!);

      expect(screen.getByText("迷いの詳細")).toBeInTheDocument();
      expect(screen.getByText("迷いの内容")).toBeInTheDocument();
    });

    it("モーダルの閉じるボタンで閉じる", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ content: "閉じるテスト", answer: "テスト回答" }])
      );
      const user = await renderAndWait();

      const card = screen.getByText(/閉じるテスト/).closest("div[class*='cursor-pointer']");
      await user.click(card!);
      expect(screen.getByText("迷いの詳細")).toBeInTheDocument();

      // モーダル内の閉じるボタン（size-8のボタン）
      const modal = screen.getByText("迷いの詳細").closest("div[class*='max-w-md']");
      expect(modal).toBeTruthy();
      const closeBtn = within(modal!).getAllByRole("button").find(
        btn => btn.className.includes("size-8")
      );
      expect(closeBtn).toBeTruthy();
      await user.click(closeBtn!);

      await waitFor(() => {
        expect(screen.queryByText("迷いの詳細")).not.toBeInTheDocument();
      });
    });

    it("モーダルから削除できる（確認ダイアログ経由）", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ id: "modal-del", content: "モーダル削除テスト" }])
      );
      const user = await renderAndWait();

      const card = screen.getByText(/モーダル削除テスト/).closest("div[class*='cursor-pointer']");
      await user.click(card!);

      // 最初の「削除する」クリックで確認ダイアログが出る
      await user.click(screen.getByText("削除する"));
      expect(screen.getByText("この記録を削除しますか？")).toBeInTheDocument();
      expect(screen.getByText("この操作は取り消せません")).toBeInTheDocument();
      expect(mockDeleteDilemmaLog).not.toHaveBeenCalled();

      // 確認ダイアログの「削除する」で実際に削除
      await user.click(screen.getByText("削除する"));
      expect(mockDeleteDilemmaLog).toHaveBeenCalledWith("modal-del");
    });

    it("削除確認でキャンセルすると削除されない", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([{ id: "cancel-del", content: "キャンセルテスト" }])
      );
      const user = await renderAndWait();

      const card = screen.getByText(/キャンセルテスト/).closest("div[class*='cursor-pointer']");
      await user.click(card!);
      await user.click(screen.getByText("削除する"));

      expect(screen.getByText("この記録を削除しますか？")).toBeInTheDocument();
      await user.click(screen.getByText("キャンセル"));

      await waitFor(() => {
        expect(screen.queryByText("この記録を削除しますか？")).not.toBeInTheDocument();
      });
      expect(mockDeleteDilemmaLog).not.toHaveBeenCalled();
    });
  });

  describe("パターンインサイト", () => {
    it("3件以上のカテゴリ付きログで傾向が表示される", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([
          { content: "迷い1", category: "career" },
          { content: "迷い2", category: "career" },
          { content: "迷い3", category: "career" },
        ])
      );
      await renderAndWait();
      expect(screen.getByText("あなたの迷いの傾向")).toBeInTheDocument();
      expect(screen.getByText(/3件で最も多い/)).toBeInTheDocument();
    });

    it("カテゴリ付きが3件未満なら非表示", async () => {
      mockGetDilemmaLogs.mockReturnValue(
        makeLogs([
          { content: "迷い1", category: "career" },
          { content: "迷い2", category: "career" },
        ])
      );
      await renderAndWait();
      expect(screen.queryByText("あなたの迷いの傾向")).not.toBeInTheDocument();
    });
  });
});
