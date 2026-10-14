import { cachedFetch, cacheInvalidate } from "@/utils/apiCache";
import { hubHttp, unwrapResult } from "./http";

export const getHubMe = () =>
	cachedFetch("hub:me", async () => {
		const { data } = await hubHttp.get("/api/hub/me");
		return unwrapResult(data);
	});

export const verifyOrderBind = async ({ orderNo, taxId }) => {
	const { data } = await hubHttp.post("/api/hub/verify-order", { orderNo, taxId });
	cacheInvalidate("hub:");
	return unwrapResult(data);
};

export const listOrders = (params = {}) =>
	cachedFetch(`hub:orders:${JSON.stringify(params)}`, async () => {
		const { data } = await hubHttp.get("/api/hub/orders", { params });
		return unwrapResult(data);
	});

export const getOrder = async (id) => {
	const { data } = await hubHttp.get(`/api/hub/orders/${encodeURIComponent(id)}`);
	const result = unwrapResult(data);
	return result?.order || result;
};

export const listServiceTickets = (params = {}) =>
	cachedFetch(`hub:tickets:${JSON.stringify(params)}`, async () => {
		const { data } = await hubHttp.get("/api/hub/service-tickets", { params });
		return unwrapResult(data);
	});

export const getServiceTicket = async (id) => {
	const { data } = await hubHttp.get(`/api/hub/service-tickets/${encodeURIComponent(id)}`);
	const result = unwrapResult(data);
	return result?.ticket || result;
};

export const createServiceTicket = async (payload) => {
	const { data } = await hubHttp.post("/api/hub/service-tickets", payload);
	cacheInvalidate("hub:tickets:");
	const result = unwrapResult(data);
	return result?.ticket || result;
};
