<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import BottomTabBar from "@/components/BottomTabBar.vue";
import { useAuth } from "@/composables/useAuth";

const route = useRoute();
const { lineProfile, companyName, bound } = useAuth();

const isHome = computed(() => route.name === "home");
const showPageTitle = computed(() => !isHome.value && Boolean(route.meta.title));
const pageTitle = computed(() => route.meta.title || "我的遠岫");
const isDetailRoute = computed(() =>
	["order-detail", "product-detail", "info-detail", "service-detail", "service-new", "bind"].includes(
		route.name
	)
);
</script>

<template>
	<div class="min-h-screen bg-ys-surface text-ys-text">
		<header
			v-if="isHome || (showPageTitle && !isDetailRoute)"
			class="sticky top-0 z-20 border-b border-ys-line/80 bg-white/95 backdrop-blur-md"
		>
			<div class="mx-auto max-w-lg px-4 py-3">
				<template v-if="isHome">
					<div class="flex items-center gap-3">
						<img
							v-if="lineProfile?.pictureUrl"
							:src="lineProfile.pictureUrl"
							:alt="lineProfile.displayName || '使用者頭像'"
							class="h-12 w-12 rounded-full object-cover ring-2 ring-ys-lime/60"
						/>
						<div
							v-else
							class="flex h-12 w-12 items-center justify-center rounded-full bg-ys-deep text-sm font-semibold text-white"
							aria-hidden="true"
						>
							{{ (lineProfile?.displayName || "遠").slice(0, 1) }}
						</div>
						<div class="min-w-0">
							<p class="truncate text-lg font-semibold text-ys-deep">
								{{ lineProfile?.displayName || "遠岫客戶" }}
							</p>
							<p class="truncate text-sm text-ys-muted">
								{{ bound ? companyName || "已綁定客戶" : "尚未綁定客戶資料" }}
							</p>
						</div>
					</div>
				</template>
				<p v-else class="text-base font-semibold text-ys-deep">{{ pageTitle }}</p>
			</div>
		</header>

		<main class="mx-auto max-w-lg px-4 py-5 pb-24">
			<RouterView />
		</main>

		<BottomTabBar />
	</div>
</template>
