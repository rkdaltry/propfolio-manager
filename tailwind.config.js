/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                slate: {
                    50: 'rgb(248, 250, 252)',
                    100: 'rgb(241, 245, 249)',
                    200: 'rgb(226, 232, 240)',
                    300: 'rgb(203, 213, 225)',
                    400: 'rgb(148, 163, 184)',
                    500: 'rgb(100, 116, 139)',
                    600: 'rgb(71, 85, 105)',
                    700: 'rgb(51, 65, 85)',
                    800: 'rgb(30, 41, 59)',
                    850: 'rgb(22, 32, 49)',
                    900: 'rgb(15, 23, 42)',
                },
                blue: {
                    50: 'rgb(239, 246, 255)',
                    100: 'rgb(219, 234, 254)',
                    200: 'rgb(191, 219, 254)',
                    300: 'rgb(147, 197, 253)',
                    400: 'rgb(96, 165, 250)',
                    500: 'rgb(59, 130, 246)',
                    600: 'rgb(37, 99, 235)',
                    700: 'rgb(29, 78, 216)',
                },
                primary: {
                    50: 'rgb(239, 246, 255)',
                    100: 'rgb(219, 234, 254)',
                    500: 'rgb(59, 130, 246)',
                    600: 'rgb(37, 99, 235)',
                    700: 'rgb(29, 78, 216)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                main: ['Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-in': 'slideIn 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideIn: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}
