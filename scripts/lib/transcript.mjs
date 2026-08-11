const TIMESTAMP_PATTERN = /(?:(\d{1,2}):)?(\d{2}):(\d{2})[.,](\d{3})/;

export function timestampToMs(value) {
  const match = value.trim().match(TIMESTAMP_PATTERN);
  if (!match) {
    throw new Error(`Horodatage invalide : ${value}`);
  }

  const [, hours = "0", minutes, seconds, milliseconds] = match;
  return (
    Number(hours) * 3_600_000 +
    Number(minutes) * 60_000 +
    Number(seconds) * 1_000 +
    Number(milliseconds)
  );
}

export function decodeEntities(value) {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

export function cleanCaptionText(value) {
  return decodeEntities(value)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseTranscript(input, format = "auto") {
  const normalized = input.replace(/^\uFEFF/, "").replaceAll("\r\n", "\n");
  const detectedFormat =
    format === "auto" ? (normalized.trimStart().startsWith("WEBVTT") ? "vtt" : "srt") : format;

  if (!new Set(["vtt", "srt"]).has(detectedFormat)) {
    throw new Error(`Format non pris en charge : ${detectedFormat}`);
  }

  const blocks = normalized.split(/\n{2,}/);
  const segments = [];

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const timingIndex = lines.findIndex((line) => line.includes("-->"));
    if (timingIndex === -1) continue;

    const [rawStart, rawEndWithSettings] = lines[timingIndex].split("-->");
    const rawEnd = rawEndWithSettings.trim().split(/\s+/)[0];
    const text = cleanCaptionText(lines.slice(timingIndex + 1).join(" "));
    if (!text) continue;

    const startMs = timestampToMs(rawStart);
    const endMs = timestampToMs(rawEnd);
    if (endMs <= startMs) {
      throw new Error(`Segment invalide : ${lines[timingIndex]}`);
    }

    const previous = segments.at(-1);
    if (previous && previous.text === text && previous.endMs >= startMs) {
      previous.endMs = Math.max(previous.endMs, endMs);
      continue;
    }

    segments.push({
      id: `seg-${String(segments.length + 1).padStart(5, "0")}`,
      startMs,
      endMs,
      text,
    });
  }

  return segments;
}

export function wordCount(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

export function chunkSegments(segments, maxWords = 1_200) {
  if (!Number.isInteger(maxWords) || maxWords < 50) {
    throw new Error("maxWords doit être un entier supérieur ou égal à 50.");
  }

  const chunks = [];
  let current = [];
  let currentWords = 0;

  for (const segment of segments) {
    const segmentWords = wordCount(segment.text);
    if (current.length && currentWords + segmentWords > maxWords) {
      chunks.push(current);
      current = [];
      currentWords = 0;
    }
    current.push(segment);
    currentWords += segmentWords;
  }

  if (current.length) chunks.push(current);
  return chunks;
}
