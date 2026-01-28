/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'yamaha-blue': '#0D1B54',
        'yamaha-red': '#DA291C',
        'status-reserved': '#BFDBFE',
        'status-confirmed': '#86EFAC',
        'status-in-progress': '#FDE047',
        'status-completed': '#D1D5DB',
        'status-available': '#FFFFFF',
        'status-unavailable': '#FCA5A5',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      minHeight: {
        'touch': '44px',
      },
      minWidth: {
        'touch': '44px',
      }
    },
  },
  plugins: [],
}
