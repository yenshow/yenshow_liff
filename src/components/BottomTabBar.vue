<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";

const route = useRoute();

const tabs = [
	{ to: "/", label: "首頁", icon: "home", match: (path) => path === "/" },
	{ to: "/info", label: "產品", icon: "product", match: (path) => path.startsWith("/info") },
	{ to: "/orders", label: "訂單", icon: "orders", match: (path) => path.startsWith("/orders") },
	{ to: "/service", label: "支援", icon: "support", match: (path) => path.startsWith("/service") },
	{ to: "/products", label: "規格", icon: "specs", match: (path) => path.startsWith("/products") }
];

const activePath = computed(() => route.path);
</script>

<template>
	<nav
		class="fixed inset-x-0 bottom-0 z-30 border-t border-ys-line bg-white/95 backdrop-blur-md"
		aria-label="主要導覽"
	>
		<div class="mx-auto grid max-w-lg grid-cols-5 px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5">
			<RouterLink
				v-for="tab in tabs"
				:key="tab.to"
				:to="tab.to"
				class="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[11px] transition"
				:class="
					tab.match(activePath)
						? 'font-semibold text-ys-mid'
						: 'text-ys-muted hover:text-ys-deep'
				"
				:aria-current="tab.match(activePath) ? 'page' : undefined"
				:aria-label="tab.label"
				tabindex="0"
			>
				<span
					class="flex h-7 w-7 items-center justify-center rounded-full"
					:class="tab.match(activePath) ? 'bg-ys-lime/50 text-ys-deep' : ''"
				>
					<AppIcon :name="tab.icon" :size="20" />
				</span>
				<span>{{ tab.label }}</span>
			</RouterLink>
		</div>
	</nav>
</template>
