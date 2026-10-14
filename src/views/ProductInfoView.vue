<script setup>
defineOptions({ name: "ProductInfoView" });

import { onMounted, ref } from "vue";
import { listNews } from "@/api/news";
import EmptyState from "@/components/EmptyState.vue";
import ListSkeleton from "@/components/ListSkeleton.vue";
import { localizedText, mediaUrl } from "@/utils/format";

const items = ref([]);
const loading = ref(false);
const error = ref("");

const coverUrl = (item) => mediaUrl(item?.coverImageUrl || item?.coverImage);

const handleLoad = async () => {
	if (!items.value.length) loading.value = true;
	error.value = "";
	try {
		const list = await listNews({
			limit: 10,
			page: 1,
			sort: "createdAt",
			sortDirection: "desc"
		});
		items.value = [...(list || [])].sort((a, b) => {
			const ta = new Date(a?.createdAt || a?.publishDate || 0).getTime();
			const tb = new Date(b?.createdAt || b?.publishDate || 0).getTime();
			return tb - ta;
		});
	} catch (err) {
		error.value = err?.response?.data?.message || err?.message || "無法載入產品資訊";
	} finally {
		loading.value = false;
	}
};

onMounted(handleLoad);
</script>

<template>
	<div class="space-y-4">
		<section>
			<h1 class="text-xl font-semibold text-ys-deep">產品推廣</h1>
			<p class="mt-1 text-sm text-ys-muted">最新產品、方案與活動資訊。</p>
		</section>

		<ListSkeleton v-if="loading" :count="3" variant="media" />
		<p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>

		<ul v-if="!loading && items.length" class="space-y-4" aria-label="產品資訊列表">
			<li v-for="item in items" :key="item._id || item.slug">
				<RouterLink
					:to="`/info/${encodeURIComponent(item.slug)}`"
					class="block overflow-hidden rounded-2xl border border-ys-line bg-ys-card"
					tabindex="0"
					:aria-label="localizedText(item.title, '未命名')"
				>
					<div class="flex h-40 items-center justify-center bg-ys-surface">
						<img
							v-if="coverUrl(item)"
							:src="coverUrl(item)"
							:alt="localizedText(item.title)"
							class="h-full w-full object-cover"
						/>
						<span v-else class="text-sm text-ys-muted">產品資訊</span>
					</div>
					<div class="space-y-2 p-4">
						<p class="font-semibold text-ys-deep">
							{{ localizedText(item.title, "未命名") }}
						</p>
						<p class="line-clamp-2 text-sm leading-relaxed text-ys-muted">
							{{ localizedText(item.summary) }}
						</p>
						<span class="inline-flex text-sm font-medium text-ys-mid">閱讀更多 ›</span>
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
