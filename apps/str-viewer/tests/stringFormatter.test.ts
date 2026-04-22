import { describe, expect, it } from "vitest";
import { formatStringForReading } from "../src/stringFormatter";

describe("formatStringForReading", () => {
  it("decodes quoted JSON string escapes into readable lines", () => {
    const view = formatStringForReading('"第一行\\n第二行\\t缩进"');

    expect(view.readable).toBe("第一行\n第二行\t缩进");
    expect(view.lines).toEqual([
      { number: 1, text: "第一行", empty: false },
      { number: 2, text: "第二行\t缩进", empty: false },
    ]);
  });

  it("handles smart quote wrappers and slash-n separators", () => {
    const view = formatStringForReading("‘标题：测试/n正文：带有 “引用”’");

    expect(view.readable).toBe("标题：测试\n正文：带有 “引用”");
    expect(view.notices).toContain("已移除外层引号");
    expect(view.stats.lines).toBe(2);
  });

  it("decodes common escaped quotes and unicode without using eval", () => {
    const view = formatStringForReading("'say: \\'hi\\' \\u4F60\\u597D'");

    expect(view.readable).toBe("say: 'hi' 你好");
  });

  it("keeps malformed escape sequences visible", () => {
    const view = formatStringForReading("bad escape: \\q");

    expect(view.readable).toBe("bad escape: \\q");
  });
});
