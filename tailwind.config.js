/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      keyframes: {
        ambfPulse: {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)"
          },
          "40%": {
            opacity: "1",
            transform: "scale(1)"
          },
          "100%": {
            opacity: "0.9",
            transform: "scale(1.03)"
          }
        }
      },
      animation: {
        "ambf-pulse": "ambfPulse 1.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
}
