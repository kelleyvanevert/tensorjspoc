import { Config } from "tailwindcss";
import { colors } from "./src/components/colors";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors,
    },
    animation: {
      "spin-fast": "spin 0.8s linear infinite",
      "appear-fade": "appear-fade 0.3s ease 1 forwards",
      "appear-slide-up": "appear-slide-up 0.2s ease 1 forwards",
      "appear-slide-right": "appear-slide-right 0.2s ease 1 forwards",
      zoom: "zoom 0.3s ease 1 forwards",
      "highlight-zoom-once": "highlight-zoom 1500ms 500ms ease-in-out",
    },
    keyframes: {
      "appear-fade": {
        from: {
          opacity: "0",
        },
        to: {
          opacity: "1",
        },
      },
      "appear-slide-up": {
        from: {
          opacity: "0",
          transform: `translate(0, 20px)`,
        },
        to: {
          opacity: "1",
          transform: `translate(0, 0)`,
        },
      },
      zoom: {
        from: {
          opacity: "0",
          transform: `scale(0)`,
        },
        to: {
          opacity: "1",
          transform: `scale(1)`,
        },
      },
      "highlight-zoom": {
        "0%": { transform: "scale(1)" },
        "30%": { transform: "scale(1.7)" },
        "70%": { transform: "scale(1.7)" },
        "100%": { transform: "scale(1)" },
      },
    },
  },
  plugins: [],
};

export default config;
