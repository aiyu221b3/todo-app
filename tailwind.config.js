/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#F97316",
                "background-light": "#FFF9F9",
                "background-dark": "#0B0F1A",
            },
            fontFamily: {
                display: ["Playfair Display", "serif"],
                sans: ["Inter", "sans-serif"],
                crimson: ["Crimson Pro", "serif"],
            },
            borderRadius: {
                DEFAULT: "1.5rem",
                "ios": "3.5rem",
            },
        },
    },
    plugins: [],
}
