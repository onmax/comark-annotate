// Hand-drawn marks from AnnotationKit (https://annotationkit.vercel.app). Each one stretches over the annotated area.
export const marks = {
  box: {
    viewBox: "0 0 200 100",
    paths: [
      "M10 14C70 8 140 10 192 12",
      "M192 12C194 40 193 66 190 88",
      "M190 88C130 92 60 90 12 86",
      "M12 86C8 60 8 36 10 14",
    ],
  },
  circle: {
    viewBox: "0 0 200 100",
    paths: ["M46 16C12 24 6 56 42 74C92 96 172 84 190 52C200 30 156 10 98 10C74 10 56 12 44 17"],
  },
  underline: {
    viewBox: "0 0 200 60",
    paths: ["M8 32C58 22 142 40 192 26"],
  },
  highlight: {
    viewBox: "0 0 200 100",
    paths: ["M10 14C70 8 140 10 192 12C194 40 193 66 190 88C130 92 60 90 12 86C8 60 8 36 10 14Z"],
    fill: true,
  },
  cross: {
    viewBox: "0 0 100 100",
    paths: ["M20 20C40 42 60 62 80 82", "M80 20C60 42 40 62 20 82"],
  },
  check: {
    viewBox: "0 0 100 100",
    paths: ["M14 54C26 60 34 70 42 82C54 54 68 30 88 14"],
  },
} satisfies Record<string, { viewBox: string; paths: string[]; fill?: boolean }>;

export type Mark = keyof typeof marks;
