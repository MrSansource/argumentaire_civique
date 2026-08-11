import corpusData from "../../content/corpus.json";

export type SourceStatus = "identified" | "candidate" | "unresolved";
export type ReviewStatus = "draft" | "reviewed" | "validated" | "rejected";

export type CorpusSource = {
  id: string;
  name: string;
  status: SourceStatus;
  kind: string;
  url: string | null;
  languages: string[];
  editorialNote: string;
};

export type CorpusSegment = {
  id: string;
  startMs: number;
  endMs: number;
  excerpt: string;
  paraphraseFr: string;
};

export type CorpusEpisode = {
  id: string;
  sourceId: string;
  title: string;
  url: string;
  publishedAt: string;
  language: string;
  segments: CorpusSegment[];
};

export type CorpusClaim = {
  id: string;
  episodeId: string;
  segmentIds: string[];
  type: string;
  statementFr: string;
  epistemicNote: string;
  status: ReviewStatus;
};

export type CorpusArgument = {
  id: string;
  title: string;
  thesisFr: string;
  premiseClaimIds: string[];
  themeIds: string[];
  reasoningPattern: string;
  objections: Array<{ title: string; summaryFr: string }>;
  adaptationConstraints: string[];
  status: ReviewStatus;
};

export type CorpusTheme = {
  id: string;
  label: string;
  description: string;
};

export type Corpus = {
  schemaVersion: number;
  updatedAt: string;
  themes: CorpusTheme[];
  sources: CorpusSource[];
  episodes: CorpusEpisode[];
  claims: CorpusClaim[];
  arguments: CorpusArgument[];
};

export const corpus = corpusData as unknown as Corpus;

export function formatTimestamp(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .filter((value, index) => index > 0 || value > 0)
    .map((value, index) => (index === 0 ? String(value) : String(value).padStart(2, "0")))
    .join(":");
}

export function youtubeUrlAt(url: string, milliseconds: number) {
  const target = new URL(url);
  target.searchParams.set("t", `${Math.floor(milliseconds / 1_000)}s`);
  return target.toString();
}
