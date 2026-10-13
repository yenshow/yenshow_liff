<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getOrder } from "@/api/hub";
import StatusBadge from "@/components/StatusBadge.vue";

const route = useRoute();
const order = ref(null);
const loading = ref(false);
const error = ref("");

const title = computed(() => order.value?.projectName || order.value?.poNumber || "訂單詳情");

const handleLoad = async () => {
	loading.value = true;
	error.value = "";
	try {
		order.value = await getOrder(route.params.id);
	} catch (err) {
		error.value = err?.response?.data?.message || err?.message || "無法載入訂單";
		order.value = null;
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
		<div class="flex items-center gap-3">
			<RouterLink
				to="/orders"
				class="text-sm text-ys-mid"
				tabindex="0"
				aria-label="返回訂單列表"
			>
				← 返回
			</RouterLink>
		</div>

		<p v-if="loading" class="text-sm text-ys-muted">載入中…</p>
		<p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>

		<template v-if="order">
			<section class="rounded-2xl border border-ys-line bg-white p-4 shadow-sm">
				<h1 class="text-xl font-semibold text-ys-deep">{{ title }}</h1>
				<p class="mt-1 text-sm text-ys-muted">PO：{{ order.poNumber || "—" }}</p>
				<div class="mt-3">
					<StatusBadge :label="order.statusLabel || order.status" />
				</div>
				<p v-if="order.nextDeliveryDate" class="mt-3 text-sm">
					下一批預計交貨：
					<span class="font-medium">{{ order.nextDeliveryDate }}</span>
				</p>
			</section>

			<section class="space-y-3">
				<h2 class="text-base font-semibold text-ys-deep">商品內容</h2>
				<ul class="space-y-2" aria-label="訂單品項">
					<li
						v-for="(item, index) in order.items || []"
						:key="`${item.sku}-${index}`"
						class="rounded-2xl border border-ys-line bg-white p-4"
					>
						<p class="font-medium">{{ item.sku }}</p>
						<p class="text-sm text-ys-muted">{{ item.name }}</p>
						<div class="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
							<div class="rounded-xl bg-ys-surface py-2">
								<p class="text-xs text-ys-muted">訂購</p>
								<p class="font-semibold">{{ item.orderedQty }}</p>
							</div>
							<div class="rounded-xl bg-ys-surface py-2">
								<p class="text-xs text-ys-muted">已交</p>
								<p class="font-semibold">{{ item.shippedQty }}</p>
							</div>
							<div class="rounded-xl bg-ys-lime/40 py-2">
								<p class="text-xs text-ys-muted">待交</p>
								<p class="font-semibold">{{ item.pendingQty }}</p>
							</div>
						</div>
					</li>
				</ul>
			</section>

			<section v-if="order.shipments?.length" class="space-y-3">
				<h2 class="text-base font-semibold text-ys-deep">出貨紀錄</h2>
				<ul class="space-y-2" aria-label="出貨紀錄">
					<li
						v-for="shipment in order.shipments"
						:key="shipment.shipmentNo"
						class="rounded-2xl border border-ys-line bg-white p-4 text-sm"
					>
						<p class="font-medium">{{ shipment.shipmentNo }}</p>
						<p class="text-ys-muted">出貨日：{{ shipment.shippedAt || "—" }}</p>
						<p
							v-for="(line, idx) in shipment.items || []"
							:key="`${shipment.shipmentNo}-${idx}`"
							class="mt-1"
						>
							{{ line.sku }} × {{ line.qty }}
						</p>
					</li>
				</ul>
			</section>
		</template>
	</div>
</template>
