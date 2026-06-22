import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // High Density Visual Theme configurations (e.g. scale-80 to scale-90 equivalent)
      spacing: {
        // High density customized spacings
        '4.5': '1.125rem',
        '5.5': '1.375rem',
      },
      fontSize: {
        // Reduced component text scales for high-density reading
        'xxs': '0.65rem',
      },
      scale: {
        '80': '0.80',
        '85': '0.85',
        '90': '0.90',
        '95': '0.95',
      }
    },
  },
  plugins: [],
};

export default config;
