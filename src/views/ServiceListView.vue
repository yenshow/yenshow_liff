<script setup>
defineOptions({ name: "ServiceListView" });

import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { listServiceTickets } from "@/api/hub";
import EmptyState from "@/components/EmptyState.vue";
import ListSkeleton from "@/components/ListSkeleton.vue";
import StatusBadge from "@/components/StatusBadge.vue";

const router = useRouter();
const tickets = ref([]);
const loading = ref(false);
const error = ref("");

const handleLoad = async () => {
	if (!tickets.value.length) loading.value = true;
	error.value = "";
	try {
		const data = await listServiceTickets({ limit: 50 });
		tickets.value = data?.tickets || [];
	} catch (err) {
		error.value = err?.response?.data?.message || err?.message || "無法載入案件";
	} finally {
		loading.value = false;
	}
};

const handleCreate = () => {
	router.push("/service/new");
};

onMounted(handleLoad);
</script>

<template>
	<div class="space-y-4">
		<section class="flex items-start justify-between gap-3">
			<div>
				<h1 class="text-xl font-semibold text-ys-deep">售後服務</h1>
				<p class="mt-1 text-sm text-ys-muted">建立案件並追蹤處理進度。</p>
			</div>
			<button
				type="button"
				class="rounded-xl bg-ys-mid px-3 py-2 text-sm font-semibold text-white"
				aria-label="新建案件"
				tabindex="0"
				@click="handleCreate"
			>
				+ 新建
			</button>
		</section>

		<ListSkeleton v-if="loading" :count="4" variant="row" />
		<p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>

		<ul v-if="!loading && tickets.length" class="space-y-3" aria-label="售後案件列表">
			<li v-for="ticket in tickets" :key="ticket.id">
				<RouterLink
					:to="`/service/${encodeURIComponent(ticket.id)}`"
					class="flex items-center justify-between rounded-2xl border border-ys-line bg-white p-4 shadow-sm"
					tabindex="0"
					:aria-label="`查看案件 ${ticket.id}`"
				>
					<div class="min-w-0 flex-1 pr-3">
						<p class="truncate font-semibold text-ys-deep">{{ ticket.title }}</p>
						<p class="mt-1 text-sm text-ys-muted">{{ ticket.id }}</p>
						<div class="mt-2">
							<StatusBadge :label="ticket.statusLabel || ticket.status" />
						</div>
					</div>
					<span class="text-xl text-ys-mid" aria-hidden="true">›</span>
				</RouterLink>
			</li>
		</ul>

		<EmptyState
			v-else-if="!loading && !error"
			title="尚無售後案件"
			description="遇到設備問題時，可建立服務案件由遠岫協助處理。"
			action-label="+ 建立案件"
			@action="handleCreate"
		/>
	</div>
</template>
