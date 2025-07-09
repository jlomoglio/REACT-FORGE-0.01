/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{js,ts,jsx,tsx,html}'],
	theme: {
		extend: {
			gridTemplateColumns: {
				20: 'repeat(20, minmax(0, 1fr))',
			},
		},
	},
	corePlugins: {
		preflight: true,
	},
	plugins: []
}