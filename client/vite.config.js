import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
	plugins: [react(), tailwindcss(),],
	server: {
		port: 5175 // ✅ change from 5173 to 5174 (or whatever you want)
	},
	resolve: {
		alias: {
			'os': 'os-browserify'  // ✅ Forces Vite to recognize "os" module
		}
	},

	build: {
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			external: ['xterm']  //✅ Ensures Vite treats "xterm" correctly
		}

	},
	base: './',
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
		}
	},
	define: {
		'process.env.NODE_ENV': '"development"', // or "production"
	},
})
