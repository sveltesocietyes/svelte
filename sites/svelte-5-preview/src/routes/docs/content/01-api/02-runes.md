---
title: Runas
---

Svelte 5 introduce _runes_, un poderoso conjunto de primitivas para controlar la reactividad dentro de tus componentes Svelte y — por primera vez — dentro de módulos `.svelte.js` y `.svelte.ts`.

Las runas son símbolos similares a funciones que proporcionan instrucciones al compilador de Svelte. No necesitas importarlas de ningún lugar — cuando usas Svelte, son parte del lenguaje.

Cuando [optas por el modo runas](#how-to-opt-in), las características no-runas enumeradas en las secciones 'Lo que esto reemplaza' ya no están disponibles.

> ¡Revisa la publicación del blog [Introducción a las runas](https://svelte-es.dev/blog/runes) antes de sumergirte en los documentos!

## `$state`

El estado reactivo se declara con la runa `$state`:

```svelte
<script>
	let count = $state(0);
</script>

<button on:click={() => count++}>
	clicks: {count}
</button>
```

También puedes usar `$state` en campos de clases (tanto públicos como privados):

```js
// @errors: 7006 2554
class Todo {
	done = $state(false);
	text = $state();

	constructor(text) {
		this.text = text;
	}
}
```

> En este ejemplo, el compilador transforma `done` y `text` en métodos `get`/`set` en el prototipo de la clase haciendo referencia a campos privados

Los objetos y arreglos [se hacen profundamente reactivos](/#H4sIAAAAAAAAE42QwWrDMBBEf2URhUhUNEl7c21DviPOwZY3jVpZEtIqUBz9e-UUt9BTj7M784bdmZ21wciq48xsPyGr2MF7Jhl9-kXEKxrCoqNLQS2TOqqgPbWd7cgggU3TgCFCAw-RekJ-3Et4lvByEq-drbe_dlsPichZcFYZrT6amQto2pXw5FO88FUYtG90gUfYi3zvWrYL75vxL57zfA07_zfr23k1vjtt-aZ0bQTcbrDL5ZifZcAxKeS8lzDc8X0xDhJ2ItdbX1jlOZMb9VnjyCoKCfMpfwG975NFVwEAAA==):

```svelte
<script>
	let numbers = $state([1, 2, 3]);
</script>

<button onclick={() => numbers.push(numbers.length + 1)}>
	push
</button>

<button onclick={() => numbers.pop()}> pop </button>

<p>
	{numbers.join(' + ') || 0}
	=
	{numbers.reduce((a, b) => a + b, 0)}
</p>
```

### Lo que esto reemplaza

En el modo sin runas, una declaración `let` se trata como estado reactivo si se actualiza en algún momento. A diferencia de `$state(...)`, que funciona en cualquier lugar de tu aplicación, `let` solo se comporta de esta manera en el nivel superior de un componente.

## `$state.frozen`

El estado declarado con `$state.frozen` no puede ser mutado; solo puede ser _reasignado_. En otras palabras, en lugar de asignar a una propiedad de un objeto, o usar un método de arreglo como `push`, reemplaza el objeto o arreglo por completo si deseas actualizarlo:

```diff
<script>
-	let numbers = $state([1, 2, 3]);
+	let numbers = $state.frozen([1, 2, 3]);
</script>

-<button onclick={() => numbers.push(numbers.length + 1)}>
+<button onclick={() => numbers = [...numbers, numbers.length + 1]}>
	push
</button>

-<button onclick={() => numbers.pop()}> pop </button>
+<button onclick={() => numbers = numbers.slice(0, -1)}> pop </button>

<p>
	{numbers.join(' + ') || 0}
	=
	{numbers.reduce((a, b) => a + b, 0)}
</p>
```

Esto puede mejorar el rendimiento con arreglos y objetos grandes que de todos modos no planeabas mutar, ya que evita el costo de hacerlos reactivos. Ten en cuenta que el estado congelado puede _contener_ estado reactivo (por ejemplo, un arreglo congelado de objetos reactivos).

> Los objetos y arreglos pasados a `$state.frozen` serán congelados superficialmente usando `Object.freeze()`. Si no deseas esto, pasa en su lugar una copia del objeto o arreglo.

## `$derived`

El estado computado se declara con la runa `$derived`:

```diff
<script>
	let count = $state(0);
+	let doubled = $derived(count * 2);
</script>

<button on:click={() => count++}>
	{doubled}
</button>

+<p>{count} doubled is {doubled}</p>
```

La expresión dentro de `$derived(...)` debe estar libre de efectos secundarios. Svelte prohibirá cambios de estado (por ejemplo, `count++`) dentro de expresiones derivadas.

Al igual que con `$state`, puedes marcar campos de clase como `$derived`.

### Lo que esto reemplaza

Si el valor de una variable reactiva se está calculando, debería ser reemplazado por $derived, ya sea que anteriormente tomara la forma de $: double = count * 2 o $: { double = count * 2; }. Hay algunas diferencias importantes que debes tener en cuenta:

- Con la runa `$derived`, el valor de `double` siempre está actualizado (por ejemplo, si actualizas `count` y luego haces `console.log(double)`). Con las declaraciones `$:`, los valores no se actualizan hasta justo antes de que Svelte actualice el DOM
- En modo sin runas, Svelte determina las dependencias de `double` analizando estáticamente la expresión `count * 2`. Si la refactorizas...
  ```js
  // @errors: 2304
  const doubleCount = () => count * 2;
  $: double = doubleCount();
  ```
  ...esa información de dependencia se pierde y `double` ya no se actualizará cuando `count` cambie. Con runas, las dependencias se rastrean en tiempo de ejecución.
- En el modo sin runas, las declaraciones reactivas se ordenan _topológicamente_, lo que significa que en un caso como este...
  ```js
  // @errors: 2304
  $: triple = double + count;
  $: double = count * 2;
  ```
  ...`double` se calculará primero a pesar del orden en el código. En el modo de runas, `triple` no puede referenciar a `double` antes de que haya sido declarado.

## `$derived.call`

Sometimes you need to create complex derivations that don't fit inside a short expression. In these cases, you can use `$derived.call` which accepts a function as its argument.

```svelte
<script>
	let numbers = $state([1, 2, 3]);
	let total = $derived.call(() => {
		let total = 0;
		for (const n of numbers) {
			total += n;
		}
		return total;
	});
</script>

<button on:click={() => numbers.push(numbers.length + 1)}>
	{numbers.join(' + ')} = {total}
</button>
```

In essence, `$derived(expression)` is equivalent to `$derived.call(() => expression)`.

## `$effect`

To run side-effects like logging or analytics whenever some specific values change, or when a component is mounted to the DOM, we can use the `$effect` rune:

```diff
<script>
	let count = $state(0);
	let doubled = $derived(count * 2);

+	$effect(() => {
+		// runs when the component is mounted, and again
+		// whenever `count` or `doubled` change,
+		// after the DOM has been updated
+		console.log({ count, doubled });
+
+		return () => {
+			// if a callback is provided, it will run
+			// a) immediately before the effect re-runs
+			// b) when the component is destroyed
+			console.log('cleanup');
+		};
+	});
</script>

<button on:click={() => count++}>
	{doubled}
</button>

<p>{count} doubled is {doubled}</p>
```

### What this replaces

The portions of `$: {}` that are triggering side-effects can be replaced with `$effect` while being careful to migrate updates of reactive variables to use `$derived`. There are some important differences:

- Effects only run in the browser, not during server-side rendering
- They run after the DOM has been updated, whereas `$:` statements run immediately _before_
- You can return a cleanup function that will be called whenever the effect refires

Additionally, you may prefer to use effects in some places where you previously used `onMount` and `afterUpdate` (the latter of which will be deprecated in Svelte 5). There are some differences between these APIs as `$effect` should not be used to compute reactive values and will be triggered each time a referenced reactive variable changes (unless using `untrack`).

## `$effect.pre`

In rare cases, you may need to run code _before_ the DOM updates. For this we can use the `$effect.pre` rune:

```svelte
<script>
	import { tick } from 'svelte';

	let div;
	let messages = [];

	// ...

	$effect.pre(() => {
		if (!div) return; // not yet mounted

		// reference `messages` so that this code re-runs whenever it changes
		messages;

		// autoscroll when new messages are added
		if (
			div.offsetHeight + div.scrollTop >
			div.scrollHeight - 20
		) {
			tick().then(() => {
				div.scrollTo(0, div.scrollHeight);
			});
		}
	});
</script>

<div bind:this={div}>
	{#each messages as message}
		<p>{message}</p>
	{/each}
</div>
```

### What this replaces

Previously, you would have used `beforeUpdate`, which — like `afterUpdate` — is deprecated in Svelte 5.

## `$effect.active`

The `$effect.active` rune is an advanced feature that tells you whether or not the code is running inside an effect or inside your template ([demo](/#H4sIAAAAAAAAE3XP0QrCMAwF0F-JRXAD595rLfgdzodRUyl0bVgzQcb-3VYFQfExl5tDMgvrPCYhT7MI_YBCiiOR2Aq-UxnSDT1jnlOcRlMSlczoiHUXOjYxpOhx5-O12rgAJg4UAwaGhDyR3Gxhjdai4V1v2N2wqus9tC3Y3ifMQjbehaqq4aBhLtEv_Or893icCsdLve-Caj8nBkU67zMO5HtGCfM3sKiWNKhV0zwVaBqd3x3ixVmHFyFLuJyXB-moOe8pAQAA)):

```svelte
<script>
	console.log('in component setup:', $effect.active()); // false

	$effect(() => {
		console.log('in effect:', $effect.active()); // true
	});
</script>

<p>in template: {$effect.active()}</p> <!-- true -->
```

This allows you to (for example) add things like subscriptions without causing memory leaks, by putting them in child effects.

## `$effect.root`

The `$effect.root` rune is an advanced feature that creates a non-tracked scope that doesn't auto-cleanup. This is useful for
nested effects that you want to manually control. This rune also allows for creation of effects outside of the component initialisation phase.

```svelte
<script>
	let count = $state(0);

	const cleanup = $effect.root(() => {
		$effect(() => {
			console.log(count);
		});

		return () => {
			console.log('effect root cleanup');
		};
	});
</script>
```

## `$props`

To declare component props, use the `$props` rune:

```js
let { optionalProp = 42, requiredProp } = $props();
```

You can use familiar destructuring syntax to rename props, in cases where you need to (for example) use a reserved word like `catch` in `<MyComponent catch={22} />`:

```js
let { catch: theCatch } = $props();
```

To get all properties, use rest syntax:

```js
let { a, b, c, ...everythingElse } = $props();
```

If you're using TypeScript, you can use type arguments:

```ts
type MyProps = any;
// ---cut---
let { a, b, c, ...everythingElse } = $props<MyProps>();
```

Props cannot be mutated, unless the parent component uses `bind:`. During development, attempts to mutate props will result in an error.

### What this replaces

`$props` replaces the `export let` and `export { x as y }` syntax for declaring props. It also replaces `$$props` and `$$restProps`, and the little-known `interface $$Props {...}` construct.

Note that you can still use `export const` and `export function` to expose things to users of your component (if they're using `bind:this`, for example).

## `$inspect`

The `$inspect` rune is roughly equivalent to `console.log`, with the exception that it will re-run whenever its
argument changes. `$inspect` tracks reactive state deeply, meaning that updating something inside an object
or array using [fine-grained reactivity](/docs/fine-grained-reactivity) will cause it to re-fire. ([Demo:](/#H4sIAAAAAAAACkWQ0YqDQAxFfyUMhSotdZ-tCvu431AXtGOqQ2NmmMm0LOK_r7Utfby5JzeXTOpiCIPKT5PidkSVq2_n1F7Jn3uIcEMSXHSw0evHpAjaGydVzbUQCmgbWaCETZBWMPlKj29nxBDaHj_edkAiu12JhdkYDg61JGvE_s2nR8gyuBuiJZuDJTyQ7eE-IEOzog1YD80Lb0APLfdYc5F9qnFxjiKWwbImo6_llKRQVs-2u91c_bD2OCJLkT3JZasw7KLA2XCX31qKWE6vIzNk1fKE0XbmYrBTufiI8-_8D2cUWBA_AQAA))

```svelte
<script>
	let count = $state(0);
	let message = $state('hello');

	$inspect(count, message); // will console.log when `count` or `message` change
</script>

<button onclick={() => count++}>Increment</button>
<input bind:value={message} />
```

`$inspect` returns a property `with`, which you can invoke with a callback, which will then be invoked instead of `console.log`. The first argument to the callback is either `"init"` or `"update"`, all following arguments are the values passed to `$inspect`. [Demo:](/#H4sIAAAAAAAACkVQ24qDMBD9lSEUqlTqPlsj7ON-w7pQG8c2VCchmVSK-O-bKMs-DefKYRYx6BG9qL4XQd2EohKf1opC8Nsm4F84MkbsTXAqMbVXTltuWmp5RAZlAjFIOHjuGLOP_BKVqB00eYuKs82Qn2fNjyxLtcWeyUE2sCRry3qATQIpJRyD7WPVMf9TW-7xFu53dBcoSzAOrsqQNyOe2XUKr0Xi5kcMvdDB2wSYO-I9vKazplV1-T-d6ltgNgSG1KjVUy7ZtmdbdjqtzRcphxMS1-XubOITJtPrQWMvKnYB15_1F7KKadA_AQAA)

```svelte
<script>
	let count = $state(0);

	$inspect(count).with((type, count) => {
		if (type === 'update') {
			debugger; // or `console.trace`, or whatever you want
		}
	});
</script>

<button onclick={() => count++}>Increment</button>
```

A convenient way to find the origin of some change is to pass `console.trace` to `with`:

```js
// @errors: 2304
$inspect(stuff).with(console.trace);
```

> `$inspect` only works during development.

## How to opt in

Current Svelte code will continue to work without any adjustments. Components using the Svelte 4 syntax can use components using runes and vice versa.

The easiest way to opt in to runes mode is to just start using them in your code. Alternatively, you can force the compiler into runes or non-runes mode either on a per-component basis...

<!-- prettier-ignore -->
```svelte
<!--- file: YourComponent.svelte --->
<!-- this can be `true` or `false` -->
<svelte:options runes={true} />
```

...or for your entire app:

```js
/// file: svelte.config.js
export default {
	compilerOptions: {
		runes: true
	}
};
```
