import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#02040A",
          900: "#050913",
          850: "#08101F",
          800: "#0C1628",
          700: "#13213A",
          600: "#1E3150",
        },
        neon: {
          100: "#F1FFD6",
          200: "#DDFF94",
          300: "#CEFF5E",
          400: "#B8FF2C",
          500: "#9BE60F",
          600: "#76B300",
        },
        cyan: {
          300: "#8AF8FF",
          400: "#3DF2FF",
          500: "#00D4E6",
        },
        win: "#2BFF9E",
        loss: "#FF3D71",
      },
      fontFamily: {
        sans: ['"Unbounded"', "system-ui", "sans-serif"],
        display: ['"Unbounded"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono Variable"', "ui-monospace", "monospace"],
      },
      keyframes: {
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        scan: { "0%": { transform: "translateY(-100%)" }, "100%": { transform: "translateY(100%)" } },
        blink: { "0%,49%": { opacity: "1" }, "50%,100%": { opacity: "0" } },
        radar: { from: { transform: "rotate(0deg)" }, to: { transform: "rotate(360deg)" } },
        ping2: { "0%": { transform: "scale(1)", opacity: "0.9" }, "100%": { transform: "scale(2.6)", opacity: "0" } },
        flicker: {
          "0%,19%,21%,23%,25%,54%,56%,100%": { opacity: "1" },
          "20%,24%,55%": { opacity: "0.4" },
        },
        gradientMove: { "0%": { backgroundPosition: "0% 50%" }, "100%": { backgroundPosition: "200% 50%" } },
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        scan: "scan 6s linear infinite",
        blink: "blink 1s step-end infinite",
        radar: "radar 3s linear infinite",
        ping2: "ping2 1.6s cubic-bezier(0,0,0.2,1) infinite",
        flicker: "flicker 4s linear infinite",
        gradientMove: "gradientMove 4s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
