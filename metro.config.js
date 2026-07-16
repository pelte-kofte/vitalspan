const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);

// Deno may materialize npm compatibility packages under node_modules/.deno
// when its tooling is run from the repository root. npm remains the mobile
// application's package manager (package-lock.json is canonical), so letting
// Metro crawl that second dependency tree can make it select stale copies of
// Expo or React Native. Keep generated Deno artifacts outside Metro's graph.
const existingBlockList = config.resolver.blockList;
config.resolver.blockList = [
  ...(Array.isArray(existingBlockList)
    ? existingBlockList
    : existingBlockList
      ? [existingBlockList]
      : []),
  /[/\\]node_modules[/\\]\.deno[/\\].*/,
];

module.exports = config;
