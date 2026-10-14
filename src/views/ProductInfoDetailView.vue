<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getNewsBySlug } from "@/api/news";
import { localizedText, mediaUrl } from "@/utils/format";
import { tiptapToPlainText } from "@/utils/tiptapText";

const route = useRoute();
const item = ref(null);
const loading = ref(false);
const error = ref("");

const title = computed(() => localizedText(item.value?.title, "訊息詳情"));
const summary = computed(() => localizedText(item.value?.summary));
const bodyText = computed(() => {
	const article = item.value?.article?.TW || item.value?.article?.EN;
	return tiptapToPlainText(article, 2000) || summary.value;
});
const cover = computed(() => mediaUrl(item.value?.coverImageUrl || item.value?.coverImage));

const handleLoad = async () => {
	loading.value = true;
	error.value = "";
	try {
		item.value = await getNewsBySlug(route.params.slug);
	} catch (err) {
		error.value = err?.response?.data?.message || err?.message || "無法載入內容";
		item.value = null;
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	handleLoad();
});
</script>

<template>
	<div class="space-y-4">
		<div class="flex items-center gap-3">
			<RouterLink
				to="/info"
				class="text-sm text-ys-mid"
				tabindex="0"
				aria-label="返回產品資訊"
			>
				← 返回
			</RouterLink>
		</div>

		<p v-if="loading" class="text-sm text-ys-muted">載入中…</p>
		<p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>

		<article v-if="item" class="overflow-hidden rounded-2xl border border-ys-line bg-white shadow-sm">
			<div v-if="cover" class="h-52 bg-ys-surface">
				<img :src="cover" :alt="title" class="h-full w-full object-cover" />
			</div>
			<div class="space-y-4 p-4">
				<div>
					<p class="text-xs font-medium text-ys-mid">產品資訊</p>
					<h1 class="mt-1 text-xl font-semibold text-ys-deep">{{ title }}</h1>
				</div>
				<p v-if="summary" class="text-sm leading-relaxed text-ys-muted">{{ summary }}</p>
				<p class="whitespace-pre-wrap text-sm leading-relaxed text-ys-text">{{ bodyText }}</p>
				<RouterLink
					to="/products"
					class="flex w-full items-center justify-center rounded-xl bg-ys-mid px-4 py-3 text-sm font-semibold text-white"
					tabindex="0"
					aria-label="前往規格查詢"
				>
					查看相關規格
				</RouterLink>
			</div>
		</article>
	</div>
</template>
