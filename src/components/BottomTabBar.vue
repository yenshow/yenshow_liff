<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";

const route = useRoute();

const tabs = computed(() => {
	const path = route.path;
	return [
		{ to: "/", label: "首頁", icon: "home", active: path === "/" },
		{ to: "/info", label: "產品", icon: "product", active: path.startsWith("/info") },
		{ to: "/orders", label: "訂單", icon: "orders", active: path.startsWith("/orders") },
		{ to: "/service", label: "支援", icon: "support", active: path.startsWith("/service") },
		{ to: "/products", label: "規格", icon: "specs", active: path.startsWith("/products") }
	];
});
</script>

<template>
	<nav
		class="fixed inset-x-0 bottom-0 z-30 border-t border-ys-line bg-white/95 backdrop-blur-md"
		aria-label="主要導覽"
	>
		<div
			class="mx-auto grid max-w-lg grid-cols-5 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5"
		>
			<RouterLink
				v-for="tab in tabs"
				:key="tab.to"
				:to="tab.to"
				class="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[11px] transition"
				:class="tab.active ? 'font-semibold text-ys-mid' : 'text-ys-muted hover:text-ys-deep'"
				:aria-current="tab.active ? 'page' : undefined"
				:aria-label="tab.label"
			>
				<span
					class="flex h-7 w-7 items-center justify-center rounded-full"
					:class="tab.active ? 'bg-ys-lime/50 text-ys-deep' : ''"
				>
					<AppIcon :name="tab.icon" :size="20" />
				</span>
				<span>{{ tab.label }}</span>
			</RouterLink>
		</div>
	</nav>
</template>
