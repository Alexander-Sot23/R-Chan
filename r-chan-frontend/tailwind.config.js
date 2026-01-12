/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        //Colores para modo oscuro
        'dark-bg-primary': '#0d1117',
        'dark-bg-secondary': '#161b22',
        'dark-bg-tertiary': '#21262d',
        'dark-border-primary': '#30363d',
        'dark-border-accent': '#58a6ff',
        'dark-text-primary': '#f0f6fc',
        'dark-text-secondary': '#8b949e',
        'dark-text-accent': '#58a6ff',
        
        //Colores para modo claro
        'light-bg-primary': '#f8fafc',
        'light-bg-secondary': '#f1f5f9',
        'light-bg-tertiary': '#e2e8f0',
        'light-border-primary': '#cbd5e1',
        'light-border-accent': '#3b82f6',
        'light-text-primary': '#1e293b',
        'light-text-secondary': '#64748b',
        'light-text-accent': '#3b82f6',
      },
    },
  },
  plugins: [],
}