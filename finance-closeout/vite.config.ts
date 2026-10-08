import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	base: '/closeout/',
	plugins: [react()],
	build: {
		outDir: fileURLToPath(new URL('../frontend/closeout', import.meta.url)),
		emptyOutDir: true,
	},
	server: { allowedHosts: ['hjmmhw-5173.csb.app'] },
	test: { environment: 'node' },
});
