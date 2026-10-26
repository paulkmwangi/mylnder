/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        myinder: {
          navy: "#12366f",
          blue: "#4e7fbd",
          muted: "#7e9bc5",
          orange: "#ff5a12",
          pale: "#edf5ff"
        }
      },
      boxShadow: {
        soft: "0 8px 28px rgba(34, 83, 139, 0.08)"
      }
    }
  },
  plugins: []
};