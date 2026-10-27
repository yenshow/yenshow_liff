<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { createServiceTicket, listOrders } from "@/api/hub";

const router = useRouter();
const title = ref("");
const description = ref("");
const relatedOrderId = ref("");
const contactName = ref("");
const contactPhone = ref("");
const orders = ref([]);
const loading = ref(false);
const error = ref("");

const handleLoadOrders = async () => {
	try {
		const data = await listOrders({ limit: 50 });
		orders.value = data?.orders || [];
	} catch {
		orders.value = [];
	}
};

const handleSubmit = async () => {
	loading.value = true;
	error.value = "";
	try {
		const ticket = await createServiceTicket({
			title: title.value.trim(),
			description: description.value.trim(),
			relatedOrderId: relatedOrderId.value || undefined,
			contactName: contactName.value.trim() || undefined,
			contactPhone: contactPhone.value.trim() || undefined
		});
		await router.replace(`/service/${encodeURIComponent(ticket.id)}`);
	} catch (err) {
		error.value = err?.response?.data?.message || err?.message || "建立失敗";
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	handleLoadOrders();
});
</script>

<template>
	<div class="space-y-4">
		<div class="flex items-center gap-3">
			<RouterLink
				to="/service"
				class="text-sm text-ys-mid"
				tabindex="0"
				aria-label="返回售後列表"
			>
				← 返回
			</RouterLink>
		</div>

		<section>
			<h1 class="text-xl font-semibold text-ys-deep">建立售後案件</h1>
			<p class="mt-1 text-sm text-ys-muted">描述問題後送出，遠岫將建立服務案件。</p>
		</section>

		<form class="space-y-3 rounded-2xl border border-ys-line bg-white p-4 shadow-sm" @submit.prevent="handleSubmit">
			<label class="block">
				<span class="mb-1 block text-sm font-medium">標題</span>
				<input
					v-model="title"
					type="text"
					required
					placeholder="例如：設備無法開機"
					class="w-full rounded-xl border border-ys-line px-3 py-2.5"
					aria-label="案件標題"
				/>
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium">問題描述</span>
				<textarea
					v-model="description"
					required
					rows="5"
					placeholder="請描述現象、發生時間、型號與 S/N（若有）"
					class="w-full rounded-xl border border-ys-line px-3 py-2.5"
					aria-label="問題描述"
				/>
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium">關聯訂單（選填）</span>
				<select
					v-model="relatedOrderId"
					class="w-full rounded-xl border border-ys-line px-3 py-2.5"
					aria-label="關聯訂單"
				>
					<option value="">不指定</option>
					<option v-for="order in orders" :key="order.id" :value="order.id">
						{{ order.projectName || order.id }}
					</option>
				</select>
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium">聯絡人（選填）</span>
				<input
					v-model="contactName"
					type="text"
					class="w-full rounded-xl border border-ys-line px-3 py-2.5"
					aria-label="聯絡人"
				/>
			</label>

			<label class="block">
				<span class="mb-1 block text-sm font-medium">聯絡電話（選填）</span>
				<input
					v-model="contactPhone"
					type="tel"
					class="w-full rounded-xl border border-ys-line px-3 py-2.5"
					aria-label="聯絡電話"
				/>
			</label>

			<p v-if="error" class="text-sm text-red-600" role="alert">{{ error }}</p>

			<button
				type="submit"
				class="w-full rounded-xl bg-ys-mid px-4 py-3 font-semibold text-white disabled:opacity-60"
				:disabled="loading"
				aria-label="送出案件"
			>
				{{ loading ? "送出中…" : "送出" }}
			</button>
		</form>
	</div>
</template>
