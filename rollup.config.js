import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';
import cleaner from 'rollup-plugin-cleaner';
import { dts } from 'rollup-plugin-dts';
import size from 'rollup-plugin-size';
import typescript from '@rollup/plugin-typescript';

/**
 * @type {import('rollup').RollupOptions}
 */
const core_config = [
	{
		input: `packages/core/src/core.ts`,
		plugins: [
			cleaner({ targets: ['packages/core/dist'] }),
			typescript({ include: ['packages/core/src/*'], declaration: false }),
			babel({
				babelHelpers: 'bundled',
			}),
			terser(),
			size(),
		],
		output: [
			{
				file: `packages/core/dist/core.js`,
				format: 'es',
			},
			{
				file: `packages/core/dist/core.cjs`,
				format: 'cjs',
			},
		],
	},
	{
		input: `packages/core/src/core.ts`,
		plugins: [dts(), size()],
		output: [
			{
				file: `packages/core/dist/core.d.ts`,
				format: 'es',
			},
		],
	},
];

export default [...core_config];
