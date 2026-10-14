<script setup>
import { computed } from "vue";
import StatusBadge from "@/components/StatusBadge.vue";

const props = defineProps({
	order: { type: Object, required: true }
});

const title = computed(
	() => props.order?.projectName || props.order?.poNumber || props.order?.id || "訂單"
);

const totals = computed(() => {
	const items = props.order?.items || [];
	if (!items.length) return null;
	const ordered = items.reduce((sum, item) => sum + (Number(item.orderedQty) || 0), 0);
	const shipped = items.reduce((sum, item) => sum + (Number(item.shippedQty) || 0), 0);
	if (!ordered) return null;
	return { ordered, shipped, percent: Math.min(100, Math.round((shipped / ordered) * 100)) };
});

const progressLabel = computed(() => {
	if (!totals.value) return props.order?.statusLabel || props.order?.status || "進行中";
	return `已出貨 ${totals.value.shipped}/${totals.value.ordered} 件`;
});
</script>

<template>
	<RouterLink
		:to="`/orders/${encodeURIComponent(order.id)}`"
		class="block rounded-2xl border border-ys-line bg-ys-card p-4"
		:aria-label="`查看訂單 ${title}`"
	>
		<div class="flex items-start justify-between gap-3">
			<div class="min-w-0">
				<p class="truncate font-semibold text-ys-deep">{{ title }}</p>
				<p class="mt-1 text-sm text-ys-muted">{{ progressLabel }}</p>
			</div>
			<StatusBadge :label="order.statusLabel || order.status" />
		</div>

		<div v-if="totals" class="mt-3 h-2 overflow-hidden rounded-full bg-ys-surface">
			<div
				class="h-full rounded-full bg-ys-mid"
				role="progressbar"
				:aria-valuenow="totals.percent"
				aria-valuemin="0"
				aria-valuemax="100"
				:style="{ width: `${totals.percent}%` }"
			/>
		</div>

		<p v-if="order.nextDeliveryDate" class="mt-3 text-xs text-ys-muted">
			下一批預計：{{ order.nextDeliveryDate }}
		</p>
	</RouterLink>
</template>
