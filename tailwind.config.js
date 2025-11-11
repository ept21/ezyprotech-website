/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,jsx,ts,tsx,mdx}',
        './src/app/**/*.{js,jsx,ts,tsx,mdx}',
        './src/components/**/*.{js,jsx,ts,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50:'#e8f0ff',100:'#d9e7ff',200:'#b6ceff',300:'#8db1ff',
                    400:'#5b8cff',500:'#2f67ff',600:'#1f52db',700:'#1a45b5',
                    800:'#183c97',900:'#142f72'
                }
            },
            container: { center: true, padding: '1rem' }
        }
    },
    darkMode: 'media'
}
