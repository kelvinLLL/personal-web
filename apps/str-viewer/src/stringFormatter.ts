export interface StringLine {
  number: number;
  text: string;
  empty: boolean;
}

export interface StringStats {
  characters: number;
  visibleCharacters: number;
  lines: number;
}

export interface StringView {
  source: string;
  readable: string;
  lines: StringLine[];
  stats: StringStats;
  notices: string[];
}

export function formatStringForReading(source: string): StringView {
  const notices: string[] = [];
  const decoded = decodeSource(source, notices);
  const readable = normalizeLineEndings(normalizeSlashSeparators(decoded, notices));
  const lineTexts = readable.split("\n");
  const lines = lineTexts.map((text, index) => ({
    number: index + 1,
    text,
    empty: text.length === 0,
  }));

  return {
    source,
    readable,
    lines,
    stats: {
      characters: Array.from(readable).length,
      visibleCharacters: Array.from(readable.replace(/\s/g, "")).length,
      lines: lines.length,
    },
    notices,
  };
}

const quotePairs = new Map<string, string>([
  ['"', '"'],
  ["'", "'"],
  ["`", "`"],
  ["“", "”"],
  ["‘", "’"],
  ["「", "」"],
  ["『", "』"],
]);

function decodeSource(source: string, notices: string[]): string {
  const trimmed = source.trim();

  if (trimmed.length > 0) {
    const jsonValue = tryDecodeJson(trimmed);
    if (jsonValue.ok) {
      notices.push(jsonValue.notice);
      return jsonValue.value;
    }
  }

  const stripped = stripOuterQuotes(trimmed);
  if (stripped.changed) {
    notices.push("已移除外层引号");
  }

  return decodeEscapeSequences(stripped.value, notices);
}

function tryDecodeJson(source: string):
  | { ok: true; value: string; notice: string }
  | { ok: false } {
  try {
    const parsed: unknown = JSON.parse(source);

    if (typeof parsed === "string") {
      return {
        ok: true,
        value: parsed,
        notice: "已按 JSON 字符串解码",
      };
    }

    return {
      ok: true,
      value: JSON.stringify(parsed, null, 2) ?? String(parsed),
      notice: "已格式化 JSON",
    };
  } catch {
    return { ok: false };
  }
}

function stripOuterQuotes(source: string): { value: string; changed: boolean } {
  const first = source.at(0);
  const last = source.at(-1);

  if (!first || !last) {
    return { value: source, changed: false };
  }

  const expectedLast = quotePairs.get(first);
  if (expectedLast !== last) {
    return { value: source, changed: false };
  }

  return { value: source.slice(1, -1), changed: true };
}

function decodeEscapeSequences(source: string, notices: string[]): string {
  let changed = false;
  const decoded = source.replace(
    /\\(u\{([0-9a-fA-F]+)\}|u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2})|n|r|t|b|f|v|0|\\|"|'|`)/g,
    (match, token: string, codePoint: string | undefined, unicode: string | undefined, hex: string | undefined) => {
      changed = true;

      if (codePoint) {
        const parsedCodePoint = Number.parseInt(codePoint, 16);
        return Number.isNaN(parsedCodePoint) ? match : String.fromCodePoint(parsedCodePoint);
      }

      if (unicode) {
        return String.fromCharCode(Number.parseInt(unicode, 16));
      }

      if (hex) {
        return String.fromCharCode(Number.parseInt(hex, 16));
      }

      switch (token) {
        case "n":
          return "\n";
        case "r":
          return "\r";
        case "t":
          return "\t";
        case "b":
          return "\b";
        case "f":
          return "\f";
        case "v":
          return "\v";
        case "0":
          return "\0";
        case "\\":
          return "\\";
        case '"':
          return '"';
        case "'":
          return "'";
        case "`":
          return "`";
        default:
          return match;
      }
    },
  );

  if (changed) {
    notices.push("已解码常见转义符");
  }

  return decoded;
}

function normalizeSlashSeparators(source: string, notices: string[]): string {
  const normalized = source.replace(/\/n/g, "\n");
  if (normalized !== source) {
    notices.push("已把 /n 转为换行");
  }

  return normalized;
}

function normalizeLineEndings(source: string): string {
  return source.replace(/\r\n?/g, "\n");
}
