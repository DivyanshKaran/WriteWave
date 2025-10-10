export default {
	// Tailwind v4: keep config minimal; tokens live in @theme (CSS)
	plugins: [require("./tailwind.plugins/border-treatments")],
	theme: {
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
		extend: {
			// Touch-friendly sizing
			spacing: {
				'touch': '44px', // Minimum touch target
				'mobile-header': '56px',
				'desktop-header': '64px',
				'bottom-nav': '64px',
			},
			// Mobile-specific animations
			animation: {
				'slide-up': 'slideUp 0.3s ease-out',
				'slide-right': 'slideRight 0.3s ease-out',
				'slide-down': 'slideDown 0.3s ease-out',
			},
			keyframes: {
				slideUp: {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' },
				},
				slideRight: {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' },
				},
				slideDown: {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(0)' },
				},
			},
		},
	},
};
