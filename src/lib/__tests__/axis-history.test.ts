import { describe, it, expect, beforeEach } from "vitest";
import { getAxisHistory, addAxisSnapshot, getLatestSnapshot } from "../axis-history";

beforeEach(() => {
  localStorage.clear();
});

describe("axis-history", () => {
  it("初期状態で空配列を返す", () => {
    expect(getAxisHistory()).toEqual([]);
  });

  it("スナップショットを保存して取得できる", () => {
    const axes = [
      { label: "自由", value: 80 },
      { label: "安定", value: 60 },
    ];
    addAxisSnapshot(axes);
    const history = getAxisHistory();
    expect(history).toHaveLength(1);
    expect(history[0].axes).toEqual(axes);
    expect(history[0].date).toBeTruthy();
  });

  it("複数のスナップショットを時系列で保存できる", () => {
    addAxisSnapshot([{ label: "自由", value: 70 }]);
    addAxisSnapshot([{ label: "自由", value: 85 }]);
    const history = getAxisHistory();
    expect(history).toHaveLength(2);
    expect(history[0].axes[0].value).toBe(70);
    expect(history[1].axes[0].value).toBe(85);
  });

  it("getLatestSnapshotが最新のスナップショットを返す", () => {
    addAxisSnapshot([{ label: "成長", value: 50 }]);
    addAxisSnapshot([{ label: "成長", value: 90 }]);
    const latest = getLatestSnapshot();
    expect(latest?.axes[0].value).toBe(90);
  });

  it("データがない場合getLatestSnapshotはnullを返す", () => {
    expect(getLatestSnapshot()).toBeNull();
  });

  it("不正なlocalStorageデータの場合空配列を返す", () => {
    localStorage.setItem("mayolog_axis_history", "invalid json");
    expect(getAxisHistory()).toEqual([]);
  });
});
