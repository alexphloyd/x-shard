import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';
import cleaner from 'rollup-plugin-cleaner';
import { dts } from 'rollup-plugin-dts';
import size from 'rollup-plugin-size';
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import path from 'path';

/**
 * @type {import('rollup').RollupOptions}
 */
const core_config = [
	{
		input: `packages/core/src/core.ts`,
		plugins: [
			cleaner({ targets: ['packages/core/dist'] }),
			typescript({
				tsconfig: './tsconfig.json',
				include: ['packages/core/src/*', 'packages/utils/shared-types.ts'],
				declaration: false,
				module: 'ESNext',
			}),
			babel({
				babelHelpers: 'bundled',
			}),
			terser(),
			size(),
		],
		output: [
			{
				file: `packages/core/dist/x-shard.js`,
				format: 'es',
			},
			{
				file: `packages/core/dist/x-shard.cjs`,
				format: 'cjs',
			},
		],
	},
	{
		input: `packages/core/src/core.ts`,
		plugins: [
			dts(),
			alias({
				entries: [
					{
						find: '~/utils',
						replacement: path.resolve('./packages/utils'),
					},
				],
			}),
			size(),
		],
		output: [
			{
				file: `packages/core/dist/x-shard.d.ts`,
				format: 'es',
			},
		],
	},
];

/**
 * @type {import('rollup').RollupOptions}
 */
const react_config = [
	{
		input: `packages/react/src/core.ts`,
		plugins: [
			cleaner({ targets: ['packages/react/dist'] }),
			typescript({
				tsconfig: './tsconfig.json',
				include: ['packages/react/src/*', 'packages/utils/*'],
				declaration: false,
				module: 'ESNext',
			}),
			alias({
				entries: [
					{
						find: '~/utils',
						replacement: path.resolve('./packages/utils'),
					},
				],
			}),
			babel({
				babelHelpers: 'bundled',
			}),
			terser(),
			size(),
		],
		output: [
			{
				file: `packages/react/dist/x-shard-react.js`,
				format: 'es',
				exports: 'named',
			},
			{
				file: `packages/react/dist/x-shard-react.cjs`,
				format: 'cjs',
				exports: 'named',
			},
		],
		external: ['react', 'react-dom'],
	},
	{
		input: `packages/react/src/core.ts`,
		plugins: [
			dts(),
			alias({
				entries: [
					{
						find: '~/utils',
						replacement: path.resolve('./packages/utils'),
					},
					{
						find: '~/core',
						replacement: path.resolve('./packages/core'),
					},
				],
			}),
			size(),
		],
		output: [
			{
				file: `packages/react/dist/x-shard-react.d.ts`,
				format: 'es',
			},
		],
		external: ['react', 'react-dom'],
	},
];

export default [...core_config, ...react_config];
