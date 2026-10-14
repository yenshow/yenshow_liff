<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";

const route = useRoute();

const tabs = computed(() => {
	const path = route.path;
	return [
		{ to: "/", label: "首頁", icon: "home", active: path === "/" },
		{ to: "/orders", label: "訂單", icon: "orders", active: path.startsWith("/orders") },
		{ to: "/service", label: "支援", icon: "support", active: path.startsWith("/service") },
		{ to: "/info", label: "產品", icon: "promo", active: path.startsWith("/info") },
		{ to: "/products", label: "規格", icon: "specs", active: path.startsWith("/products") }
	];
});
</script>

<template>
	<nav class="fixed inset-x-0 bottom-0 z-30 border-t border-ys-line bg-ys-card" aria-label="主要導覽">
		<div class="mx-auto grid max-w-lg grid-cols-5 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-2">
			<RouterLink
				v-for="tab in tabs"
				:key="tab.to"
				:to="tab.to"
				class="flex min-h-12 flex-col items-center justify-center gap-1 text-xs"
				:class="tab.active ? 'font-semibold text-ys-deep' : 'text-ys-muted'"
				:aria-current="tab.active ? 'page' : undefined"
				:aria-label="tab.label"
			>
				<AppIcon :name="tab.icon" :size="22" />
				<span>{{ tab.label }}</span>
			</RouterLink>
		</div>
	</nav>
</template>
