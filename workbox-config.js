module.exports = {
  globDirectory: "dist",
  globPatterns: ["**/*.{html,js,css,png,svg,ico,json}"],
  swDest: "dist/sw.js",
  mode: "development",
  skipWaiting: true,
  clientsClaim: true,
  navigateFallback: "/index.html",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/cdn\.instant\.audio\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "station-assets",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30
        }
      }
    }
  ]
};
