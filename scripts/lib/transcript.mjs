const TIMESTAMP_PATTERN = /(?:(\d{1,2}):)?(\d{2}):(\d{2})[.,](\d{3})/;
const MAX_ROLLING_SEGMENT_WORDS = 90;
const MAX_ROLLING_SEGMENT_DURATION_MS = 30_000;

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

function normalizedWords(value) {
  return value.split(/\s+/).map((word) =>
    word
      .toLocaleLowerCase("fr")
      .replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, ""),
  );
}

function mergeRollingCaption(previousText, currentText) {
  const previousWords = previousText.split(/\s+/);
  const currentWords = currentText.split(/\s+/);
  const normalizedPrevious = normalizedWords(previousText);
  const normalizedCurrent = normalizedWords(currentText);
  const maximumOverlap = Math.min(previousWords.length, currentWords.length);

  for (let overlap = maximumOverlap; overlap > 0; overlap -= 1) {
    const previousSuffix = normalizedPrevious.slice(-overlap);
    const currentPrefix = normalizedCurrent.slice(0, overlap);
    if (!previousSuffix.every((word, index) => word === currentPrefix[index])) continue;

    const wholeShortCue = overlap === Math.min(previousWords.length, currentWords.length);
    if (overlap < 3 && !wholeShortCue) return null;
    const uniqueText = currentWords.slice(overlap).join(" ");
    if (overlap === previousWords.length) return { mergedText: currentText, uniqueText };
    if (overlap === currentWords.length) return { mergedText: previousText, uniqueText: "" };
    return {
      mergedText: [...previousWords, ...currentWords.slice(overlap)].join(" "),
      uniqueText,
    };
  }

  return null;
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
    const isContiguous = previous && startMs - previous.endMs <= 100;
    const rollingMerge = isContiguous ? mergeRollingCaption(previous.text, text) : null;
    if (previous && rollingMerge) {
      const withinSizeLimit = wordCount(rollingMerge.mergedText) <= MAX_ROLLING_SEGMENT_WORDS;
      const withinDurationLimit = endMs - previous.startMs <= MAX_ROLLING_SEGMENT_DURATION_MS;
      if (withinSizeLimit && withinDurationLimit) {
        previous.text = rollingMerge.mergedText;
        previous.endMs = Math.max(previous.endMs, endMs);
        continue;
      }
      if (!rollingMerge.uniqueText) {
        previous.endMs = Math.max(previous.endMs, endMs);
        continue;
      }
      segments.push({
        id: `seg-${String(segments.length + 1).padStart(5, "0")}`,
        startMs,
        endMs,
        text: rollingMerge.uniqueText,
      });
      continue;
    }

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
