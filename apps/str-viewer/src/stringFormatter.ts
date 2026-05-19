export interface StringLine {
  number: number;
  text: string;
  empty: boolean;
}

export interface StringStats {
  characters: number;
  visibleCharacters: number;
  lines: number;
  blankLines: number;
}

export interface JsonStringField {
  path: string;
  readable: string;
}

export interface StringModeView {
  text: string;
  lines: StringLine[];
  stats: StringStats;
  empty: boolean;
}

export interface StringModeViews {
  raw: StringModeView;
  readable: StringModeView;
  jsonFields: StringModeView;
}

export interface StringView {
  source: string;
  readable: string;
  lines: StringLine[];
  stats: StringStats;
  notices: string[];
  jsonFields: JsonStringField[];
  modes: StringModeViews;
}

export function formatStringForReading(source: string): StringView {
  const notices: string[] = [];
  const decoded = decodeSource(source, notices);
  const modes: StringModeViews = {
    raw: createModeView(normalizeLineEndings(source), source.length === 0),
    readable: createModeView(decoded.readable, source.length === 0),
    jsonFields: createModeView(formatJsonFieldsText(decoded.jsonFields), decoded.jsonFields.length === 0),
  };

  return {
    source,
    readable: decoded.readable,
    lines: modes.readable.lines,
    stats: modes.readable.stats,
    notices,
    jsonFields: decoded.jsonFields,
    modes,
  };
}

function createModeView(text: string, empty: boolean): StringModeView {
  if (empty) {
    return {
      text,
      lines: [],
      stats: {
        characters: 0,
        visibleCharacters: 0,
        lines: 0,
        blankLines: 0,
      },
      empty: true,
    };
  }

  const lineTexts = text.split("\n");
  const lines = lineTexts.map((lineText, index) => ({
    number: index + 1,
    text: lineText,
    empty: lineText.length === 0,
  }));

  return {
    text,
    lines,
    stats: {
      characters: Array.from(text).length,
      visibleCharacters: Array.from(text.replace(/\s/g, "")).length,
      lines: lines.length,
      blankLines: lines.filter((line) => line.empty).length,
    },
    empty: false,
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

interface DecodedSource {
  readable: string;
  jsonFields: JsonStringField[];
}

interface CollectedJsonStringField extends JsonStringField {
  notices: string[];
}

function decodeSource(source: string, notices: string[]): DecodedSource {
  const trimmed = source.trim();

  if (trimmed.length > 0) {
    const jsonValue = tryDecodeJson(trimmed);
    if (jsonValue.ok) {
      pushNotice(notices, jsonValue.notice);

      if (jsonValue.kind === "json-string") {
        return {
          readable: unfoldReadableText(jsonValue.value, notices),
          jsonFields: [],
        };
      }

      return formatJsonStructureForReading(jsonValue.value, notices);
    }
  }

  const stripped = stripOuterQuotes(trimmed);
  if (stripped.changed) {
    pushNotice(notices, "已移除外层引号");
  }

  return {
    readable: unfoldReadableText(stripped.value, notices),
    jsonFields: [],
  };
}

function tryDecodeJson(source: string):
  | { ok: true; value: string; notice: string; kind: "json-string" }
  | { ok: true; value: unknown; notice: string; kind: "json-structure" }
  | { ok: false } {
  try {
    const parsed: unknown = JSON.parse(source);

    if (typeof parsed === "string") {
      return {
        ok: true,
        value: parsed,
        notice: "已按 JSON 字符串解码",
        kind: "json-string",
      };
    }

    return {
      ok: true,
      value: parsed,
      notice: "已格式化 JSON",
      kind: "json-structure",
    };
  } catch {
    return { ok: false };
  }
}

function formatJsonStructureForReading(source: unknown, notices: string[]): DecodedSource {
  const pretty = normalizeLineEndings(JSON.stringify(source, null, 2) ?? String(source));
  const readableFields: CollectedJsonStringField[] = [];

  collectReadableJsonStringFields(source, "", readableFields);
  if (readableFields.length === 0) {
    return {
      readable: pretty,
      jsonFields: [],
    };
  }

  pushNotice(notices, "已展开 JSON 字符串字段");

  for (const field of readableFields) {
    for (const notice of field.notices) {
      pushNotice(notices, notice);
    }
  }

  return {
    readable: pretty,
    jsonFields: readableFields.map(({ path, readable }) => ({ path, readable })),
  };
}

function formatJsonFieldsText(fields: JsonStringField[]): string {
  return fields.map((field) => `${field.path} =>\n${field.readable}`).join("\n\n");
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

function unfoldReadableText(source: string, notices: string[]): string {
  let current = source;
  let escapePasses = 0;
  let slashPasses = 0;

  for (let pass = 0; pass < 4; pass += 1) {
    const decoded = decodeEscapeSequencesOnce(current);
    if (decoded.changed) {
      escapePasses += 1;
    }

    const slashNormalized = normalizeSlashSeparatorsOnce(decoded.value);
    if (slashNormalized.changed) {
      slashPasses += 1;
    }

    const normalized = normalizeLineEndings(slashNormalized.value);
    if (normalized === current) {
      break;
    }

    current = normalized;
  }

  if (escapePasses > 0) {
    pushNotice(notices, "已解码常见转义符");
  }

  if (slashPasses > 0) {
    pushNotice(notices, "已把 /n 转为换行");
  }

  if (escapePasses + slashPasses > 1) {
    pushNotice(notices, "已展开多层转义");
  }

  return current;
}

function collectReadableJsonStringFields(
  source: unknown,
  path: string,
  fields: CollectedJsonStringField[],
): void {
  if (typeof source === "string") {
    const nestedNotices: string[] = [];
    const readable = unfoldReadableText(source, nestedNotices);

    if ((readable !== source || readable.includes("\n")) && path.length > 0) {
      fields.push({ path, readable, notices: nestedNotices });
    }

    return;
  }

  if (Array.isArray(source)) {
    source.forEach((item, index) => {
      const nextPath = path.length > 0 ? `${path}[${index}]` : `[${index}]`;
      collectReadableJsonStringFields(item, nextPath, fields);
    });
    return;
  }

  if (source && typeof source === "object") {
    for (const [key, value] of Object.entries(source)) {
      const nextPath = path.length > 0 ? `${path}.${key}` : key;
      collectReadableJsonStringFields(value, nextPath, fields);
    }
  }
}

function decodeEscapeSequencesOnce(source: string): { value: string; changed: boolean } {
  let changed = false;
  const value = source.replace(
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

  return { value, changed };
}

function normalizeSlashSeparatorsOnce(source: string): { value: string; changed: boolean } {
  const value = source.replace(/\/n/g, "\n");
  return { value, changed: value !== source };
}

function normalizeLineEndings(source: string): string {
  return source.replace(/\r\n?/g, "\n");
}

function pushNotice(notices: string[], notice: string): void {
  if (!notices.includes(notice)) {
    notices.push(notice);
  }
}
