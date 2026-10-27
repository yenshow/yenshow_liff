<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import BottomTabBar from "@/components/BottomTabBar.vue";
import { useAuth } from "@/composables/useAuth";

/** 與各 tab 根頁 defineOptions.name 對應 */
const TAB_KEEP_ALIVE = ["HomeView", "OrdersView", "ServiceListView", "ProductInfoView", "ProductsView"];

const route = useRoute();
const router = useRouter();
const { lineProfile, companyName, bound, unbindCompany } = useAuth();

const isHome = computed(() => route.name === "home");
const displayName = computed(() => lineProfile.value?.displayName || "遠岫客戶");
const subtitle = computed(() => companyName.value || "已綁定客戶");

const confirmUnbind = ref(false);
const unbindLoading = ref(false);
const unbindError = ref("");

const handleOpenUnbind = () => {
	unbindError.value = "";
	confirmUnbind.value = true;
};

const handleCancelUnbind = () => {
	if (unbindLoading.value) return;
	confirmUnbind.value = false;
	unbindError.value = "";
};

const handleDialogKeydown = (event) => {
	if (event.key === "Escape") handleCancelUnbind();
};

const handleConfirmUnbind = async () => {
	if (unbindLoading.value) return;
	unbindLoading.value = true;
	unbindError.value = "";
	try {
		await unbindCompany();
		confirmUnbind.value = false;
		await router.replace({ name: "bind" });
	} catch (err) {
		unbindError.value = err?.response?.data?.message || err?.message || "解除綁定失敗";
	} finally {
		unbindLoading.value = false;
	}
};
</script>

<template>
	<div class="flex min-h-screen flex-col bg-ys-deep text-ys-text">
		<header v-if="isHome" class="shrink-0 text-white">
			<div class="mx-auto max-w-lg px-4 py-6">
				<div class="flex min-w-0 items-center gap-3">
					<img
						v-if="lineProfile?.pictureUrl"
						:src="lineProfile.pictureUrl"
						:alt="displayName"
						class="h-20 w-20 shrink-0 rounded-full object-cover"
					/>
					<div
						v-else
						class="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-white/15 text-base font-semibold"
						aria-hidden="true"
					>
						{{ displayName.slice(0, 1) }}
					</div>
					<div class="min-w-0 flex-1 space-y-1">
						<p class="truncate text-xl font-semibold">{{ displayName }}</p>
						<p class="truncate text-base text-white/75">{{ subtitle }}</p>
					</div>
					<button
						v-if="bound"
						type="button"
						class="shrink-0 cursor-pointer rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ys-deep"
						aria-label="解除公司綁定"
						tabindex="0"
						@click="handleOpenUnbind"
					>
						解除綁定
					</button>
				</div>
			</div>
		</header>

		<!-- 非首頁保留頂部綠色邊，與首頁內容區塊銜接方式一致 -->
		<div v-else class="shrink-0 pt-3" aria-hidden="true" />

		<main
			class="mx-auto w-full max-w-lg flex-1 rounded-t-3xl bg-ys-surface px-4 pt-6"
			:class="bound ? 'pb-24' : 'pb-8'"
		>
			<RouterView v-slot="{ Component, route: viewRoute }">
				<Transition name="page-fade" mode="out-in">
					<KeepAlive :include="TAB_KEEP_ALIVE">
						<component
							:is="Component"
							:key="viewRoute.meta.keepAlive ? viewRoute.name : viewRoute.fullPath"
						/>
					</KeepAlive>
				</Transition>
			</RouterView>
		</main>

		<BottomTabBar v-if="bound" />

		<div
			v-if="confirmUnbind"
			class="fixed inset-0 z-50 flex items-end justify-center bg-black/45 px-4 pb-8 pt-16 sm:items-center"
			@click.self="handleCancelUnbind"
		>
			<div
				class="w-full max-w-sm rounded-2xl bg-white p-5 text-ys-text shadow-lg"
				role="dialog"
				aria-modal="true"
				aria-labelledby="unbind-dialog-title"
				tabindex="0"
				@keydown="handleDialogKeydown"
			>
				<h2 id="unbind-dialog-title" class="text-lg font-semibold text-ys-deep">解除公司綁定</h2>
				<p class="mt-2 text-sm leading-relaxed text-ys-muted">
					確定要解除「{{ subtitle }}」？解除後需重新輸入訂單編號與統編，才能查看訂單與售後服務。
				</p>
				<p v-if="unbindError" class="mt-3 text-sm text-red-600" role="alert">{{ unbindError }}</p>
				<div class="mt-5 grid grid-cols-2 gap-2">
					<button
						type="button"
						class="cursor-pointer rounded-xl border border-ys-line px-4 py-2.5 text-sm font-semibold text-ys-deep disabled:cursor-not-allowed disabled:opacity-60"
						aria-label="取消解除綁定"
						tabindex="0"
						:disabled="unbindLoading"
						@click="handleCancelUnbind"
					>
						取消
					</button>
					<button
						type="button"
						class="cursor-pointer rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
						aria-label="確定解除公司綁定"
						tabindex="0"
						:disabled="unbindLoading"
						@click="handleConfirmUnbind"
					>
						{{ unbindLoading ? "解除中…" : "確定解除" }}
					</button>
				</div>
			</div>
		</div>
	</div>
</template>
