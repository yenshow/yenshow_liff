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
	<div class="rounded-2xl border border-ys-line bg-white px-5 py-10 text-center shadow-sm">
		<div
			class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ys-deep/10 text-2xl text-ys-deep"
			aria-hidden="true"
		>
			○
		</div>
		<p class="text-base font-semibold text-ys-deep">{{ title }}</p>
		<p v-if="description" class="mt-2 text-sm text-ys-muted">{{ description }}</p>
		<button
			v-if="actionLabel"
			type="button"
			class="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-ys-lime px-5 py-2.5 text-sm font-semibold text-ys-deep"
			:aria-label="actionLabel"
			tabindex="0"
			@click="handleAction"
		>
			{{ actionLabel }}
		</button>
	</div>
</template>
