type GraphemeSegment = {
  segment: string;
};

type SegmenterInstance = {
  segment(value: string): Iterable<GraphemeSegment>;
};

type SegmenterConstructor = new (
  locale?: string,
  options?: { granularity: "grapheme" },
) => SegmenterInstance;

const Segmenter = (Intl as typeof Intl & { Segmenter?: SegmenterConstructor }).Segmenter;
const graphemeSegmenter = Segmenter ? new Segmenter("pt-BR", { granularity: "grapheme" }) : null;

function splitVisualCharacters(value: string) {
  if (!graphemeSegmenter) return Array.from(value.normalize("NFC"));
  return Array.from(graphemeSegmenter.segment(value), (item) => item.segment);
}

export function countVisualCharacters(value: string) {
  return splitVisualCharacters(value).length;
}

export function limitVisualCharacters(value: string, limit: number) {
  if (limit <= 0) return "";
  return splitVisualCharacters(value).slice(0, limit).join("");
}
