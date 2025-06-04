
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'serif-sc': ['Noto Serif SC', 'serif'],
				'sans': ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				valley: {
					stone: '#2c2c2c',
					mist: '#404040',
					echo: '#666666',
					whisper: '#999999',
					silk: '#f8f8f8'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'word-fall': {
					'0%': {
						transform: 'translateY(0) scale(1)',
						opacity: '1'
					},
					'50%': {
						transform: 'translateY(50vh) scale(0.8)',
						opacity: '0.3'
					},
					'100%': {
						transform: 'translateY(100vh) scale(0.6)',
						opacity: '0'
					}
				},
				'peak-rise': {
					'0%': {
						transform: 'translateY(20px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateY(0)',
						opacity: '1'
					}
				},
				'tension-pulse': {
					'0%, 100%': {
						transform: 'translateX(0)',
						opacity: '0.6'
					},
					'50%': {
						transform: 'translateX(1px)',
						opacity: '0.8'
					}
				},
				'underline-grow': {
					'0%': {
						width: '0%'
					},
					'100%': {
						width: '100%'
					}
				},
				'breath': {
					'0%, 100%': {
						transform: 'scale(1)',
						opacity: '0.4'
					},
					'50%': {
						transform: 'scale(1.05)',
						opacity: '0.6'
					}
				}
			},
			animation: {
				'word-fall': 'word-fall 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
				'peak-rise': 'peak-rise 0.8s cubic-bezier(0.2, 0, 0.2, 1) forwards',
				'tension-pulse': 'tension-pulse 2s ease-in-out infinite',
				'underline-grow': 'underline-grow 0.3s ease-out forwards',
				'breath': 'breath 4s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
