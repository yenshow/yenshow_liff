<script setup>
defineProps({
	count: { type: Number, default: 3 },
	variant: { type: String, default: "row" } // row | card | media
});
</script>

<template>
	<ul class="space-y-3" aria-busy="true" aria-label="載入中">
		<li
			v-for="n in count"
			:key="n"
			class="animate-pulse rounded-2xl border border-ys-line bg-ys-card"
			:class="variant === 'media' ? 'overflow-hidden' : 'p-4'"
		>
			<template v-if="variant === 'media'">
				<div class="h-40 bg-ys-line/60" />
				<div class="space-y-2 p-4">
					<div class="h-4 w-3/4 rounded bg-ys-line/70" />
					<div class="h-3 w-full rounded bg-ys-line/50" />
					<div class="h-3 w-1/2 rounded bg-ys-line/50" />
				</div>
			</template>
			<template v-else-if="variant === 'card'">
				<div class="flex gap-3">
					<div class="h-24 w-24 shrink-0 rounded-xl bg-ys-line/60" />
					<div class="flex min-w-0 flex-1 flex-col justify-center gap-2">
						<div class="h-4 w-3/4 rounded bg-ys-line/70" />
						<div class="h-3 w-1/2 rounded bg-ys-line/50" />
						<div class="mt-1 h-8 w-full rounded-lg bg-ys-line/40" />
					</div>
				</div>
			</template>
			<template v-else>
				<div class="flex items-center justify-between gap-3">
					<div class="min-w-0 flex-1 space-y-2">
						<div class="h-4 w-3/4 rounded bg-ys-line/70" />
						<div class="h-3 w-1/2 rounded bg-ys-line/50" />
						<div class="h-5 w-16 rounded-full bg-ys-line/40" />
					</div>
					<div class="h-5 w-3 rounded bg-ys-line/40" />
				</div>
			</template>
		</li>
	</ul>
</template>
