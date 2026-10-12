<script setup>
import { onMounted, ref } from "vue";
import { useLiff } from "@/composables/useLiff";

const { ensureInit, getProfile } = useLiff();

const booting = ref(true);
const error = ref("");
const lineProfile = ref(null);

const handleBoot = async () => {
	booting.value = true;
	error.value = "";
	try {
		const instance = await ensureInit();
		if (!instance) return;
		lineProfile.value = await getProfile();
	} catch (err) {
		error.value = err?.message || "載入失敗";
	} finally {
		booting.value = false;
	}
};

onMounted(() => {
	handleBoot();
});
</script>

<template>
	<div>
		<p v-if="booting" class="text-sm text-slate-500" role="status">正在連線 LINE…</p>
		<div
			v-else-if="error"
			class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
			role="alert"
		>
			{{ error }}
			<button
				type="button"
				class="mt-3 block w-full rounded-md bg-red-600 px-3 py-2 text-white"
				aria-label="重試"
				tabindex="0"
				@click="handleBoot"
			>
				重試
			</button>
		</div>
		<template v-else>
			<section class="mb-6">
				<h1 class="text-xl font-semibold">我的遠岫</h1>
				<p class="mt-1 text-sm text-slate-600">
					{{ lineProfile?.displayName ? `嗨，${lineProfile.displayName}` : "歡迎使用" }}
				</p>
			</section>
			<nav class="grid gap-3" aria-label="功能選單">
				<RouterLink
					to="/products"
					class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-[#06C755]"
					tabindex="0"
				>
					<p class="font-medium">規格查詢</p>
					<p class="mt-1 text-sm text-slate-500">搜尋產品並下載 Datasheet</p>
				</RouterLink>
			</nav>
		</template>
	</div>
</template>
