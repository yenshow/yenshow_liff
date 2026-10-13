<script setup>
import { computed } from "vue";
import { useAuth } from "@/composables/useAuth";

const { booting, authError, boot, bound, companyName } = useAuth();

const menuItems = computed(() => [
	{
		to: "/orders",
		title: "訂單追蹤",
		desc: bound.value ? "查看訂單與交貨進度" : "綁定後可查看訂單"
	},
	{ to: "/products", title: "規格查詢", desc: "搜尋產品並下載 Datasheet" },
	{ to: "/info", title: "產品資訊", desc: "最新消息、方案與活動" },
	{
		to: "/service",
		title: "售後服務",
		desc: bound.value ? "建立與查詢服務案件" : "綁定後可建立案件"
	}
]);

const handleRetry = () => {
	boot();
};
</script>

<template>
	<div>
		<p v-if="booting" class="text-sm text-ys-muted" role="status">正在連線 LINE…</p>
		<div
			v-else-if="authError"
			class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
			role="alert"
		>
			{{ authError }}
			<button
				type="button"
				class="mt-3 block w-full rounded-xl bg-red-600 px-3 py-2 text-white"
				aria-label="重試"
				tabindex="0"
				@click="handleRetry"
			>
				重試
			</button>
		</div>
		<template v-else>
			<section class="mb-4">
				<h1 class="sr-only">我的遠岫</h1>
				<p class="text-sm text-ys-muted">
					{{
						bound
							? `已綁定 ${companyName || "客戶"}，可查詢訂單與售後。`
							: "公開功能可直接使用；訂單與售後需先完成綁定。"
					}}
				</p>
				<RouterLink
					v-if="!bound"
					to="/bind"
					class="mt-3 inline-flex rounded-xl bg-ys-lime px-4 py-2 text-sm font-semibold text-ys-deep"
					tabindex="0"
					aria-label="前往帳號綁定"
				>
					立即綁定
				</RouterLink>
			</section>

			<nav class="grid gap-3" aria-label="功能選單">
				<RouterLink
					v-for="item in menuItems"
					:key="item.to"
					:to="item.to"
					class="flex items-center justify-between rounded-2xl border border-ys-line bg-white p-4 shadow-sm transition hover:border-ys-mid"
					tabindex="0"
					:aria-label="item.title"
				>
					<div>
						<p class="font-semibold text-ys-deep">{{ item.title }}</p>
						<p class="mt-1 text-sm text-ys-muted">{{ item.desc }}</p>
					</div>
					<span class="text-xl text-ys-mid" aria-hidden="true">›</span>
				</RouterLink>
			</nav>
		</template>
	</div>
</template>
