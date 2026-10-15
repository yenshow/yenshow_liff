<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import BottomTabBar from "@/components/BottomTabBar.vue";
import { useAuth } from "@/composables/useAuth";

/** 與各 tab 根頁 defineOptions.name 對應 */
const TAB_KEEP_ALIVE = ["HomeView", "OrdersView", "ServiceListView", "ProductInfoView", "ProductsView"];

const route = useRoute();
const { lineProfile, companyName, bound } = useAuth();

const isHome = computed(() => route.name === "home");
const displayName = computed(() => lineProfile.value?.displayName || "遠岫客戶");
const subtitle = computed(() => companyName.value || "已綁定客戶");
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
					<div class="min-w-0 space-y-1">
						<p class="truncate text-xl font-semibold">{{ displayName }}</p>
						<p class="truncate text-base text-white/75">{{ subtitle }}</p>
					</div>
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
	</div>
</template>
