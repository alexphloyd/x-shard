import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		browser: {
			enabled: true,
			name: 'safari',
		},

		globals: true,

		reporters: ['verbose'],
		cache: {
			dir: './node_modules/.vitest',
		},

		environment: 'jsdom',
		environmentOptions: {
			jsdom: {
				resources: 'usable',
			},
		},

		include: ['__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		setupFiles: ['__tests__/setup.js'],
	},
});
