import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Os valores abaixo são exatamente os que já estavam espalhados pelo app
      // como valores arbitrários. Nomeá-los não muda nada renderizado; passa a
      // existir um lugar único para mudá-los, como pede a regra 5 do CLAUDE.md.
      colors: {
        brand: {
          DEFAULT: "#E8650A",
          hover: "#FF781C",
        },
        surface: {
          // Fundo de campo e de área rebaixada.
          DEFAULT: "#0F0F0F",
          // Fundo de modal, card e área elevada.
          raised: "#1A1A1A",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
