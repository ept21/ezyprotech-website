/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: 'class',
    content: [
        './src/app/**/*.{js,jsx,mdx}',
        './src/components/**/*.{js,jsx,mdx}',
        './src/lib/**/*.{js,jsx,mdx}',
    ],
    theme: {
        extend: {
            container: { center: true, padding: '1rem' },
            fontFamily: { sans: ['Inter','ui-sans-serif','system-ui'] },
            colors: {
                base: { 900:'#0A0B0F', 800:'#0F1117', 700:'#151827' },
                neon: { cyan:'#22d3ee', purple:'#7c3aed' }
            },
            boxShadow: {
                neon: '0 8px 30px -10px rgba(34,211,238,.35), 0 14px 50px -10px rgba(124,58,237,.25)',
                glass: '0 10px 40px -15px rgba(0,0,0,.5)',
            },
            borderRadius: { brand: '18px' },
            backgroundImage: {
                'grid-faint':'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
                'hero-radial':'radial-gradient(60% 60% at 50% 45%, rgba(34,211,238,0.2), rgba(124,58,237,0.15) 40%, transparent 70%)',
            },
            backgroundSize: { 'grid-size':'18px 18px' },
        },
    },
    plugins: [require('@tailwindcss/typography')], // ❌ אין line-clamp כאן
}
