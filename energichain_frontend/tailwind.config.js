/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mm: {
          canvas: "#141618",
          subtle: "#181A1D",
          surface: "#1E2024",
          elevated: "#25282D",
          hover: "#2D3137",
          border: "#2B2E33",
          borderLight: "#3B3E45",
          orange: "#F6851B",
          orangeHover: "#E2761B",
          blue: "#0376C9",
          blueLight: "#1098FC",
          green: "#10B981",
          greenHover: "#059669",
          textPrimary: "#FFFFFF",
          textSecondary: "#9FA6B2",
          textMuted: "#6A7380",
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'mm-card': '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
        'mm-hover': '0 8px 30px -4px rgba(0, 0, 0, 0.65)',
        'mm-glow': '0 0 24px rgba(246, 133, 27, 0.25)',
        'mm-glow-blue': '0 0 24px rgba(3, 118, 201, 0.3)',
      },
    },
  },
  plugins: [],
};
