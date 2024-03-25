import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
	plugins: [react()],
	test: {
		browser: {
			enabled: true,
			name: 'safari',
		},

		globals: true,

		reporters: ['verbose'],

		include: ['__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		setupFiles: ['__tests__/setup.js'],
	},
	resolve: {
		alias: {
			'~': path.resolve(__dirname, './packages/'),
		},
	},
});
