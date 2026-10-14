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
		<template v-else-if="name === 'product'">
			<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" />
			<path d="M12 12 20 7.5" />
			<path d="M12 12v9" />
			<path d="M12 12 4 7.5" />
		</template>
		<template v-else-if="name === 'orders'">
			<path d="M7 4h10v16H7z" />
			<path d="M10 8h4" />
			<path d="M10 12h4" />
			<path d="M10 16h2.5" />
		</template>
		<template v-else-if="name === 'support'">
			<path d="M12 21a9 9 0 1 0-9-9c0 2.2.8 4.2 2.1 5.8L4 21l3.4-1.1A8.9 8.9 0 0 0 12 21Z" />
			<path d="M9 11.5h.01" />
			<path d="M12 11.5h.01" />
			<path d="M15 11.5h.01" />
		</template>
		<template v-else-if="name === 'specs'">
			<path d="M7 3h7l3 3v15H7V3Z" />
			<path d="M14 3v4h4" />
			<path d="M10 12h4" />
			<path d="M10 16h4" />
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
			<path d="M11 8h1" />
		</template>
		<template v-else-if="name === 'bell'">
			<path d="M6 9a6 6 0 1 1 12 0c0 3.5 1.5 5 1.5 5H4.5S6 12.5 6 9Z" />
			<path d="M10 19a2 2 0 0 0 4 0" />
		</template>
		<template v-else-if="name === 'settings'">
			<circle cx="12" cy="12" r="3" />
			<path
				d="M12 3.5v2M12 18.5v2M4.9 6.5l1.4 1.4M17.7 16.1l1.4 1.4M3.5 12h2M18.5 12h2M4.9 17.5l1.4-1.4M17.7 7.9l1.4-1.4"
			/>
		</template>
		<template v-else-if="name === 'chevron'">
			<path d="M9 6l6 6-6 6" />
		</template>
	</svg>
</template>
