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

  it("decodes nested escaped newlines after JSON string parsing", () => {
    const view = formatStringForReading('"alpha\\\\n\\\\nbeta"');

    expect(view.readable).toBe("alpha\n\nbeta");
    expect(view.lines).toEqual([
      { number: 1, text: "alpha", empty: false },
      { number: 2, text: "", empty: true },
      { number: 3, text: "beta", empty: false },
    ]);
    expect(view.notices).toContain("已按 JSON 字符串解码");
    expect(view.notices).toContain("已解码常见转义符");
  });

  it("preserves repeated blank lines after mixed newline normalization", () => {
    const view = formatStringForReading("'row1\\r\\n\\r\\n/nrow2'");

    expect(view.readable).toBe("row1\n\n\nrow2");
    expect(view.lines).toEqual([
      { number: 1, text: "row1", empty: false },
      { number: 2, text: "", empty: true },
      { number: 3, text: "", empty: true },
      { number: 4, text: "row2", empty: false },
    ]);
    expect(view.stats.lines).toBe(4);
    expect(view.stats.blankLines).toBe(2);
  });

  it("surfaces readable nested string fields inside JSON structures", () => {
    const source = '{"event":"user_report","payload":"标题:\\\\n\\\\n登录失败\\\\n\\\\n用户: chen.li"}';
    const view = formatStringForReading(
      source,
    );

    expect(view.readable).toContain('  "payload": "标题:\\\\n\\\\n登录失败\\\\n\\\\n用户: chen.li"');
    expect(view.readable).not.toContain("payload =>");
    expect(view.jsonFields).toEqual([
      {
        path: "payload",
        readable: "标题:\n\n登录失败\n\n用户: chen.li",
      },
    ]);
    expect(view.modes.raw.text).toBe(source);
    expect(view.modes.readable.text).toBe(view.readable);
    expect(view.modes.jsonFields.text).toBe("payload =>\n标题:\n\n登录失败\n\n用户: chen.li");
    expect(view.modes.jsonFields.stats.blankLines).toBe(2);
    expect(view.notices).toContain("已格式化 JSON");
    expect(view.notices).toContain("已展开 JSON 字符串字段");
    expect(view.notices).toContain("已解码常见转义符");
  });

  it("marks JSON fields mode empty when no expandable string fields exist", () => {
    const view = formatStringForReading('{"ok":true,"count":2}');

    expect(view.modes.readable.text).toBe('{\n  "ok": true,\n  "count": 2\n}');
    expect(view.modes.jsonFields.empty).toBe(true);
    expect(view.modes.jsonFields.lines).toEqual([]);
    expect(view.jsonFields).toEqual([]);
  });

  it("keeps malformed escape sequences visible", () => {
    const view = formatStringForReading("bad escape: \\q");

    expect(view.readable).toBe("bad escape: \\q");
  });
});
