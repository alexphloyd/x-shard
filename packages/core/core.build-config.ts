import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['packages/core/src/core.ts'],
	outDir: 'packages/core/dist/',
	format: ['cjs', 'esm'],
	target: 'es6',
	splitting: true,
	minify: true,
	dts: true,
	clean: true,
});
