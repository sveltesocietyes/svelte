<script>
	import { Blurb, Footer, TrySection } from '@sveltejs/site-kit/home';
	import Demo from './_components/Demo.svelte';
	import Hero from './_components/Hero.svelte';
	import Supporters from './_components/Supporters/index.svelte';
	import WhosUsingSvelte from './_components/WhosUsingSvelte/index.svelte';
</script>

<svelte:head>
	<title>Svelte • Aplicaciones cibernéticamente mejoradas</title>

	<meta name="twitter:title" content="Svelte" />
	<meta name="twitter:description" content="Cybernetically enhanced web apps" />
	<meta name="Description" content="Cybernetically enhanced web apps" />
</svelte:head>

<h1 class="visually-hidden">Svelte</h1>

<Hero />

<Blurb --background="var(--sk-back-1)">
	<div slot="one">
		<h2>compilado</h2>
		<p>
			Svelte traslada la mayor cantidad posible de trabajo, fuera del navegador hacia tu paso de compilación, No más optimizaciones manuales — simplemente aplicaciones más rápidas y eficientes 
		</p>
	</div>

	<div slot="two">
		<h2>compacto</h2>
		<p>
			Escribe componentes impresionantemente concisos utilizando lenguajes que ya conoces — HTML, CSS y
			JavaScript. Ah, y tus paquetes de aplicaciones también serán pequeños.
		</p>
	</div>

	<div slot="three">
		<h2>completo</h2>
		<p>
			Estilos con ámbito incorporado, manejo de estados, primitivas de animación, form bindings y más — no
			gastes tiempo buscando en npm lo esencial. Todo está aquí.
		</p>
	</div>
</Blurb>

<TrySection />

<Demo />

<WhosUsingSvelte />

<Supporters />

<Footer
	links={{
		resources: [
			{
				title: 'documentation',
				href: '/docs'
			},
			{
				title: 'tutorial',
				href: '/tutorial'
			},
			{
				title: 'examples',
				href: '/examples'
			},
			{
				title: 'blog',
				href: '/blog'
			}
		],
		connect: [
			{
				title: 'github',
				href: 'https://github.com/sveltejs/svelte'
			},
			{
				title: 'opencollective',
				href: 'https://opencollective.com/svelte'
			},
			{
				title: 'discord',
				href: '/chat'
			},
			{
				title: 'twitter',
				href: 'https://twitter.com/sveltejs'
			}
		]
	}}
>
	<span slot="license">
		Svelte is <a href="https://github.com/sveltejs/svelte">free and open source software</a> released
		under the MIT license
	</span>
</Footer>

<style>
	h2 {
		line-height: 1.05;
	}

	p {
		font-size: var(--sk-text-m);
	}
</style>
