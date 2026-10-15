<script setup>
defineOptions({ name: "HomeView" });

import { onMounted, ref } from "vue";
import { getOrder, listOrders } from "@/api/hub";
import { searchProducts } from "@/api/products";
import AppIcon from "@/components/AppIcon.vue";
import ListSkeleton from "@/components/ListSkeleton.vue";
import OrderProgressCard from "@/components/OrderProgressCard.vue";
import ProductTeaserCard from "@/components/ProductTeaserCard.vue";

const menuItems = [
	{ to: "/orders", title: "訂單追蹤", desc: "查詢訂單與交貨進度", icon: "orders" },
	{ to: "/service", title: "售後服務", desc: "報修申請與進度查詢", icon: "support" },
	{ to: "/info", title: "產品推廣", desc: "最新產品與活動資訊", icon: "promo" },
	{ to: "/products", title: "規格查詢", desc: "產品規格與技術文件", icon: "specs" }
];

const ongoingOrders = ref([]);
const ordersLoading = ref(false);
const ordersError = ref("");

const recommended = ref([]);
const productsLoading = ref(false);
const productsError = ref("");

const handleLoadOngoingOrders = async () => {
	if (!ongoingOrders.value.length) ordersLoading.value = true;
	ordersError.value = "";
	try {
		const data = await listOrders({ limit: 3 });
		const list = (data?.orders || []).slice(0, 3);
		if (!list.length) {
			ongoingOrders.value = [];
			return;
		}

		ongoingOrders.value = list;
		ongoingOrders.value = await Promise.all(
			list.map(async (order) => {
				if (!order?.id) return order;
				try {
					return (await getOrder(order.id)) || order;
				} catch {
					return order;
				}
			})
		);
	} catch (err) {
		ordersError.value = err?.response?.data?.message || err?.message || "無法載入訂單";
	} finally {
		ordersLoading.value = false;
	}
};

const handleLoadRecommended = async () => {
	if (!recommended.value.length) productsLoading.value = true;
	productsError.value = "";
	try {
		const list = await searchProducts("");
		recommended.value = (list || []).slice(0, 3);
	} catch (err) {
		productsError.value = err?.response?.data?.message || err?.message || "無法載入推薦產品";
	} finally {
		productsLoading.value = false;
	}
};

onMounted(() => {
	handleLoadOngoingOrders();
	handleLoadRecommended();
});
</script>

<template>
	<div>
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
					<p class="text-base font-semibold text-ys-deep">{{ item.title }}</p>
					<p class="mt-0.5 line-clamp-2 text-xs text-ys-muted">{{ item.desc }}</p>
				</div>
			</RouterLink>
		</nav>

		<section class="mb-6" aria-labelledby="ongoing-orders-heading">
			<div class="mb-3 flex items-center justify-between gap-2">
				<h2 id="ongoing-orders-heading" class="text-base font-semibold text-ys-deep">進行中的訂單</h2>
				<RouterLink to="/orders" class="text-sm font-medium text-ys-mid" aria-label="查看全部訂單">
					查看全部 ›
				</RouterLink>
			</div>

			<ListSkeleton v-if="ordersLoading" :count="3" variant="row" />
			<p v-else-if="ordersError" class="text-sm text-red-600" role="alert">{{ ordersError }}</p>
			<ul v-else-if="ongoingOrders.length" class="space-y-3" aria-label="進行中的訂單">
				<li v-for="order in ongoingOrders" :key="order.id">
					<OrderProgressCard :order="order" />
				</li>
			</ul>
			<p
				v-else
				class="rounded-2xl border border-dashed border-ys-line bg-ys-card px-4 py-6 text-center text-sm text-ys-muted"
			>
				目前沒有進行中的訂單
			</p>
		</section>

		<section aria-labelledby="recommended-heading">
			<div class="mb-3 flex items-center justify-between gap-2">
				<h2 id="recommended-heading" class="text-base font-semibold text-ys-deep">推薦產品</h2>
				<RouterLink to="/products" class="text-sm font-medium text-ys-mid" aria-label="查看更多推薦產品">
					查看更多 ›
				</RouterLink>
			</div>

			<ListSkeleton v-if="productsLoading" :count="2" variant="card" />
			<p v-else-if="productsError" class="text-sm text-red-600" role="alert">{{ productsError }}</p>
			<ul v-else-if="recommended.length" class="space-y-3" aria-label="推薦產品">
				<li v-for="product in recommended" :key="product._id">
					<ProductTeaserCard :product="product" />
				</li>
			</ul>
			<p v-else class="text-sm text-ys-muted">目前沒有推薦產品。</p>
		</section>
	</div>
</template>
