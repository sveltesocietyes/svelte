---
title: Componentes Svelte
---

Los componentes son bloques para construir aplicaciones Svelte. Se escriben en archivos `.svelte`, utilizando un superconjunto de HTML.

Las tres secciones — script, styles y marcado — son opcionales.

```svelte
<script>
	// la lógica va aquí
</script>

<!-- El marcado (cero o más elementos) van aquí -->

<style>
	/* los estilos van aquí */
</style>
```

## &lt;script&gt;

El bloque `<script>` contiene el Javascript que se ejecuta cuando una instancia de componente es creada. Las variables declaradas (o importadas) en el nivel más alto, son visibles en el marcado del componente. Aquí hay cuatro reglas adicionales:

### 1. `export` crea una prop de componente.

Svelte usa la palabra clave `export` para marcar una declaración de variable como una _property_ o _prop_, lo que significa que se vuelve accesible para los consumidores del componente (ver la sección en [attributos y props](/docs/basic-markup#attributes-and-props) para mayor información).

```svelte
<script>
	export let foo;

	// Los valores que se pasan como props
	// están disponibles de inmediato.
	console.log({ foo });
</script>
```

Puede especificar un valor inicial por defecto para una prop. Este será utilizado si el consumidor del componente no especifica la prop en el componente (o si el valor inicial es `undefined`) al crear una instancia del componente. Tenga en cuenta que si los valores de las props se actualizan posteriormente, cualquier prop cuyo valor no se especifique se establecerá en 'undefined' (en lugar de su valor inicial).

En el modo de desarrollo (vea [opciones del compilador](/docs/svelte-compiler#compile)), se imprimirá una advertencia si no hay un valor por defecto y si el consumidor tampoco lo especifica. Para silenciar esta advertencia, asegúrese de que se especifica un valor inicial predeterminado, incluso si es `undefined`.

```svelte
<script>
	export let bar = 'valor inicial por defecto, opcional.';
	export let baz = undefined;
</script>
```

Si exporta `const`, `class` o `function`, esto será de solo lectura desde fuera del componente. Sin embargo las funciones son valores de props válidas, cómo se muestra a continuación.

```svelte
<!--- file: App.svelte --->
<script>
	// Esto será de solo lectura
	export const thisIs = 'readonly';

	/** @param {string} name */
	export function saludar(name) {
		alert(`hola ${name}!`);
	}

	// Esto es una prop
	export let format = (n) => n.toFixed(2);
</script>
```

Se puede acceder a las props de solo lectura como propiedades de elemento, vinculadas al componente utilizando [la sintaxis `bind:this`](/docs/component-directives#bind-this).

Puede utilizar palabras reservadas como nommbres de props.

```svelte
<!--- file: App.svelte --->
<script>
	/** @type {string} */
	let className;

	// Crea una propiedad `class`, incluso
	// si esta es una palabra reservada
	export { className as class };
</script>
```

### 2. Las asignaciones son reactivas.

Para cambiar el estado de un componente y activar un re-render, simplemente asigne a una variable local declarada.

Las expresiones de actualización (`count += 1`) y las asignaciones de propiedades (`obj.x = y`) tienen el mismo efecto.

```svelte
<script>
	let count = 0;

	function handleClick() {
		// Ejecutar esta función activará una
		// actualización si el marcado hace referencia a `count`
		count = count + 1;
	}
</script>
```

Como la reactividad de Svelte está basada en asignaciones, utilizar métodos de array cómo `.push()` y `.splice()` no activará automáticamente las actualizaciones. Se requerirá una asignación posterior que desencadene la actualización. Detalles de esto y más se encuentran en el [tutorial](https://learn.svelte.dev/tutorial/updating-arrays-and-objects).

```svelte
<script>
	let arr = [0, 1];

	function handleClick() {
		// la llamada a este método no desencadena una
		// actualización
		arr.push(2);
		// Esta asignación lanzará una actualización
		// si el marcado hace referencia a `arr`
		arr = arr;
	}
</script>
```

Los bloques `<script>` en Svelte, se ejecutan solo cuando el componente es creado, por lo que las asignaciones en un bloque `<script>` no se vuelven a ejecutar automáticamente cuando se actualiza una prop. Si desea hacer seguimiento a los cambios de una prop, vea el siguiente ejemplo en la sección a continuación. 

```svelte
<script>
	export let person;
	// Solo establecerá `name` en la creación del componente
	// no actualizará si `person` lo hace.
	let { name } = person;
</script>
```

### 3. `$:` marca una declaración como reactiva.

Cualquier declaración de alto nivel (p.e. no dentro de un bloque o función) puede hacerse reactiva anteponiendo el `$:` [JS sintaxis label](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/label). Las declaraciones reactivas se ejecutan después de otro código de script y antes de que se renderice el marcado, siempre que hayan cambiado los valores de los que depende.

```svelte
<script>
	export let title;
	export let person;

	// esto actualizará `document.title` siempre
	// que la prop `title` cambie.
	$: document.title = title;

	$: {
		console.log(`Puede combinar múltiples declaraciones`);
		console.log(`el title actual es ${title}`);
	}

	// esto actualizará `name` cuando 'person' cambie
	$: ({ name } = person);

	//no haga esto. Esto se ejecutará antes de la línea anterior
	let name2 = name;
</script>
```

Solo los valores que aparecen directamente dentro del bloque '$:' se convertirán en dependencias de la instrucción reactiva. Por ejemplo, en el código siguiente, `total` solo se actualizará cuando cambie `x`, pero no `y`.

```svelte
<!--- file: App.svelte --->
<script>
	let x = 0;
	let y = 0;

	/** @param {number} value */
	function yPlusAValue(value) {
		return value + y;
	}

	$: total = yPlusAValue(x);
</script>

Total: {total}
<button on:click={() => x++}> Increment X </button>

<button on:click={() => y++}> Increment Y </button>
```

Es importante tener en cuenta que los bloques reactivos se ordenan a través de un análisis estático simple en tiempo de compilación, y todo lo que el compilador mira son las variables que se asignan y se usan dentro del bloque en sí, no en ninguna función llamada por ellos. Esto significa que `yDependent` no se actualizará cuando se actualice `x` en el siguiente ejemplo:

```svelte
<script>
	let x = 0;
	let y = 0;

	/** @param {number} value */
	function setY(value) {
		y = value;
	}

	$: yDependent = y;
	$: setY(x);
</script>
```

Mover la línea `$: yDependent = y` debajo de `$: setY(x)` hará que `yDependent` se actualice cuando se actualice `x`.

Si una instrucción consiste completamente en una asignación a una variable no declarada, Svelte inyectará una declaración `let` en su nombre.

```svelte
<!--- file: App.svelte --->
<script>
	/** @type {number} */
	export let num;

	// no necesitamos declarar `squared` ni `cubed`
	// — Svelte lo hace por nosotros
	$: squared = num * num;
	$: cubed = squared * num;
</script>
```

### 4. Prefija stores con `$` para acceder a sus valores.

Una _store_ es un objeto que permite el acceso a valores reactivos a través de un simple _store contract_. El [módulo `svelte/store`](/docs/svelte-store) contiene implementaciones mínimas de store que cumplen este contrato.

Cada vez que tenga una referencia a una store, puede acceder a su valor dentro de un componente prefijándola con el carácter `$`. Esto hace que Svelte declare la variable prefijada, se suscriba a la store en la inicialización del componente y cancele la suscripción cuando corresponda.

Las asignaciones a variables con el prefijo `$` requieren que la variable sea una store `writable` y dará como resultado una llamada al método `.set` de la store.

Tenga en cuenta que la store debe declararse en el nivel superior del componente, no dentro de un bloque `if` o una función, por ejemplo.

Las variables locales (que no representan valores de una store) _no_ deben tener un prefijo `$`.

```svelte
<script>
	import { writable } from 'svelte/store';

	const count = writable(0);
	console.log($count); // logs 0

	count.set(1);
	console.log($count); // logs 1

	$count = 2;
	console.log($count); // logs 2
</script>
```

#### Contrato de store

```ts
// @noErrors
store = { subscribe: (subscription: (value: any) => void) => (() => void), set?: (value: any) => void }
```

Puede crear sus propias stores sin depender de [`svelte/store`](/docs/svelte-store), implementando un _store contract_:

1. Una store debe contener un método `.subscribe`, que debe aceptar como argumento una función de suscripción. Esta función de suscripción debe llamarse de forma inmediata y sincrónica con el valor actual de la store, al llamar a `.subscribe`. Todas las funciones de suscripción activas de una store deben llamarse posteriormente de forma sincrónica cada vez que cambie el valor de la store.
2. El método `.subscribe` debe devolver una función `unsubscribe`. Al llamar a `unsubscribe`, la store debe detener su suscripción y no debe volver a llamar a su función de suscripción correspondiente.
3. Una stor puede contener _opcionalmente_ un método `.set`, que debe aceptar como argumento un nuevo valor para la store y que llama sincrónicamente a todas las funciones de suscripción activas de la store. Una store de este tipo se llama _writable store_.

Para la interoperabilidad con Observables RxJS, el método `.subscribe` también puede devolver un objeto con un método `.unsubscribe`, en lugar de devolver la función de cancelación de suscripción directamente. Sin embargo, tenga en cuenta que, a menos que `.subscribe` llame sincrónicamente a la suscripción (lo cual no es requerido por la especificación Observable), Svelte verá el valor de la store como `undefined` hasta que lo haga.

## &lt;script context="module"&gt;

Una etiqueta `<script>` con un atributo `context="module"` se ejecutará una vez cuando el módulo se evalúe por primera vez, en lugar de para cada instancia de componente. Se puede acceder a los valores declarados en este bloque desde un bloque `<script>` normal (y desde el marcado del componente), pero no al revés.

Puede `exportar bindings` desde este bloque, y se convertirán en exportaciones del módulo compilado.

No se puede exportar por defecto `export default`, ya que la exportación por defecto es el propio componente.

> Las variables definidas en los scripts `módule` no son reactivas: reasignarlas no activará un rerenderizado aunque la variable en sí se actualizará. Para los valores compartidos entre varios componentes, considere la posibilidad de usar una [store](/docs/svelte-store).

```svelte
<script context="module">
	let totalComponents = 0;

	// la palabra clave export permite a esta función ser importada p.e.
	// `import Example, { alertTotal } from './Example.svelte'`
	export function alertTotal() {
		alert(totalComponents);
	}
</script>

<script>
	totalComponents += 1;
	console.log(`número total de veces que este componente ha sido creado: ${totalComponents}`);
</script>
```

## &lt;style&gt;

El CSS dentro de un bloque `<style>` se limitará a su componente.

Esto funciona añadiendo una clase a los elementos afectados, que se basa en un hash de los estilos del componentes (por ejemplo, `svelte-123xyz`).

```svelte
<style>
	p {
		/* esto solo afecta a los elementos <p> en este componente */
		color: burlywood;
	}
</style>
```

Para aplicar estilos a un selector globalmente, utilice el modificador `:global(...)`.

```svelte
<style>
	:global(body) {
		/* esto se aplicará al <body> */
		margin: 0;
	}

	div :global(strong) {
		/* esto se aplicará a todos los elementos <strong>, en culaquier
			 componente, que estén dentro de elementos <div> pertenecientes
			 a este componente */
		color: goldenrod;
	}

	p:global(.red) {
			/* esto se aplicará a todos los elementos <p> pertenecientes a este
				componente con la clase .red, incluso si class="red" no aparece
				inicialmente en el marcado, y sea añadido en tiempo de ejecución.
				Esto es útil cuando la clase del elemento es aplicada dinámicamente,
				por ejemplo al actualizar directamente la propiedad classList del elemento.
			*/
	}
</style>
```

Si desea crear @keyframes que sean accesibles globalmente, debe anteponer los nombres de los fotogramas clave con `-global-`.

La parte `-global-` se eliminará cuando se compile, y luego se hará referencia al keyframe usando solo `my-animation-name` en otra parte de su código.

```svelte
<style>
	@keyframes -global-my-animation-name {
		/* aquí su código */
	}
</style>
```

Solo debe haber 1 etiqueta `<style>` de nivel superior por componente.

Sin embargo, es posible tener la etiqueta `<style>` anidada dentro de otros elementos o bloques lógicos.

En ese caso, la etiqueta `<style>` se insertará tal cual en el DOM, no se realizará ningún procesamiento ni limitación de alcance de la etiqueta `<style>`.

```svelte
<div>
	<style>
		/* esta etiqueta style será insertada tal cual en el DOM */
		div {
			/* esto se aplicará a todos los elemtos `<div>` en el DOM */
			color: red;
		}
	</style>
</div>
```
