import plugin from "tailwindcss/plugin";

// Consistent border treatments per design system
export default plugin(function ({ addComponents, addUtilities, theme }) {
	addComponents({
		".border-base": {
			borderColor: theme("colors.black"),
			borderWidth: theme("borderWidth.DEFAULT"),
			borderStyle: "solid",
		},
		".hover\:border-strong:hover": {
			borderColor: theme("colors.black"),
			borderWidth: theme("borderWidth.2"),
			borderStyle: "solid",
		},
		".focus-ring": {
			outline: "none",
			boxShadow: theme("boxShadow.subtle"),
			borderColor: theme("colors.black"),
			borderWidth: theme("borderWidth.2"),
			borderStyle: "solid",
		},
		".divider": {
			borderColor: theme("colors.gray.200"),
			borderTopWidth: theme("borderWidth.1"),
			borderStyle: "solid",
		},
	});

	addUtilities({
		".radius-none": { borderRadius: theme("borderRadius.none") },
		".radius-sm": { borderRadius: theme("borderRadius.sm") },
		".radius-card": { borderRadius: theme("borderRadius.md") },
	});
});
