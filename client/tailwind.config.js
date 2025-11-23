/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                blueprint: {
                    bg: '#002b59',
                    line: '#ffffff',
                },
                sandstone: {
                    bg: '#e6e0d4', // Warm beige
                    text: '#4a4036', // Dark brown
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            }
        },
    },
    plugins: [],
}
