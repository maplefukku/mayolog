import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ProgressBar } from "../progress-bar";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock dilemma-store
const mockGetDilemmaLogs = vi.fn();
vi.mock("@/lib/dilemma-store", () => ({
  getDilemmaLogs: () => mockGetDilemmaLogs(),
}));

describe("ProgressBar", () => {
  beforeEach(() => {
    mockGetDilemmaLogs.mockReturnValue([]);
  });

  it("renders progress bar with count prop", () => {
    render(<ProgressBar count={2} />);
    expect(screen.getByTestId("progress-bar")).toBeInTheDocument();
  });

  it("shows remaining count message when count < 5", () => {
    render(<ProgressBar count={2} />);
    expect(screen.getByText("あと3回であなたの軸が見えます")).toBeInTheDocument();
    expect(screen.getByText("2/5")).toBeInTheDocument();
  });

  it("shows remaining 5 when count is 0", () => {
    render(<ProgressBar count={0} />);
    expect(screen.getByText("あと5回であなたの軸が見えます")).toBeInTheDocument();
    expect(screen.getByText("0/5")).toBeInTheDocument();
  });

  it("shows remaining 1 when count is 4", () => {
    render(<ProgressBar count={4} />);
    expect(screen.getByText("あと1回であなたの軸が見えます")).toBeInTheDocument();
    expect(screen.getByText("4/5")).toBeInTheDocument();
  });

  it("shows completion message when count is 5", () => {
    render(<ProgressBar count={5} />);
    expect(
      screen.getByText("あなたの軸が見えるようになりました！"),
    ).toBeInTheDocument();
  });

  it("shows completion message when count exceeds 5", () => {
    render(<ProgressBar count={10} />);
    expect(
      screen.getByText("あなたの軸が見えるようになりました！"),
    ).toBeInTheDocument();
  });

  it("reads from localStorage when count prop is not provided", async () => {
    mockGetDilemmaLogs.mockReturnValue([
      { id: "1", content: "a", answer: "b", createdAt: "" },
      { id: "2", content: "c", answer: "d", createdAt: "" },
      { id: "3", content: "e", answer: "f", createdAt: "" },
    ]);
    render(<ProgressBar />);
    await waitFor(() => {
      expect(screen.getByText("あと2回であなたの軸が見えます")).toBeInTheDocument();
    });
  });

  it("does not show progress bar numbers in completion state", () => {
    render(<ProgressBar count={5} />);
    expect(screen.queryByText("5/5")).not.toBeInTheDocument();
  });
});
