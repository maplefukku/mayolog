import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("recharts", () => {
  const MockResponsiveContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  );
  const MockLineChart = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="line-chart">{children}</div>
  );
  const MockLine = () => <div data-testid="line" />;
  const MockXAxis = () => <div />;
  const MockYAxis = () => <div />;
  const MockCartesianGrid = () => <div />;
  const MockTooltip = () => <div />;
  const MockLegend = () => <div />;

  return {
    ResponsiveContainer: MockResponsiveContainer,
    LineChart: MockLineChart,
    Line: MockLine,
    XAxis: MockXAxis,
    YAxis: MockYAxis,
    CartesianGrid: MockCartesianGrid,
    Tooltip: MockTooltip,
    Legend: MockLegend,
  };
});

import GrowthPage from "../growth/page";

beforeEach(() => {
  localStorage.clear();
});

describe("GrowthPage", () => {
  it("データがない場合に案内表示が出る", () => {
    render(<GrowthPage />);
    expect(screen.getByText("まだデータがありません")).toBeInTheDocument();
    expect(screen.getByText("迷いを記録する")).toBeInTheDocument();
  });

  it("ページタイトルが表示される", () => {
    render(<GrowthPage />);
    expect(screen.getByText("判断軸の進化")).toBeInTheDocument();
  });

  it("ホームリンクが表示される", () => {
    render(<GrowthPage />);
    expect(screen.getByText("ホーム")).toBeInTheDocument();
  });

  it("データがある場合にグラフが表示される", async () => {
    const snapshots = [
      {
        date: new Date().toISOString(),
        axes: [
          { label: "自由", value: 80 },
          { label: "安定", value: 60 },
        ],
      },
    ];
    localStorage.setItem("mayolog_axis_history", JSON.stringify(snapshots));

    render(<GrowthPage />);
    await waitFor(() => {
      expect(screen.getByText("進化グラフ")).toBeInTheDocument();
    });
    expect(screen.getByText("1件のスナップショットを記録済み")).toBeInTheDocument();
  });

  it("最新スナップショットの軸が比較表示される", async () => {
    const snapshots = [
      {
        date: new Date("2025-01-01").toISOString(),
        axes: [{ label: "自由", value: 70 }],
      },
      {
        date: new Date("2025-01-15").toISOString(),
        axes: [{ label: "自由", value: 90 }],
      },
    ];
    localStorage.setItem("mayolog_axis_history", JSON.stringify(snapshots));

    render(<GrowthPage />);
    await waitFor(() => {
      expect(screen.getByText("最新の判断軸")).toBeInTheDocument();
    });
    expect(screen.getByText("自由")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
    expect(screen.getByText("+20")).toBeInTheDocument();
  });
});
