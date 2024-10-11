import {
  defineConfig,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  presets: [
    presetUno(),
    presetWebFonts({
      provider: "bunny",
      fonts: {},
    }),
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
  theme: {
    colors: {
      background: {
        DEFAULT: "hsl(var(--background))",
        secondary: "hsl(var(--background-secondary))",
      },
      foreground: {
        DEFAULT: "hsl(var(--foreground))",
        secondary: "hsl(var(--foreground-secondary))",
      },

      "muted-foreground": "hsl(var(--muted-foreground))",

      border: "hsl(var(--border))",
    },
  },
  shortcuts: {
    card: "bg-background-secondary text-foreground-secondary border border-border rounded-lg p-4",
  },
});
