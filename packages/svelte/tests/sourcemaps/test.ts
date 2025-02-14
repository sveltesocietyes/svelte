// @ts-nocheck TODO

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as svelte from 'svelte/compiler';
import { assert } from 'vitest';
import { getLocator } from 'locate-character';
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import { suite, type BaseTest } from '../suite.js';

interface SourcemapTest extends BaseTest {
	options?: { filename: string };
	compileOptions?: Partial<import('#compiler').CompileOptions>;
	preprocess?:
		| import('../../src/compiler/public').PreprocessorGroup
		| import('../../src/compiler/public').PreprocessorGroup[];
	js_map_sources?: string[];
	css_map_sources?: string[];
}

const { test, run } = suite<SourcemapTest>(async (config, cwd) => {
	const { test } = await import(`${cwd}/test.js`);

	const input_file = path.resolve(`${cwd}/input.svelte`);
	const output_name = '_actual';
	const output_base = path.resolve(`${cwd}/${output_name}`);

	const input_code = fs.readFileSync(input_file, 'utf-8');
	const input = {
		code: input_code,
		locate: getLocator(input_code),
		locate_1: getLocator(input_code, { offsetLine: 1 })
	};
	const preprocessed = await svelte.preprocess(
		input.code,
		config.preprocess || {},
		config.options || {
			filename: 'input.svelte'
		}
	);
	let { js, css } = svelte.compile(preprocessed.code, {
		filename: 'input.svelte',
		// filenames for sourcemaps
		sourcemap: preprocessed.map,
		outputFilename: `${output_name}.js`,
		cssOutputFilename: `${output_name}.css`,
		...(config.compile_options || {})
	});
	if (css === null) {
		css = { code: '', map: /** @type {any} */ null };
	}

	js.code = js.code.replace(/\(Svelte v\d+\.\d+\.\d+(-next\.\d+)?/, (match) =>
		match.replace(/\d/g, 'x')
	);

	fs.writeFileSync(`${output_base}.svelte`, preprocessed.code);
	if (preprocessed.map) {
		fs.writeFileSync(
			`${output_base}.svelte.map`,
			// TODO encode mappings for output - svelte.preprocess returns decoded mappings
			JSON.stringify(preprocessed.map, null, 2)
		);
	}
	fs.writeFileSync(`${output_base}.js`, `${js.code}\n//# sourceMappingURL=${output_name}.js.map`);
	fs.writeFileSync(`${output_base}.js.map`, JSON.stringify(js.map, null, 2));
	if (css.code) {
		fs.writeFileSync(
			`${output_base}.css`,
			`${css.code}\n/*# sourceMappingURL=${output_name}.css.map */`
		);
		fs.writeFileSync(`${output_base}.css.map`, JSON.stringify(css.map, null, '  '));
	}

	if (js.map) {
		assert.deepEqual(
			js.map.sources.slice().sort(),
			(config.js_map_sources || ['input.svelte']).sort(),
			'js.map.sources is wrong'
		);
	}
	if (css.map) {
		assert.deepEqual(
			css.map.sources.slice().sort(),
			(config.css_map_sources || ['input.svelte']).sort(),
			'css.map.sources is wrong'
		);
	}

	// use locate_1 with mapConsumer:
	// lines are one-based, columns are zero-based

	preprocessed.mapConsumer = preprocessed.map && new TraceMap(preprocessed.map);
	preprocessed.locate = getLocator(preprocessed.code);
	preprocessed.locate_1 = getLocator(preprocessed.code, { offsetLine: 1 });

	if (js.map) {
		const map = new TraceMap(js.map);
		js.mapConsumer = {
			originalPositionFor(loc) {
				return originalPositionFor(map, loc);
			}
		};
	}
	js.locate = getLocator(js.code);
	js.locate_1 = getLocator(js.code, { offsetLine: 1 });

	if (css.map) {
		const map = new TraceMap(css.map);
		css.mapConsumer = {
			originalPositionFor(loc) {
				return originalPositionFor(map, loc);
			}
		};
	}
	css.locate = getLocator(css.code || '');
	css.locate_1 = getLocator(css.code || '', { offsetLine: 1 });

	await test({ assert, input, preprocessed, js, css });
});

export { test };

await run(__dirname);
