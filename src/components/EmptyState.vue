<script setup>
defineProps({
	title: { type: String, default: "目前沒有資料" },
	description: { type: String, default: "" },
	actionLabel: { type: String, default: "" }
});

const emit = defineEmits(["action"]);

const handleAction = () => {
	emit("action");
};
</script>

<template>
	<div class="rounded-2xl border border-ys-line bg-ys-card px-5 py-10 text-center">
		<p class="text-base font-semibold text-ys-deep">{{ title }}</p>
		<p v-if="description" class="mt-2 text-sm text-ys-muted">{{ description }}</p>
		<button
			v-if="actionLabel"
			type="button"
			class="mt-5 inline-flex rounded-xl bg-ys-mid px-5 py-2.5 text-sm font-semibold text-white"
			:aria-label="actionLabel"
			@click="handleAction"
		>
			{{ actionLabel }}
		</button>
	</div>
</template>
