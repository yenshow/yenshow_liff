<script setup>
import { onMounted, ref, watch } from "vue";
import { getOrder, listOrders } from "@/api/hub";
import { searchProducts } from "@/api/products";
import AppIcon from "@/components/AppIcon.vue";
import OrderProgressCard from "@/components/OrderProgressCard.vue";
import ProductTeaserCard from "@/components/ProductTeaserCard.vue";
import { useAuth } from "@/composables/useAuth";

const { booting, authError, boot, bound } = useAuth();

const menuItems = [
	{ to: "/orders", title: "訂單追蹤", desc: "查詢訂單與交貨進度", icon: "orders" },
	{ to: "/service", title: "售後服務", desc: "報修申請與進度查詢", icon: "support" },
	{ to: "/info", title: "產品推廣", desc: "最新產品與活動資訊", icon: "promo" },
	{ to: "/products", title: "規格查詢", desc: "產品規格與技術文件", icon: "specs" }
];

const ongoingOrder = ref(null);
const ordersLoading = ref(false);
const ordersError = ref("");

const recommended = ref([]);
const productsLoading = ref(false);
const productsError = ref("");

const handleRetry = () => {
	boot();
};

const handleLoadOngoingOrder = async () => {
	if (!bound.value) {
		ongoingOrder.value = null;
		ordersLoading.value = false;
		ordersError.value = "";
		return;
	}

	ordersLoading.value = true;
	ordersError.value = "";
	try {
		const data = await listOrders({ limit: 5 });
		const first = data?.orders?.[0];
		if (!first?.id) {
			ongoingOrder.value = null;
			return;
		}
		try {
			ongoingOrder.value = await getOrder(first.id);
		} catch {
			ongoingOrder.value = first;
		}
	} catch (err) {
		ordersError.value = err?.response?.data?.message || err?.message || "無法載入訂單";
		ongoingOrder.value = null;
	} finally {
		ordersLoading.value = false;
	}
};

const handleLoadRecommended = async () => {
	productsLoading.value = true;
	productsError.value = "";
	try {
		const list = await searchProducts("");
		recommended.value = (list || []).slice(0, 3);
	} catch (err) {
		productsError.value = err?.response?.data?.message || err?.message || "無法載入推薦產品";
		recommended.value = [];
	} finally {
		productsLoading.value = false;
	}
};

watch(bound, handleLoadOngoingOrder, { immediate: true });
onMounted(handleLoadRecommended);
</script>

<template>
	<div>
		<p v-if="booting" class="text-sm text-ys-muted" role="status">正在連線 LINE…</p>
		<div v-else-if="authError" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
			{{ authError }}
			<button type="button" class="mt-3 block w-full rounded-xl bg-red-600 px-3 py-2 text-white" aria-label="重試" @click="handleRetry">重試</button>
		</div>
		<template v-else>
			<nav class="mb-6 grid grid-cols-2 gap-3" aria-label="功能選單">
				<RouterLink
					v-for="item in menuItems"
					:key="item.to"
					:to="item.to"
					class="flex items-center gap-2 rounded-2xl border border-ys-line bg-ys-card p-3"
					:aria-label="item.title"
				>
					<span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-ys-lime text-ys-mid">
						<AppIcon :name="item.icon" :size="28" />
					</span>
					<div class="min-w-0 flex-1">
						<p class="text-lg font-semibold text-ys-deep">{{ item.title }}</p>
						<p class="mt-0.5 line-clamp-2 text-sm text-ys-muted">{{ item.desc }}</p>
					</div>
				</RouterLink>
			</nav>

			<section class="mb-6" aria-labelledby="ongoing-orders-heading">
				<div class="mb-3 flex items-center justify-between gap-2">
					<h2 id="ongoing-orders-heading" class="text-base font-semibold text-ys-deep">進行中的訂單</h2>
					<RouterLink v-if="bound" to="/orders" class="text-sm font-medium text-ys-mid" aria-label="查看全部訂單"> 查看全部 › </RouterLink>
				</div>

				<p v-if="!bound" class="rounded-2xl border border-ys-line bg-ys-card p-4 text-sm text-ys-muted">綁定帳號後即可查看交貨進度。</p>
				<p v-else-if="ordersLoading" class="text-sm text-ys-muted">載入訂單中…</p>
				<p v-else-if="ordersError" class="text-sm text-red-600" role="alert">{{ ordersError }}</p>
				<OrderProgressCard v-else-if="ongoingOrder" :order="ongoingOrder" />
				<p v-else class="rounded-2xl border border-dashed border-ys-line bg-ys-card px-4 py-6 text-center text-sm text-ys-muted">目前沒有進行中的訂單</p>
			</section>

			<section aria-labelledby="recommended-heading">
				<div class="mb-3 flex items-center justify-between gap-2">
					<h2 id="recommended-heading" class="text-base font-semibold text-ys-deep">推薦產品</h2>
					<RouterLink to="/products" class="text-sm font-medium text-ys-mid" aria-label="查看更多推薦產品"> 查看更多 › </RouterLink>
				</div>

				<p v-if="productsLoading" class="text-sm text-ys-muted">載入產品中…</p>
				<p v-else-if="productsError" class="text-sm text-red-600" role="alert">
					{{ productsError }}
				</p>
				<ul v-else-if="recommended.length" class="space-y-3" aria-label="推薦產品">
					<li v-for="product in recommended" :key="product._id">
						<ProductTeaserCard :product="product" />
					</li>
				</ul>
				<p v-else class="text-sm text-ys-muted">目前沒有推薦產品。</p>
			</section>
		</template>
	</div>
</template>
