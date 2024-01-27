---
title: Introducción
---

¡Bienvenido a la documentación de referencia de Svelte! Esto está pensado como un recurso para personas que ya tienen cierta familiaridad con Svelte y desean aprender más sobre cómo utilizarlo.

Si aún no eres una de esas personas, es posible que prefieras visitar el [tutorial interactivo](https://learn.svelte-es.dev) o los [ejemplos](/examples) antes de consultar esta referencia. Puedes probar Svelte en línea utilizando el [REPL](/repl). Alternativamente, si deseas un entorno más completo, puedes probar Svelte en [StackBlitz](https://sveltekit.new).

## Comenzar un nuevo proyecto

Recomendamos utilizar [SvelteKit](https://kit.svelte-es.dev/), el marco de aplicación oficial del equipo de Svelte:

```
npm create svelte@latest myapp
cd myapp
npm install
npm run dev
```

SvelteKit se encargará de llamar [al compilador de Svelte](https://www.npmjs.com/package/svelte) para convertir sus archivos `.svelte` a archivos `.js` que crean el DOM y los archivos `.css` para dar estilos. También proporciona todas las demás herramientas que necesita para crear una aplicación web, como un servidor de desarrollo, enrutamiento, despliegue y soporte SSR. [SvelteKit](https://kit.svelte.dev/) usa [Vite](https://vitejs.dev/) para construir su código.

### Alternativas a SvelteKit

Si por alguna razón no desea utilizar SvelteKit, también puede utilizar Svelte con Vite (pero sin SvelteKit) ejecutando `npm create vite@latest` y seleccionando la opción `svelte`. Con `npm run build` generará archivos HTML, JS y CSS dentro de la carpeta `dist`. En algunos casos, probablemente necesitará [elegir una librería de enrutamiento](/faq#is-there-a-router) también.

Alternativamente, existen [plugins para los principales compiladores web](https://sveltesociety.dev/tools#bundling) para manejar la compilación de Svelte — que dará salida a los archivos `.js` y `.css` que puede insertar en su HTML — pero la mayoría no puede manejar SSR.

## Herramientas de edición

El equipo de Svelte mantiene una [extensión de VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode) también hay integraciones con otros [editores](https://sveltesociety.dev/tools#editor-support) y herramientas.

## Obtener ayuda

¡No sea tímido a la hora de pedir ayuda en el [servidor de Discord](https://svelte.dev/chat)! También puede encontrar respuestas en [Stack Overflow](https://stackoverflow.com/questions/tagged/svelte).
