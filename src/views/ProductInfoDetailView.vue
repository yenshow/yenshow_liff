<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getNewsBySlug } from "@/api/news";
import { useLiff } from "@/composables/useLiff";
import { localizedText, mediaUrl } from "@/utils/format";
import { tiptapToPlainText } from "@/utils/tiptapText";

const route = useRoute();
const { openOfficialNews } = useLiff();
const item = ref(null);
const loading = ref(false);
const error = ref("");

const title = computed(() => localizedText(item.value?.title, "訊息詳情"));
const summaryText = computed(() => {
	const summary = localizedText(item.value?.summary);
	if (summary) return summary;
	const article = item.value?.article?.TW || item.value?.article?.EN;
	return tiptapToPlainText(article, 280);
});
const cover = computed(() => mediaUrl(item.value?.coverImageUrl || item.value?.coverImage));
const publishDateLabel = computed(() => {
	const raw = item.value?.publishDate || item.value?.createdAt;
	if (!raw) return "";
	const date = new Date(raw);
	return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("sv-SE");
});
const newsSlug = computed(() => String(item.value?.slug || route.params.slug || "").trim());

const handleLoad = async () => {
	loading.value = true;
	error.value = "";
	try {
		item.value = await getNewsBySlug(route.params.slug);
		const pageTitle = localizedText(item.value?.title);
		if (pageTitle) document.title = `${pageTitle}｜遠岫`;
	} catch (err) {
		error.value = err?.response?.data?.message || err?.message || "無法載入內容";
		item.value = null;
	} finally {
		loading.value = false;
	}
};

const handleOpenOfficial = async () => {
	if (!newsSlug.value) return;
	try {
		await openOfficialNews(newsSlug.value);
	} catch (err) {
		error.value = err?.message || "無法開啟官網文章";
	}
};

onMounted(handleLoad);
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
					<p v-if="publishDateLabel" class="mt-2 text-xs text-ys-muted">{{ publishDateLabel }}</p>
				</div>

				<p
					v-if="summaryText"
					class="border-l-4 border-ys-mid pl-3 text-sm leading-relaxed italic text-ys-muted"
				>
					{{ summaryText }}
				</p>

				<div class="space-y-2">
					<button
						type="button"
						class="flex w-full items-center justify-center rounded-xl bg-ys-mid px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
						aria-label="在官網閱讀全文"
						:disabled="!newsSlug"
						@click="handleOpenOfficial"
					>
						在官網閱讀全文
					</button>
					<RouterLink
						to="/products"
						class="flex w-full items-center justify-center rounded-xl border border-ys-line bg-white px-4 py-3 text-sm font-semibold text-ys-deep"
						tabindex="0"
						aria-label="前往規格查詢"
					>
						查看相關規格
					</RouterLink>
				</div>
			</div>
		</article>
	</div>
</template>
