<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuth } from "@/composables/useAuth";

const route = useRoute();
const { lineProfile, companyName, bound } = useAuth();

const showHeroHeader = computed(() => route.name === "home");
const pageTitle = computed(() => route.meta.title || "我的遠岫");
</script>

<template>
	<div class="min-h-screen bg-ys-surface text-ys-text">
		<header
			class="sticky top-0 z-20 overflow-hidden bg-ys-deep text-white shadow-md"
			:class="showHeroHeader ? 'rounded-b-[1.75rem]' : ''"
		>
			<div class="mx-auto max-w-lg px-4 pb-4 pt-3">
				<div class="flex items-center justify-between gap-3">
					<RouterLink to="/" class="text-base font-semibold tracking-wide" aria-label="我的遠岫首頁" tabindex="0">
						我的遠岫
					</RouterLink>
					<nav class="flex items-center gap-3 text-sm text-white/80" aria-label="LIFF 導覽">
						<RouterLink to="/orders" class="hover:text-white" tabindex="0">訂單</RouterLink>
						<RouterLink to="/products" class="hover:text-white" tabindex="0">規格</RouterLink>
						<RouterLink to="/info" class="hover:text-white" tabindex="0">資訊</RouterLink>
						<RouterLink to="/service" class="hover:text-white" tabindex="0">售後</RouterLink>
					</nav>
				</div>

				<template v-if="showHeroHeader">
					<p class="mt-5 text-sm text-white/75">Welcome back</p>
					<div class="mt-2 flex items-center gap-3">
						<img
							v-if="lineProfile?.pictureUrl"
							:src="lineProfile.pictureUrl"
							:alt="lineProfile.displayName || '使用者頭像'"
							class="h-11 w-11 rounded-full border-2 border-white/30 object-cover"
						/>
						<div
							v-else
							class="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-sm font-semibold"
							aria-hidden="true"
						>
							{{ (lineProfile?.displayName || "遠").slice(0, 1) }}
						</div>
						<div>
							<p class="text-lg font-semibold">{{ lineProfile?.displayName || "遠岫客戶" }}</p>
							<p class="text-xs text-white/70">
								{{ bound ? companyName || "已綁定客戶" : "尚未綁定客戶資料" }}
							</p>
						</div>
					</div>
				</template>
				<p v-else class="mt-3 text-sm font-medium text-white/90">{{ pageTitle }}</p>
			</div>
		</header>

		<main class="mx-auto max-w-lg px-4 py-5 pb-10">
			<RouterView />
		</main>
	</div>
</template>
