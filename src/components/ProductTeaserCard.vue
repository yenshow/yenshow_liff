<script setup>
import { computed } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import { localizedText, mediaUrl } from "@/utils/format";

const props = defineProps({
	product: { type: Object, required: true }
});

const name = computed(() => localizedText(props.product?.name, props.product?.code || ""));
const imageUrl = computed(() =>
	mediaUrl(props.product?.image || props.product?.images?.[0] || props.product?.coverImage)
);
</script>

<template>
	<RouterLink
		:to="`/products/${product._id}`"
		class="flex gap-3 rounded-2xl border border-ys-line bg-ys-card p-3"
		:aria-label="`查看 ${product.code} 規格`"
	>
		<div
			class="flex aspect-square h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white p-2 ring-1 ring-ys-line"
		>
			<img
				v-if="imageUrl"
				:src="imageUrl"
				:alt="name"
				class="max-h-full max-w-full object-contain"
			/>
			<span v-else class="text-xs text-ys-muted">無圖</span>
		</div>

		<div class="flex min-w-0 flex-1 flex-col justify-between gap-2">
			<div class="min-w-0">
				<p class="font-semibold text-ys-deep">{{ product.code }}</p>
				<p class="mt-1 line-clamp-2 text-sm text-ys-muted">{{ name }}</p>
			</div>
			<span
				class="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-ys-mid px-2 py-2 text-xs font-semibold text-ys-mid"
			>
				<AppIcon name="document" :size="14" />
				<span class="truncate">查看規格 / 開啟規格書</span>
			</span>
		</div>
	</RouterLink>
</template>
