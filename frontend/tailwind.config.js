/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0F766E",   // Teal
                    hover: "#115E59",
                },
                secondary: {
                    DEFAULT: "#2563EB",   // Blue
                    hover: "#1D4ED8",
                },
                success: "#22C55E",
                warning: "#F59E0B",
                danger: "#EF4444",

                dark: {
                    bg: "#0F172A",
                    card: "#1E293B",
                },

                glass: {
                    DEFAULT: "rgba(255,255,255,0.05)",
                    border: "rgba(255,255,255,0.10)",
                }
            },

            fontFamily: {
                outfit: ["Outfit", "sans-serif"],
            },

            backdropBlur: {
                glass: "12px",
            },

            boxShadow: {
                primary: "0 10px 30px rgba(15,118,110,0.25)",
                card: "0 8px 24px rgba(0,0,0,0.15)",
            },

            borderRadius: {
                xl: "1rem",
                "2xl": "1.25rem",
            },

            animation: {
                fade: "fadeIn 0.4s ease-in-out",
                float: "float 3s ease-in-out infinite",
            },

            keyframes: {
                fadeIn: {
                    "0%": {
                        opacity: "0",
                        transform: "translateY(10px)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateY(0)",
                    },
                },

                float: {
                    "0%,100%": {
                        transform: "translateY(0px)",
                    },
                    "50%": {
                        transform: "translateY(-6px)",
                    },
                },
            },
        },
    },
    plugins: [],
};