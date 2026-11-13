/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        plumb: {
          green: '#0A4A3D',
          'green-dark': '#063028',
          'green-light': '#126150',
          ink: '#12201C',
          amber: '#B45309',
          'amber-light': '#FEF3C7',
          mineral: '#F2F5F3',
          'mineral-dark': '#E2E8E4',
          success: '#167A58',
          'success-light': '#D1FAE5',
          danger: '#C2413B',
          'danger-light': '#FEE2E2',
          muted: '#68756F',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'plumb': '12px',
        'plumb-lg': '14px',
        'plumb-sm': '8px',
      },
      boxShadow: {
        'plumb-subtle': '0 1px 3px 0 rgba(18, 32, 28, 0.05), 0 1px 2px -1px rgba(18, 32, 28, 0.05)',
        'plumb-card': '0 4px 6px -1px rgba(18, 32, 28, 0.04), 0 2px 4px -2px rgba(18, 32, 28, 0.04)',
        'plumb-modal': '0 20px 25px -5px rgba(18, 32, 28, 0.1), 0 8px 10px -6px rgba(18, 32, 28, 0.1)',
      }
    },
  },
  plugins: [],
}
