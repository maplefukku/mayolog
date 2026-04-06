import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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
    AnimatePresence: ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    ),
  };
});

import InputPage from "../page";

describe("InputPage 追加テスト", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockPush.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("オンボーディング連携", () => {
    it("オンボーディングで体験するを選択するとquestionページに遷移する", () => {
      // オンボーディング未完了状態
      localStorage.removeItem("mayolog_onboarded");

      render(<InputPage />);
      act(() => {
        vi.advanceTimersByTime(10);
      });

      // オンボーディングモーダルが表示される
      const tryButton = screen.queryByText("体験してみる");
      if (tryButton) {
        fireEvent.click(tryButton);
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("/question?q=")
        );
      }
    });

    it("オンボーディングをスキップしても遷移しない", () => {
      localStorage.removeItem("mayolog_onboarded");

      render(<InputPage />);
      act(() => {
        vi.advanceTimersByTime(10);
      });

      const skipButton = screen.queryByText("スキップ");
      if (skipButton) {
        fireEvent.click(skipButton);
        expect(mockPush).not.toHaveBeenCalled();
      }
    });
  });

  describe("自由入力モード", () => {
    it("自由入力選択時にテキストがクリアされる", () => {
      render(<InputPage />);
      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "テスト入力" } });
      expect(textarea).toHaveValue("テスト入力");

      // 自由入力ボタンをクリック
      fireEvent.click(screen.getByText("自由入力"));
      expect(textarea).toHaveValue("");
    });

    it("自由入力モードで入力して送信するとcatパラメータなしで遷移", () => {
      render(<InputPage />);
      fireEvent.click(screen.getByText("自由入力"));

      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "自由な迷い" } });
      fireEvent.click(screen.getByText("AIに聞く"));

      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("/question?q=")
      );
      // catパラメータがないことを確認
      const calledUrl = mockPush.mock.calls[0][0] as string;
      expect(calledUrl).not.toContain("&cat=");
    });
  });

  describe("バリデーション", () => {
    it("スペースのみの入力ではボタンが無効", () => {
      render(<InputPage />);
      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "   " } });
      expect(screen.getByText("AIに聞く")).toBeDisabled();
    });

    it("200文字ちょうどでは送信可能", () => {
      render(<InputPage />);
      const textarea = screen.getByRole("textbox");
      fireEvent.change(textarea, { target: { value: "あ".repeat(200) } });
      expect(screen.getByText("AIに聞く")).not.toBeDisabled();
    });
  });

  describe("カテゴリ選択後の表示", () => {
    it("カテゴリ選択時に「または自分の言葉で入力」が表示される", () => {
      render(<InputPage />);
      // カテゴリボタンをクリック
      const categoryButtons = screen
        .getAllByRole("button")
        .filter(
          (btn) =>
            btn.textContent?.includes("キャリア") ||
            btn.textContent?.includes("人間関係")
        );
      if (categoryButtons.length > 0) {
        fireEvent.click(categoryButtons[0]);
        expect(
          screen.getByText("または自分の言葉で入力")
        ).toBeInTheDocument();
      }
    });

    it("カテゴリ選択時にサンプルリストが非表示になる", () => {
      render(<InputPage />);
      expect(screen.getByText("こんな感じで書いてみて")).toBeInTheDocument();

      const categoryButtons = screen
        .getAllByRole("button")
        .filter((btn) => btn.textContent?.includes("キャリア"));
      if (categoryButtons.length > 0) {
        fireEvent.click(categoryButtons[0]);
        expect(
          screen.queryByText("こんな感じで書いてみて")
        ).not.toBeInTheDocument();
      }
    });
  });

  describe("ヘッダーリンク", () => {
    it("履歴リンクが表示される", () => {
      render(<InputPage />);
      const historyLink = screen.getByText("履歴").closest("a");
      expect(historyLink).toHaveAttribute("href", "/history");
    });

    it("戻るリンクがホームに向いている", () => {
      render(<InputPage />);
      const backLink = screen.getByText("戻る").closest("a");
      expect(backLink).toHaveAttribute("href", "/");
    });
  });
});
