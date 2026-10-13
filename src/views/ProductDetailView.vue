<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { buildPublicDocumentUrl, getProduct } from "@/api/products";
import { useLiff } from "@/composables/useLiff";
import { fileNameFromUrl, localizedText, mediaUrl, productDocumentUrls } from "@/utils/format";

const route = useRoute();
const { openExternal } = useLiff();

const product = ref(null);
const loading = ref(false);
const error = ref("");
const downloadMessage = ref("");

const productName = computed(() => localizedText(product.value?.name, product.value?.code || ""));
const documentUrls = computed(() => productDocumentUrls(product.value));
const imageUrl = computed(() =>
	mediaUrl(product.value?.image || product.value?.images?.[0] || product.value?.coverImage)
);

const handleLoad = async () => {
	loading.value = true;
	error.value = "";
	try {
		product.value = await getProduct(route.params.id);
	} catch (err) {
		error.value = err?.response?.data?.message || err?.message || "無法載入產品";
		product.value = null;
	} finally {
		loading.value = false;
	}
};

const handleDownload = async (documentUrl) => {
	downloadMessage.value = "";
	error.value = "";
	try {
		const url = await buildPublicDocumentUrl({
			productId: product.value._id,
			documentUrl
		});
		openExternal(url);
		downloadMessage.value = "已開啟下載連結";
	} catch (err) {
		error.value = err?.response?.data?.message || err?.message || "無法取得下載連結";
	}
};

const handleAskSales = () => {
	openExternal("https://www.yenshow.com");
};

onMounted(() => {
	handleLoad();
});
</script>

<template>
	<div class="space-y-4">
		<RouterLink to="/products" class="text-sm text-ys-mid" tabindex="0" aria-label="返回規格查詢">
			← 返回
		</RouterLink>

		<p v-if="loading" class="text-sm text-ys-muted">載入中…</p>
		<p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>
		<p v-if="downloadMessage" class="text-sm text-emerald-700">{{ downloadMessage }}</p>

		<template v-if="product">
			<section class="overflow-hidden rounded-2xl border border-ys-line bg-white shadow-sm">
				<img v-if="imageUrl" :src="imageUrl" :alt="productName" class="h-48 w-full object-cover" />
				<div class="space-y-2 p-4">
					<h1 class="text-xl font-semibold text-ys-deep">{{ product.code }}</h1>
					<p class="text-ys-muted">{{ productName }}</p>
					<p v-if="product.oemModel || product.originalModel" class="text-sm text-ys-muted">
						原廠型號：{{ product.oemModel || product.originalModel }}
					</p>
				</div>
			</section>

			<section class="space-y-2">
				<h2 class="text-base font-semibold text-ys-deep">規格文件</h2>
				<button
					v-for="doc in documentUrls"
					:key="doc"
					type="button"
					class="block w-full rounded-xl border border-ys-line bg-white px-4 py-3 text-left text-sm hover:border-ys-mid"
					:aria-label="`下載 ${fileNameFromUrl(doc)}`"
					tabindex="0"
					@click="handleDownload(doc)"
				>
					下載 {{ fileNameFromUrl(doc) }}
				</button>
				<p v-if="!documentUrls.length" class="text-sm text-ys-muted">此產品尚無已上傳規格書</p>
			</section>

			<button
				type="button"
				class="w-full rounded-xl bg-ys-lime px-4 py-3 font-semibold text-ys-deep"
				aria-label="詢問業務"
				tabindex="0"
				@click="handleAskSales"
			>
				詢問業務
			</button>
		</template>
	</div>
</template>
