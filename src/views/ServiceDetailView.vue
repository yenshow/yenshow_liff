<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getServiceTicket } from "@/api/hub";
import StatusBadge from "@/components/StatusBadge.vue";

const route = useRoute();
const ticket = ref(null);
const loading = ref(false);
const error = ref("");

const timeline = computed(() => {
	if (ticket.value?.timeline?.length) return ticket.value.timeline;
	const created = ticket.value?.createdAt;
	const updated = ticket.value?.updatedAt;
	const items = [];
	if (created) items.push({ at: created, label: "案件建立" });
	if (updated && updated !== created) {
		items.push({ at: updated, label: ticket.value?.statusLabel || "狀態更新" });
	}
	return items;
});

const handleLoad = async () => {
	loading.value = true;
	error.value = "";
	try {
		ticket.value = await getServiceTicket(route.params.id);
	} catch (err) {
		error.value = err?.response?.data?.message || err?.message || "無法載入案件";
		ticket.value = null;
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
		<RouterLink to="/service" class="text-sm text-ys-mid" tabindex="0" aria-label="返回售後列表">
			← 返回
		</RouterLink>

		<p v-if="loading" class="text-sm text-ys-muted">載入中…</p>
		<p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>

		<template v-if="ticket">
			<section class="rounded-2xl border border-ys-line bg-white p-4 shadow-sm">
				<p class="text-sm text-ys-muted">{{ ticket.id }}</p>
				<h1 class="mt-1 text-xl font-semibold text-ys-deep">{{ ticket.title }}</h1>
				<div class="mt-3">
					<StatusBadge :label="ticket.statusLabel || ticket.status" />
				</div>
				<p v-if="ticket.relatedOrderId" class="mt-3 text-sm text-ys-muted">
					關聯訂單：{{ ticket.relatedOrderId }}
				</p>
				<p v-if="ticket.description" class="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
					{{ ticket.description }}
				</p>
			</section>

			<section class="space-y-3">
				<h2 class="text-base font-semibold text-ys-deep">處理進度</h2>
				<ol class="space-y-3" aria-label="案件時間軸">
					<li
						v-for="(step, index) in timeline"
						:key="`${step.at}-${index}`"
						class="relative rounded-2xl border border-ys-line bg-white p-4 pl-5"
					>
						<p class="text-sm font-medium">{{ step.label }}</p>
						<p class="mt-1 text-xs text-ys-muted">{{ step.at }}</p>
					</li>
				</ol>
				<p v-if="!timeline.length" class="text-sm text-ys-muted">尚無進度紀錄</p>
			</section>
		</template>
	</div>
</template>
