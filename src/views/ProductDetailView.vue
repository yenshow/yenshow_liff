<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { buildPublicDocumentUrl, getProduct } from "@/api/products";
import AppIcon from "@/components/AppIcon.vue";
import { useLiff } from "@/composables/useLiff";
import { localizedText, mediaUrl, productSpecDocuments } from "@/utils/format";

const route = useRoute();
const { openDocument, askSalesViaLine } = useLiff();

const product = ref(null);
const loading = ref(false);
const error = ref("");
const salesMessage = ref("");
const salesLoading = ref(false);

const productName = computed(() => localizedText(product.value?.name, product.value?.code || ""));
const description = computed(() => localizedText(product.value?.description, ""));
const specDocuments = computed(() => productSpecDocuments(product.value));
const imageUrl = computed(() => mediaUrl(product.value?.image || product.value?.images?.[0] || product.value?.coverImage));

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

const handleOpenSpec = async (documentUrl) => {
	error.value = "";
	const productId = product.value?._id || product.value?.id;
	if (!productId || !documentUrl) {
		error.value = "無法開啟規格書";
		return;
	}
	try {
		const url = await buildPublicDocumentUrl({ productId, documentUrl });
		openDocument(url);
	} catch (err) {
		error.value = err?.response?.data?.message || err?.message || "無法開啟規格書";
	}
};

const handleAskSales = async () => {
	if (!product.value) return;
	salesMessage.value = "";
	error.value = "";
	salesLoading.value = true;
	try {
		const text = ["您好，想詢問以下產品規格／報價：", `型號：${product.value.code}`, productName.value ? `名稱：${productName.value}` : null]
			.filter(Boolean)
			.join("\n");

		const result = await askSalesViaLine(text);
		if (result.method === "oaMessage") {
			salesMessage.value = "已開啟 LINE 對話，請直接傳送訊息給業務。";
		}
	} catch (err) {
		error.value = err?.message || "無法開啟詢問業務";
	} finally {
		salesLoading.value = false;
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
				to="/products"
				class="text-sm text-ys-mid"
				tabindex="0"
				aria-label="返回規格查詢"
			>
				← 返回
			</RouterLink>
		</div>

		<p v-if="loading" class="text-sm text-ys-muted">載入中…</p>
		<p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>
		<p v-if="salesMessage" class="text-sm text-emerald-700">{{ salesMessage }}</p>

		<template v-if="product">
			<section class="overflow-hidden rounded-2xl border border-ys-line bg-white">
				<div class="flex aspect-4/3 items-center justify-center bg-ys-surface px-6 py-8">
					<img v-if="imageUrl" :src="imageUrl" :alt="productName" class="max-h-full max-w-full object-contain" />
					<span v-else class="text-sm text-ys-muted">尚無產品圖片</span>
				</div>
				<div class="space-y-2 border-t border-ys-line px-4 py-4">
					<p class="text-xs font-medium tracking-wide text-ys-mid">產品型號</p>
					<h1 class="break-all text-xl font-semibold leading-snug text-ys-deep">{{ product.code }}</h1>
					<p class="text-sm leading-relaxed text-ys-muted">{{ productName }}</p>
					<p v-if="product.oemModel || product.originalModel" class="text-sm text-ys-muted">原廠型號：{{ product.oemModel || product.originalModel }}</p>
					<p v-if="description" class="pt-1 text-sm leading-relaxed text-ys-text">{{ description }}</p>
				</div>
			</section>

			<section class="space-y-3" aria-labelledby="spec-docs-heading">
				<h2 id="spec-docs-heading" class="text-base font-semibold text-ys-deep">規格文件</h2>
				<div v-if="specDocuments.length" class="grid gap-2">
					<button
						v-for="doc in specDocuments"
						:key="`${doc.lang}-${doc.url}`"
						type="button"
						class="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-ys-mid bg-white px-4 py-3.5 text-left"
						:aria-label="`開啟${doc.label}`"
						tabindex="0"
						@click="handleOpenSpec(doc.url)"
					>
						<span class="inline-flex min-w-0 items-center gap-2.5 font-semibold text-ys-deep">
							<span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ys-lime text-ys-mid">
								<AppIcon name="document" :size="18" />
							</span>
							<span>{{ doc.label }}</span>
						</span>
						<span class="shrink-0 text-sm font-medium text-ys-mid">開啟 ›</span>
					</button>
				</div>
				<p v-else class="rounded-xl border border-dashed border-ys-line bg-white px-4 py-5 text-center text-sm text-ys-muted">此產品尚無已上傳規格書</p>
			</section>

			<button
				type="button"
				class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-ys-mid px-4 py-3.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
				aria-label="詢問業務"
				tabindex="0"
				:disabled="salesLoading"
				@click="handleAskSales"
			>
				<AppIcon name="support" :size="18" />
				{{ salesLoading ? "開啟中…" : "詢問業務" }}
			</button>
		</template>
	</div>
</template>
