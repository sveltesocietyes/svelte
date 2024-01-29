---
title: Marcado básico
---

## Etiquetas

Una etiqueta en minúsculas, como `<div>`, denota un elemento HTML normal. Una etiqueta con la primera letra en mayúscula, como `<Widget>` o `<Namespace.Widget>`, indica un _componente_.

```svelte
<script>
	import Widget from './Widget.svelte';
</script>

<div>
	<Widget />
</div>
```

## Atributos y props

Por defecto, los atributos funcionan exactamente igual que su contraparte HTML.

```svelte
<div class="foo">
	<button disabled>No puedo tocar esto</button>
</div>
```

Como en HTML, los valores pueden no estar entre comillas

<!-- prettier-ignore -->
```svelte
<input type=checkbox />
```

Los valores de los atributos pueden contener expresiones de Javascript.

```svelte
<a href="page/{p}">page {p}</a>
```

O pueden _ser_ expresiones Javascript

```svelte
<button disabled={!clickable}>...</button>
```

Los atributos booleanos se incluyen en el elemento si su valor es [truthy](https://developer.mozilla.org/es/docs/Glossary/Truthy) y se excluyen si su valor es [falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy)

Todos los demás atributos se incluyen a menos que su valor sea [nulish](https://developer.mozilla.org/en-US/docs/Glossary/Nullish) (`null` o `undefined`).

```svelte
<input required={false} placeholder="Este input no es obligatorio" />
<div title={null}>Este div no tiene atributo title</div>
```

Una expresión puede incluir caracteres que harían que el resaltado de sintaxis fallara en HTML normal, por lo que se permite citar el valor. Las comillas no afectan a la forma en que se analiza el valor:

<!-- prettier-ignore -->
```svelte
<button disabled="{number !== 42}">...</button>
```

Cuando el atributo name y su valor coinciden (`name={name}`), pueden ser reemplazados con `{name}`.

```svelte
<button {disabled}>...</button>
<!-- equivale a
<button disabled={disabled}>...</button>
-->
```

Por convención, los valores pasados a los componentes se denominan _propiedades_ o _props_ en lugar de _atributos_, que son una característica del DOM.

Al igual que con los elementos, `name={name}` se puede reemplazar con la abreviatura `{name}`.

```svelte
<Widget foo={bar} answer={42} text="hello" />
```

Los _atributos de extensión_ permiten pasar muchos atributos o propiedades a un elemento o componente a la vez.

Un elemento o componente, puede tener múltiples atributos de extensión, intercalados coon atributos regulares.

```svelte
<Widget {...things} />
```

`$$props` hace referencia a todas las props que han sido pasadas al componente, includas aquellas no declaradas con `export`. El uso de `$$props` no funcionará tan bien como las referencias a una prop específica, porque los cambios en cualquier propiedad harán que Svelte vuelva a verificar todos los usos de `$$props`. Pero puede ser útil en algunos casos, por ejemplo, cuando no se sabe en tiempo de compilación qué props se pueden pasar a un componente.

```svelte
<Widget {...$$props} />
```

`$$restProps` contiene solo las propiedades que _no_ se declaran con `export`. Puede ser útil para transmitir otros atributos desconocidos a un elemento de un componente. Comparte las mismas características de rendimiento en comparación con el acceso a una propiedad específica que `$$props`.

```svelte
<input {...$$restProps} />
```

> El atributo `value` de un elemento `input` o sus elementos secundarios `option` no deben establecerse con atributos spread cuando se utiliza `bind:group` o `bind:checked`. Svelte necesita poder ver el `valor` del elemento directamente en el marcado en estos casos, para que pueda vincularlo a la variable enlazada.

> A veces, el orden de los atributos es importante, ya que Svelte establece los atributos secuencialmente en JavaScript. Por ejemplo, `<input type="range" min="0" max="1" value={0.5} step="0.1"/>`, Svelte intentará establecer a `value` en `1` (redondeando hacia arriba desde 0.5 ya que el step por defecto es 1), y luego establecerá el step en `0.1`. Para solucionar esto, cámbielo a `<input type="range" min="0" max="1" step="0.1" value={0.5}/>`.

> Otro ejemplo es `<img src="..." loading="lazy" />`. Svelte establecerá el img `src` antes de hacer el elemento img `loading="lazy"`, lo que probablemente sea demasiado tarde. Cambie esto a `<img loading="lazy" src="...">` para que la imagen se cargue de forma diferida.

## Expresiones de texto

Una expresión de Javascript puede ser incluida cómo texto encerrándola entre llaves.

```svelte
{expression}
```

Las llaves se pueden incluir en una plantilla de Svelte utilizando sus strings [entidad HTML](https://developer.mozilla.org/docs/Glossary/Entity): `&lbrace;`, `&lcub;` o `&#123` para `{` y `&rbrace;`, `&rcub;`, o `&#125` para `}`.

> Si está utilizando una expresión regular (`RegExp`) [notación literal](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/RegExp#notaci%C3%B3n_literal_y_constructor), necesitará encerrarla entre paréntesis.

<!-- prettier-ignore -->
```svelte
<h1>Hello {name}!</h1>
<p>{a} + {b} = {a + b}.</p>

<div>{(/^[A-Za-z ]+$/).test(value) ? x : y}</div>
```

## Commentarios

Puede utilizar comentarios dentro de un componente.

```svelte
<!-- ¡Este es un comentario! --><h1>Hello world</h1>
```

Los comentarios que comiencen con `svelte-ignore` desabilitarán las advertencias para el siguiente bloque en el marcado. Usualmente son advertencias de accesibilidad; asegúrese de deshabilitarlas por una buena razón.

```svelte
<!-- svelte-ignore a11y-autofocus -->
<input bind:value={name} autofocus />
```
