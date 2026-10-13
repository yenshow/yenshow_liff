<script setup>
import { onMounted, ref } from "vue";
import { searchProducts } from "@/api/products";
import EmptyState from "@/components/EmptyState.vue";
import ProductTeaserCard from "@/components/ProductTeaserCard.vue";

const query = ref("");
const products = ref([]);
const loading = ref(false);
const error = ref("");

const handleSearch = async () => {
	loading.value = true;
	error.value = "";
	try {
		products.value = await searchProducts(query.value.trim());
	} catch (err) {
		error.value = err?.response?.data?.message || err?.message || "搜尋失敗";
		products.value = [];
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	handleSearch();
});
</script>

<template>
	<div class="space-y-4">
		<section>
			<h1 class="sr-only">規格查詢</h1>
			<p class="text-sm text-ys-muted">搜尋產品並下載規格書。</p>
		</section>

		<form class="flex gap-2" @submit.prevent="handleSearch">
			<input
				v-model="query"
				type="search"
				placeholder="例如 YS-AC-08"
				class="flex-1 rounded-xl border border-ys-line bg-white px-3 py-2.5"
				aria-label="搜尋產品"
			/>
			<button
				type="submit"
				class="rounded-xl bg-ys-lime px-4 py-2.5 font-semibold text-ys-deep disabled:opacity-60"
				:disabled="loading"
				aria-label="搜尋"
			>
				搜尋
			</button>
		</form>

		<p v-if="loading" class="text-sm text-ys-muted">搜尋中…</p>
		<p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>

		<ul v-if="!loading && products.length" class="space-y-3" aria-label="產品搜尋結果">
			<li v-for="product in products" :key="product._id">
				<ProductTeaserCard :product="product" />
			</li>
		</ul>

		<EmptyState
			v-else-if="!loading && !error"
			title="沒有符合的產品"
			description="試試遠岫型號或關鍵字，例如 YS-AC-08。"
			action-label="重新搜尋"
			@action="handleSearch"
		/>
	</div>
</template>
