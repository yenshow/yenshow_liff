<script setup>
defineProps({
	label: { type: String, default: "" }
});
</script>

<template>
	<span
		class="inline-flex rounded-full bg-ys-deep/10 px-2.5 py-1 text-xs font-medium text-ys-mid"
	>
		{{ label }}
	</span>
</template>
