const path = require("path");
const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");

module.exports = defineConfig({
  root: __dirname,
  base: "/app/",
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "..", "public", "app"),
    emptyOutDir: true,
  },
});
