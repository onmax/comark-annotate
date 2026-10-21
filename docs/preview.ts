// The playground's preview is a document of its own, so the plugins' inlined scripts run as they do on a real page.
// The build writes the first preset with it and the playground every edit after.
export const previewDocument = (html: string) =>
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">` +
  `<link rel="stylesheet" href="/style.css"><style>body{padding:2rem}body>main{margin:0}</style></head>` +
  `<body><main>${html}</main></body></html>`;
