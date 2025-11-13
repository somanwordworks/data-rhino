module.exports = {
    content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            keyframes: {
                // Smooth spinning animation
                spinSlow: {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                // Bounce + fade effect
                bouncePulse: {
                    '0%, 100%': { transform: 'translateY(0)', opacity: 0.8 },
                    '50%': { transform: 'translateY(-10px)', opacity: 1 },
                },
            },
            animation: {
                'spin-slow': 'spinSlow 3s linear infinite',
                'bounce-pulse': 'bouncePulse 1.5s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
