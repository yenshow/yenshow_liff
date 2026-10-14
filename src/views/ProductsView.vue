<script setup>
defineOptions({ name: "ProductsView" });

import { onMounted, ref } from "vue";
import { searchProducts } from "@/api/products";
import EmptyState from "@/components/EmptyState.vue";
import ListSkeleton from "@/components/ListSkeleton.vue";
import ProductTeaserCard from "@/components/ProductTeaserCard.vue";

const query = ref("");
const products = ref([]);
const loading = ref(false);
const error = ref("");

const handleSearch = async (silent = false) => {
	// 勿把 submit Event 當成 silent；僅明確 true 才安靜更新
	const quiet = silent === true;
	if (!quiet || !products.value.length) loading.value = true;
	error.value = "";
	try {
		products.value = await searchProducts(query.value.trim());
	} catch (err) {
		error.value = err?.response?.data?.message || err?.message || "搜尋失敗";
	} finally {
		loading.value = false;
	}
};

onMounted(() => handleSearch(true));
</script>

<template>
	<div class="space-y-4">
		<section>
			<h1 class="text-xl font-semibold text-ys-deep">規格查詢</h1>
			<p class="mt-1 text-sm text-ys-muted">以產品型號搜尋規格書與技術文件。</p>
		</section>

		<form class="flex w-full min-w-0 items-stretch gap-2" @submit.prevent="handleSearch()">
			<input
				v-model="query"
				type="search"
				placeholder="以型號搜尋，例如 YS-AC-08"
				class="min-w-0 flex-1 rounded-xl border border-ys-line bg-white px-3 py-2.5"
				aria-label="搜尋產品"
			/>
			<button
				type="submit"
				class="shrink-0 rounded-xl bg-ys-mid px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:px-4"
				:disabled="loading"
				aria-label="搜尋"
			>
				搜尋
			</button>
		</form>

		<ListSkeleton v-if="loading" :count="3" variant="card" />
		<p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>

		<ul v-if="!loading && products.length" class="space-y-3" aria-label="產品搜尋結果">
			<li v-for="product in products" :key="product._id">
				<ProductTeaserCard :product="product" />
			</li>
		</ul>

		<EmptyState
			v-else-if="!loading && !error"
			title="沒有符合的產品"
			description="請輸入產品型號，例如 YS-AC-08 或 2CD3746。"
			action-label="重新搜尋"
			@action="handleSearch"
		/>
	</div>
</template>
