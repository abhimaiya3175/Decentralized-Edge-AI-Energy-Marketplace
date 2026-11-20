const path = require("path");
const backendNodeModules = path.resolve(__dirname, "..", "..", "energichain_backend", "node_modules");
const { defineConfig } = require(path.join(backendNodeModules, "vite"));
const react = require(path.join(backendNodeModules, "@vitejs", "plugin-react"));

module.exports = defineConfig({
  root: __dirname,
  base: "/app/",
  resolve: {
    alias: [
      { find: /^react$/, replacement: path.join(backendNodeModules, "react") },
      { find: /^react\/jsx-runtime$/, replacement: path.join(backendNodeModules, "react", "jsx-runtime.js") },
      { find: /^react-dom$/, replacement: path.join(backendNodeModules, "react-dom") },
      { find: /^react-dom\/client$/, replacement: path.join(backendNodeModules, "react-dom", "client.js") },
      { find: /^ethers$/, replacement: path.join(backendNodeModules, "ethers") }
    ]
  },
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, "..", "public", "app"),
    emptyOutDir: true,
  },
});
