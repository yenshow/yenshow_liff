<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
import BottomTabBar from "@/components/BottomTabBar.vue";
import { useAuth } from "@/composables/useAuth";

const route = useRoute();
const { lineProfile, companyName, bound } = useAuth();

const isHome = computed(() => route.name === "home");
const pageTitle = computed(() => route.meta.title || "我的遠岫");
const showHeader = computed(() => {
	if (isHome.value) return true;
	const detailRoutes = new Set([
		"order-detail",
		"product-detail",
		"info-detail",
		"service-detail",
		"service-new",
		"bind"
	]);
	return Boolean(route.meta.title) && !detailRoutes.has(route.name);
});

const displayName = computed(() => lineProfile.value?.displayName || "遠岫客戶");
const subtitle = computed(() =>
	bound.value ? companyName.value || "已綁定客戶" : "尚未綁定客戶資料"
);

const handleNotifyClick = () => {
	window.alert("通知功能即將開放");
};
</script>

<template>
	<div class="min-h-screen bg-ys-surface text-ys-text">
		<header
			v-if="showHeader"
			class="sticky top-0 z-20 bg-ys-deep text-white shadow-md"
			:class="isHome ? 'rounded-b-[1.75rem]' : ''"
		>
			<div class="mx-auto max-w-lg px-4" :class="isHome ? 'pb-5 pt-4' : 'py-3'">
				<template v-if="isHome">
					<div class="flex items-start justify-between gap-3">
						<div class="min-w-0 flex-1">
							<p class="text-sm text-white/70">Welcome back</p>
							<div class="mt-3 flex items-center gap-3">
								<img
									v-if="lineProfile?.pictureUrl"
									:src="lineProfile.pictureUrl"
									:alt="displayName"
									class="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white/40"
								/>
								<div
									v-else
									class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold"
									aria-hidden="true"
								>
									{{ displayName.slice(0, 1) }}
								</div>
								<div class="min-w-0">
									<p class="truncate text-lg font-semibold">{{ displayName }}</p>
									<p class="truncate text-sm text-white/75">{{ subtitle }}</p>
								</div>
							</div>
						</div>

						<div class="flex shrink-0 items-center gap-1 pt-0.5">
							<button
								type="button"
								class="flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10"
								aria-label="通知"
								@click="handleNotifyClick"
							>
								<AppIcon name="bell" :size="22" />
							</button>
							<RouterLink
								to="/bind"
								class="flex h-10 w-10 items-center justify-center rounded-full text-white/90 transition hover:bg-white/10"
								aria-label="設定與帳號綁定"
							>
								<AppIcon name="settings" :size="22" />
							</RouterLink>
						</div>
					</div>

					<RouterLink
						v-if="!bound"
						to="/bind"
						class="mt-4 inline-flex rounded-xl bg-ys-lime px-4 py-2.5 text-sm font-semibold text-ys-deep"
						aria-label="立即綁定"
					>
						立即綁定
					</RouterLink>
				</template>
				<p v-else class="text-base font-semibold text-white/95">{{ pageTitle }}</p>
			</div>
		</header>

		<main class="mx-auto max-w-lg px-4 py-5 pb-24">
			<RouterView />
		</main>

		<BottomTabBar />
	</div>
</template>
