<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { getOrder, listOrders } from "@/api/hub";
import { searchProducts } from "@/api/products";
import AppIcon from "@/components/AppIcon.vue";
import OrderProgressCard from "@/components/OrderProgressCard.vue";
import ProductTeaserCard from "@/components/ProductTeaserCard.vue";
import { useAuth } from "@/composables/useAuth";

const { booting, authError, boot, bound, companyName } = useAuth();

const menuItems = computed(() => [
	{
		to: "/orders",
		title: "訂單追蹤",
		desc: bound.value ? "查看訂單與交貨進度" : "綁定後可查看訂單",
		icon: "orders"
	},
	{
		to: "/info",
		title: "產品推廣",
		desc: "最新產品與活動資訊",
		icon: "promo"
	},
	{
		to: "/products",
		title: "規格查詢",
		desc: "產品規格與技術文件",
		icon: "specs"
	},
	{
		to: "/service",
		title: "售後服務",
		desc: bound.value ? "報修與查詢案件進度" : "綁定後可建立案件",
		icon: "support"
	}
]);

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
		return;
	}
	ordersLoading.value = true;
	ordersError.value = "";
	try {
		const data = await listOrders({ limit: 5 });
		const list = data?.orders || [];
		const first = list[0];
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

watch(bound, () => {
	handleLoadOngoingOrder();
});

onMounted(() => {
	handleLoadOngoingOrder();
	handleLoadRecommended();
});
</script>

<template>
	<div>
		<p v-if="booting" class="text-sm text-ys-muted" role="status">正在連線 LINE…</p>
		<div v-else-if="authError" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
			{{ authError }}
			<button type="button" class="mt-3 block w-full rounded-xl bg-red-600 px-3 py-2 text-white" aria-label="重試" tabindex="0" @click="handleRetry">
				重試
			</button>
		</div>
		<template v-else>
			<section class="mb-5">
				<h1 class="sr-only">我的遠岫</h1>
				<p v-if="!bound" class="mb-3 text-sm text-ys-muted">公開功能可直接使用；訂單與售後需先完成綁定。</p>
				<RouterLink
					v-if="!bound"
					to="/bind"
					class="mb-4 inline-flex rounded-xl bg-ys-lime px-4 py-2 text-sm font-semibold text-ys-deep"
					tabindex="0"
					aria-label="前往帳號綁定"
				>
					立即綁定
				</RouterLink>
				<p v-else class="mb-4 text-sm text-ys-muted">已綁定 {{ companyName || "客戶" }}，可查詢訂單與售後。</p>

				<nav class="grid grid-cols-2 gap-3" aria-label="功能選單">
					<RouterLink
						v-for="item in menuItems"
						:key="item.to"
						:to="item.to"
						class="flex min-h-30 flex-col justify-between rounded-2xl border border-ys-line bg-white p-4 shadow-sm transition hover:border-ys-mid"
						tabindex="0"
						:aria-label="item.title"
					>
						<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-ys-mid/10 text-ys-mid">
							<AppIcon :name="item.icon" :size="22" />
						</span>
						<div>
							<p class="font-semibold text-ys-deep">{{ item.title }}</p>
							<p class="mt-1 text-xs leading-snug text-ys-muted">{{ item.desc }}</p>
						</div>
					</RouterLink>
				</nav>
			</section>

			<section class="mb-6" aria-labelledby="ongoing-orders-heading">
				<div class="mb-3 flex items-center justify-between gap-2">
					<h2 id="ongoing-orders-heading" class="text-base font-semibold text-ys-deep">進行中的訂單</h2>
					<RouterLink v-if="bound" to="/orders" class="text-sm font-medium text-ys-mid" tabindex="0" aria-label="查看全部訂單"> 查看全部 › </RouterLink>
				</div>

				<p v-if="bound && ordersLoading" class="text-sm text-ys-muted">載入訂單中…</p>
				<p v-else-if="bound && ordersError" class="text-sm text-red-600" role="alert">
					{{ ordersError }}
				</p>
				<OrderProgressCard v-else-if="bound && ongoingOrder" :order="ongoingOrder" />
				<div v-else-if="bound" class="rounded-2xl border border-dashed border-ys-line bg-white px-4 py-6 text-center text-sm text-ys-muted">
					目前沒有進行中的訂單
				</div>
				<div v-else class="rounded-2xl border border-ys-line bg-white p-4 text-sm text-ys-muted shadow-sm">
					<p>綁定帳號後即可查看交貨進度。</p>
					<RouterLink to="/bind" class="mt-3 inline-flex font-semibold text-ys-mid" tabindex="0" aria-label="前往帳號綁定以查看訂單"> 前往綁定 › </RouterLink>
				</div>
			</section>

			<section aria-labelledby="recommended-heading">
				<div class="mb-3 flex items-center justify-between gap-2">
					<h2 id="recommended-heading" class="text-base font-semibold text-ys-deep">推薦產品</h2>
					<RouterLink to="/products" class="text-sm font-medium text-ys-mid" tabindex="0" aria-label="查看全部規格"> 全部 › </RouterLink>
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
