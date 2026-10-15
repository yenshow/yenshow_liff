<script setup>
defineProps({
	name: { type: String, required: true },
	size: { type: Number, default: 22 }
});
</script>

<template>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		:width="size"
		:height="size"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.75"
		stroke-linecap="round"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<template v-if="name === 'home'">
			<path d="M3 10.5 12 3l9 7.5" />
			<path d="M5 9.5V21h14V9.5" />
			<path d="M10 21v-6h4v6" />
		</template>
		<template v-else-if="name === 'orders'">
			<path d="M3 7h11v10H3V7Z" />
			<path d="M14 10h4l3 3v4h-7v-7Z" />
			<circle cx="7" cy="18.5" r="1.5" />
			<circle cx="17.5" cy="18.5" r="1.5" />
		</template>
		<template v-else-if="name === 'support'">
			<path d="M4.5 12a7.5 7.5 0 0 1 15 0" />
			<path d="M4.5 12v3.5a2 2 0 0 0 2 2H8v-7H6.5A2 2 0 0 0 4.5 12Z" />
			<path d="M19.5 12v3.5a2 2 0 0 1-2 2H16v-7h1.5a2 2 0 0 1 2 2Z" />
			<path d="M16 19.5c0 1.2-1.8 2-4 2" />
		</template>
		<template v-else-if="name === 'specs'">
			<circle cx="10.5" cy="10.5" r="6" />
			<path d="M15 15l5 5" />
		</template>
		<template v-else-if="name === 'promo'">
			<path d="M4 11v2a2 2 0 0 0 2 2h1l8 4V5L7 9H6a2 2 0 0 0-2 2Z" />
			<path d="M16 9.5a3 3 0 0 1 0 5" />
		</template>
		<template v-else-if="name === 'document'">
			<path d="M8 3h6l4 4v14H8V3Z" />
			<path d="M14 3v4h4" />
			<path d="M11 12h4" />
			<path d="M11 16h4" />
		</template>
	</svg>
</template>
