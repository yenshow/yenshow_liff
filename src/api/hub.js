import { hubHttp, unwrapResult } from "./http";

export const getHubMe = async () => {
	const { data } = await hubHttp.get("/api/hub/me");
	return unwrapResult(data);
};

export const verifyOrderBind = async ({ orderNo, taxId }) => {
	const { data } = await hubHttp.post("/api/hub/verify-order", { orderNo, taxId });
	return unwrapResult(data);
};

export const listOrders = async (params = {}) => {
	const { data } = await hubHttp.get("/api/hub/orders", { params });
	return unwrapResult(data);
};

export const getOrder = async (id) => {
	const { data } = await hubHttp.get(`/api/hub/orders/${encodeURIComponent(id)}`);
	const result = unwrapResult(data);
	return result?.order || result;
};

export const listServiceTickets = async (params = {}) => {
	const { data } = await hubHttp.get("/api/hub/service-tickets", { params });
	return unwrapResult(data);
};

export const getServiceTicket = async (id) => {
	const { data } = await hubHttp.get(`/api/hub/service-tickets/${encodeURIComponent(id)}`);
	const result = unwrapResult(data);
	return result?.ticket || result;
};

export const createServiceTicket = async (payload) => {
	const { data } = await hubHttp.post("/api/hub/service-tickets", payload);
	const result = unwrapResult(data);
	return result?.ticket || result;
};
