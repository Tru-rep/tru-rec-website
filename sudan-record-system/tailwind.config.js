/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf3f3',
          100: '#f9e0e0',
          200: '#f0bcbc',
          300: '#e08a8a',
          400: '#c94a4a',
          500: '#a82828',
          600: '#8B1E1E',
          700: '#731818',
          800: '#5c1313',
          900: '#450e0e',
        },
        charcoal: {
          DEFAULT: '#1c1c1c',
          light: '#2a2a2a',
          muted: '#3d3d3d',
        },
        surface: {
          DEFAULT: '#ececec',
          card: '#f5f5f5',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'system-ui', 'Segoe UI', 'Tahoma', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(0, 0, 0, 0.08)',
        'card-lg': '0 4px 20px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
