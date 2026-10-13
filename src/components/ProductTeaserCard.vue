<script setup>
import { computed } from "vue";
import AppIcon from "@/components/AppIcon.vue";
import { localizedText, mediaUrl } from "@/utils/format";

const props = defineProps({
	product: { type: Object, required: true },
	showCta: { type: Boolean, default: true }
});

const name = computed(() => localizedText(props.product?.name, props.product?.code || ""));
const imageUrl = computed(() =>
	mediaUrl(props.product?.image || props.product?.images?.[0] || props.product?.coverImage)
);
</script>

<template>
	<RouterLink
		:to="`/products/${product._id}`"
		class="block overflow-hidden rounded-2xl border border-ys-line bg-white shadow-sm transition hover:border-ys-mid"
		tabindex="0"
		:aria-label="`查看 ${product.code} 規格`"
	>
		<div class="flex gap-3 p-3">
			<div
				class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-ys-surface"
			>
				<img
					v-if="imageUrl"
					:src="imageUrl"
					:alt="name"
					class="h-full w-full object-cover"
				/>
				<span v-else class="text-xs text-ys-muted">無圖</span>
			</div>
			<div class="min-w-0 flex-1 py-0.5">
				<p class="font-semibold text-ys-deep">{{ product.code }}</p>
				<p class="mt-1 line-clamp-2 text-sm text-ys-muted">{{ name }}</p>
			</div>
		</div>
		<div
			v-if="showCta"
			class="flex items-center justify-center gap-2 border-t border-ys-line px-3 py-2.5 text-sm font-semibold text-ys-mid"
		>
			<AppIcon name="document" :size="16" />
			<span>查看規格／下載 Datasheet</span>
		</div>
	</RouterLink>
</template>
