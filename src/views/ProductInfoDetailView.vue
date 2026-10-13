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
		<RouterLink to="/info" class="text-sm text-ys-mid" tabindex="0" aria-label="返回產品資訊">
			← 返回
		</RouterLink>

		<p v-if="loading" class="text-sm text-ys-muted">載入中…</p>
		<p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>

		<article v-if="item" class="overflow-hidden rounded-2xl border border-ys-line bg-white shadow-sm">
			<img v-if="cover" :src="cover" :alt="title" class="h-48 w-full object-cover" />
			<div class="space-y-3 p-4">
				<h1 class="text-xl font-semibold text-ys-deep">{{ title }}</h1>
				<p v-if="summary" class="text-sm text-ys-muted">{{ summary }}</p>
				<p class="whitespace-pre-wrap text-sm leading-relaxed text-ys-text">{{ bodyText }}</p>
				<RouterLink
					to="/products"
					class="inline-flex rounded-xl bg-ys-lime px-4 py-2 text-sm font-semibold text-ys-deep"
					tabindex="0"
					aria-label="前往規格查詢"
				>
					查看相關規格
				</RouterLink>
			</div>
		</article>
	</div>
</template>
