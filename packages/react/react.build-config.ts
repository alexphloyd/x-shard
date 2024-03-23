import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['packages/react/src/core.ts'],
	outDir: 'packages/react/dist/',
	format: ['cjs', 'esm'],
	target: 'es6',
	splitting: true,
	minify: 'terser',
	dts: true,
	clean: true,
	platform: 'browser',
});
