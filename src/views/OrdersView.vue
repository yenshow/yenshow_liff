<script setup>
import { onMounted, ref } from "vue";
import { listOrders } from "@/api/hub";
import EmptyState from "@/components/EmptyState.vue";
import StatusBadge from "@/components/StatusBadge.vue";

const orders = ref([]);
const loading = ref(false);
const error = ref("");

const handleLoad = async () => {
	loading.value = true;
	error.value = "";
	try {
		const data = await listOrders({ limit: 50 });
		orders.value = data?.orders || [];
	} catch (err) {
		error.value = err?.response?.data?.message || err?.message || "無法載入訂單";
		orders.value = [];
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
			<h1 class="text-xl font-semibold text-ys-deep">訂單追蹤</h1>
			<p class="mt-1 text-sm text-ys-muted">查看與您相關的訂單與交貨進度。</p>
		</section>

		<p v-if="loading" class="text-sm text-ys-muted">載入中…</p>
		<p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>

		<ul v-if="!loading && orders.length" class="space-y-3" aria-label="訂單列表">
			<li v-for="order in orders" :key="order.id">
				<RouterLink
					:to="`/orders/${encodeURIComponent(order.id)}`"
					class="flex items-center justify-between rounded-2xl border border-ys-line bg-white p-4 shadow-sm"
					tabindex="0"
					:aria-label="`查看訂單 ${order.projectName || order.poNumber}`"
				>
					<div class="min-w-0 flex-1 pr-3">
						<p class="truncate font-semibold text-ys-deep">
							{{ order.projectName || order.poNumber || order.id }}
						</p>
						<p class="mt-1 text-sm text-ys-muted">PO：{{ order.poNumber || "—" }}</p>
						<p v-if="order.nextDeliveryDate" class="mt-1 text-xs text-ys-muted">
							預計交貨：{{ order.nextDeliveryDate }}
						</p>
						<div class="mt-2">
							<StatusBadge :label="order.statusLabel || order.status" />
						</div>
					</div>
					<span class="text-xl text-ys-mid" aria-hidden="true">›</span>
				</RouterLink>
			</li>
		</ul>

		<EmptyState
			v-else-if="!loading && !error"
			title="目前沒有訂單"
			description="若剛完成綁定，請確認 CRM 是否已有訂單資料。"
			action-label="重新整理"
			@action="handleLoad"
		/>
	</div>
</template>
