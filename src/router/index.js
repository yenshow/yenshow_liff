import { createRouter, createWebHistory } from "vue-router";
import { useAuth } from "@/composables/useAuth";

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			meta: { title: "我的遠岫", keepAlive: true },
			component: () => import("@/views/HomeView.vue")
		},
		{ path: "/bind", name: "bind", meta: { title: "帳號綁定" }, component: () => import("@/views/BindAccountView.vue") },
		{
			path: "/orders",
			name: "orders",
			meta: { title: "訂單追蹤", requiresBind: true, keepAlive: true },
			component: () => import("@/views/OrdersView.vue")
		},
		{
			path: "/orders/:id",
			name: "order-detail",
			meta: { title: "訂單詳情", requiresBind: true },
			component: () => import("@/views/OrderDetailView.vue")
		},
		{
			path: "/products",
			name: "products",
			meta: { title: "規格查詢", keepAlive: true },
			component: () => import("@/views/ProductsView.vue")
		},
		{
			path: "/products/:id",
			name: "product-detail",
			meta: { title: "產品詳情" },
			component: () => import("@/views/ProductDetailView.vue")
		},
		{
			path: "/info",
			name: "info",
			meta: { title: "產品資訊", keepAlive: true },
			component: () => import("@/views/ProductInfoView.vue")
		},
		{
			path: "/info/:slug",
			name: "info-detail",
			meta: { title: "訊息詳情" },
			component: () => import("@/views/ProductInfoDetailView.vue")
		},
		{
			path: "/service",
			name: "service",
			meta: { title: "售後服務", requiresBind: true, keepAlive: true },
			component: () => import("@/views/ServiceListView.vue")
		},
		{
			path: "/service/new",
			name: "service-new",
			meta: { title: "建立案件", requiresBind: true },
			component: () => import("@/views/ServiceCreateView.vue")
		},
		{
			path: "/service/:id",
			name: "service-detail",
			meta: { title: "案件詳情", requiresBind: true },
			component: () => import("@/views/ServiceDetailView.vue")
		},
		{ path: "/:pathMatch(.*)*", redirect: "/" }
	],
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) return savedPosition;
		if (to.meta.keepAlive && from.meta.keepAlive) return false;
		return { top: 0 };
	}
});

router.beforeEach(async (to) => {
	const auth = useAuth();
	if (!auth.booted.value) {
		try {
			await auth.boot();
		} catch {
			// 交由頁面顯示 authError
		}
	}

	if (to.meta.requiresBind && !auth.bound.value) {
		return { name: "bind", query: { redirect: to.fullPath } };
	}
	return true;
});

router.afterEach((to) => {
	const title = to.meta?.title;
	document.title = title ? `${title}｜遠岫` : "遠岫";
});

export default router;
