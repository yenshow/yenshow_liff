<script setup>
import { onMounted, ref } from "vue";
import { listNews } from "@/api/news";
import EmptyState from "@/components/EmptyState.vue";
import { localizedText, mediaUrl } from "@/utils/format";

const items = ref([]);
const loading = ref(false);
const error = ref("");

const handleLoad = async () => {
	loading.value = true;
	error.value = "";
	try {
		items.value = await listNews({ limit: 30 });
	} catch (err) {
		error.value = err?.response?.data?.message || err?.message || "無法載入產品資訊";
		items.value = [];
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
		<section>
			<h1 class="text-xl font-semibold text-ys-deep">產品資訊</h1>
			<p class="mt-1 text-sm text-ys-muted">最新消息、方案與活動。</p>
		</section>

		<p v-if="loading" class="text-sm text-ys-muted">載入中…</p>
		<p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>

		<ul v-if="!loading && items.length" class="space-y-3" aria-label="產品資訊列表">
			<li v-for="item in items" :key="item._id || item.slug">
				<RouterLink
					:to="`/info/${encodeURIComponent(item.slug)}`"
					class="flex gap-3 overflow-hidden rounded-2xl border border-ys-line bg-white shadow-sm"
					tabindex="0"
					:aria-label="localizedText(item.title, '未命名')"
				>
					<img
						v-if="mediaUrl(item.coverImageUrl || item.coverImage)"
						:src="mediaUrl(item.coverImageUrl || item.coverImage)"
						:alt="localizedText(item.title)"
						class="h-24 w-24 shrink-0 object-cover"
					/>
					<div class="min-w-0 flex-1 p-3">
						<p class="truncate font-semibold text-ys-deep">
							{{ localizedText(item.title, "未命名") }}
						</p>
						<p class="mt-1 line-clamp-2 text-sm text-ys-muted">
							{{ localizedText(item.summary) }}
						</p>
					</div>
				</RouterLink>
			</li>
		</ul>

		<EmptyState
			v-else-if="!loading && !error"
			title="目前沒有產品資訊"
			description="稍後再來查看最新消息與方案。"
			action-label="重新整理"
			@action="handleLoad"
		/>
	</div>
</template>
