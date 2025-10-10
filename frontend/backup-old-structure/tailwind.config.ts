import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/lib/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/stores/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/types/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			// Japanese theme colors
			colors: {
				// Primary brand colors
				primary: {
					50: '#eff6ff',
					100: '#dbeafe',
					200: '#bfdbfe',
					300: '#93c5fd',
					400: '#60a5fa',
					500: '#0066ff', // Main primary color
					600: '#0052cc',
					700: '#003d99',
					800: '#002966',
					900: '#001433',
					950: '#000a1a',
				},
				// Success colors (green)
				success: {
					50: '#f0fdf4',
					100: '#dcfce7',
					200: '#bbf7d0',
					300: '#86efac',
					400: '#4ade80',
					500: '#00a86b', // Main success color
					600: '#008a56',
					700: '#006b41',
					800: '#004d2c',
					900: '#002e17',
					950: '#001f0f',
				},
				// Warning colors (amber)
				warning: {
					50: '#fffbeb',
					100: '#fef3c7',
					200: '#fde68a',
					300: '#fcd34d',
					400: '#fbbf24',
					500: '#ff9500', // Main warning color
					600: '#cc7700',
					700: '#995900',
					800: '#663b00',
					900: '#331d00',
					950: '#1a0f00',
				},
				// Error colors (red)
				error: {
					50: '#fef2f2',
					100: '#fee2e2',
					200: '#fecaca',
					300: '#fca5a5',
					400: '#f87171',
					500: '#dc143c', // Main error color
					600: '#b01130',
					700: '#840e24',
					800: '#580a18',
					900: '#2c050c',
					950: '#160306',
				},
				// Japanese-inspired neutral colors
				neutral: {
					50: '#fafafa',
					100: '#f5f5f5',
					200: '#e5e5e5',
					300: '#d4d4d4',
					400: '#a3a3a3',
					500: '#737373',
					600: '#525252',
					700: '#404040',
					800: '#262626',
					900: '#171717',
					950: '#0a0a0a',
				},
				// Base colors for design system
				base: {
					white: '#ffffff',
					black: '#000000',
					gray: {
						50: '#f8f8f8',
						200: '#e5e5e5',
						600: '#999999',
						800: '#333333',
					},
				},
			},
			// Typography with Japanese font support
			fontFamily: {
				sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
				heading: ['var(--font-space-grotesk)', 'Space Grotesk', 'system-ui', 'sans-serif'],
				japanese: ['var(--font-noto-sans-jp)', 'Noto Sans JP', 'system-ui', 'sans-serif'],
			},
			// Custom spacing scale (8px base)
			spacing: {
				'0.5': '2px',
				'1': '4px',
				'1.5': '6px',
				'2': '8px',
				'2.5': '10px',
				'3': '12px',
				'3.5': '14px',
				'4': '16px',
				'5': '20px',
				'6': '24px',
				'7': '28px',
				'8': '32px',
				'9': '36px',
				'10': '40px',
				'11': '44px',
				'12': '48px',
				'14': '56px',
				'16': '64px',
				'20': '80px',
				'24': '96px',
				'28': '112px',
				'32': '128px',
				// Touch-friendly sizing
				'touch': '44px', // Minimum touch target
				'mobile-header': '56px',
				'desktop-header': '64px',
				'bottom-nav': '64px',
			},
			// Border radius
			borderRadius: {
				'none': '0px',
				'sm': '2px',
				'DEFAULT': '4px',
				'md': '6px',
				'lg': '8px',
				'xl': '12px',
				'2xl': '16px',
				'3xl': '24px',
				'full': '9999px',
			},
			// Box shadows
			boxShadow: {
				'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
				'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
				'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
				'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
				'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
				'2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
				'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
				'none': 'none',
			},
			// Screen breakpoints
			screens: {
				// Mobile-first breakpoints
				'mobile': '640px',    // Mobile: < 640px
				'tablet': '1024px',   // Tablet: 640px - 1024px
				'desktop': '1025px',  // Desktop: > 1024px
				
				// Legacy breakpoints for compatibility
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1536px',
			},
			// Animations
			animation: {
				// Mobile-specific animations
				'slide-up': 'slideUp 0.3s ease-out',
				'slide-right': 'slideRight 0.3s ease-out',
				'slide-down': 'slideDown 0.3s ease-out',
				'slide-left': 'slideLeft 0.3s ease-out',
				// Japanese-inspired animations
				'fade-in': 'fadeIn 0.5s ease-out',
				'fade-out': 'fadeOut 0.5s ease-out',
				'scale-in': 'scaleIn 0.3s ease-out',
				'scale-out': 'scaleOut 0.3s ease-out',
				'bounce-gentle': 'bounceGentle 0.6s ease-out',
				'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
				// Loading animations
				'spin-slow': 'spin 3s linear infinite',
				'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
			},
			keyframes: {
				slideUp: {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				slideRight: {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				slideDown: {
					'0%': { transform: 'translateY(-100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				slideLeft: {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' },
				},
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				fadeOut: {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' },
				},
				scaleIn: {
					'0%': { transform: 'scale(0.9)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
				scaleOut: {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(0.9)', opacity: '0' },
				},
				bounceGentle: {
					'0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
					'40%, 43%': { transform: 'translate3d(0, -8px, 0)' },
					'70%': { transform: 'translate3d(0, -4px, 0)' },
					'90%': { transform: 'translate3d(0, -2px, 0)' },
				},
				pulseGentle: {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' },
				},
			},
			// Z-index scale
			zIndex: {
				'0': '0',
				'10': '10',
				'20': '20',
				'30': '30',
				'40': '40',
				'50': '50',
				'auto': 'auto',
			},
			// Backdrop blur
			backdropBlur: {
				'xs': '2px',
				'sm': '4px',
				'DEFAULT': '8px',
				'md': '12px',
				'lg': '16px',
				'xl': '24px',
				'2xl': '40px',
				'3xl': '64px',
			},
		},
	},
	plugins: [
		require("./tailwind.plugins/border-treatments"),
		// Custom plugin for Japanese text utilities
		function({ addUtilities }: { addUtilities: any }) {
			const newUtilities = {
				'.jp': {
					fontFamily: 'var(--font-noto-sans-jp), Noto Sans JP, system-ui, sans-serif',
					lineHeight: '1.8',
				},
				'.heading': {
					fontFamily: 'var(--font-space-grotesk), Space Grotesk, system-ui, sans-serif',
					lineHeight: '1.2',
				},
				'.body': {
					fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif',
					lineHeight: '1.5',
				},
				'.border-base': {
					borderColor: 'rgb(229 229 229)',
					borderWidth: '1px',
				},
				'.border-strong': {
					borderColor: 'rgb(153 153 153)',
					borderWidth: '1px',
				},
			};
			addUtilities(newUtilities);
		},
	],
};

export default config;
