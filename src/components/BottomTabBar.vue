<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import AppIcon from "@/components/AppIcon.vue";
import { listOrders } from "@/api/hub";

const route = useRoute();
const orderCount = ref(0);

const handleLoadOrderCount = async () => {
	try {
		const data = await listOrders({ limit: 50 });
		orderCount.value = (data?.orders || []).length;
	} catch {
		orderCount.value = 0;
	}
};

onMounted(handleLoadOrderCount);

const orderBadge = computed(() => {
	if (orderCount.value <= 0) return "";
	return orderCount.value > 99 ? "99+" : String(orderCount.value);
});

const tabs = computed(() => {
	const path = route.path;
	return [
		{ to: "/", label: "首頁", icon: "home", active: path === "/" },
		{
			to: "/orders",
			label: "訂單",
			icon: "orders",
			active: path.startsWith("/orders"),
			badge: orderBadge.value
		},
		{ to: "/service", label: "支援", icon: "support", active: path.startsWith("/service") },
		{ to: "/info", label: "產品", icon: "promo", active: path.startsWith("/info") },
		{ to: "/products", label: "規格", icon: "specs", active: path.startsWith("/products") }
	];
});
</script>

<template>
	<nav
		class="fixed inset-x-0 bottom-0 z-30 border-t border-ys-line/80 bg-ys-card/95 shadow-[0_-6px_24px_rgba(20,92,69,0.08)] backdrop-blur-md"
		aria-label="主要導覽"
	>
		<div
			class="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-1.5 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
		>
			<RouterLink
				v-for="tab in tabs"
				:key="tab.to"
				:to="tab.to"
				class="relative flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 text-[11px] tracking-wide transition-colors duration-150"
				:class="
					tab.active
						? 'bg-ys-lime font-semibold text-ys-deep'
						: 'font-medium text-ys-muted hover:bg-ys-surface hover:text-ys-text'
				"
				:aria-current="tab.active ? 'page' : undefined"
				:aria-label="tab.badge ? `${tab.label}，${tab.badge} 筆` : tab.label"
			>
				<span class="relative inline-flex" :class="tab.active ? 'text-ys-mid' : undefined">
					<AppIcon :name="tab.icon" :size="22" />
					<span
						v-if="tab.badge"
						class="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ys-mid px-1 text-[10px] leading-none font-bold text-white shadow-sm"
						aria-hidden="true"
					>
						{{ tab.badge }}
					</span>
				</span>
				<span>{{ tab.label }}</span>
			</RouterLink>
		</div>
	</nav>
</template>
