<script setup>
import { nextTick, onMounted, onUnmounted, ref } from "vue";
import * as pdfjs from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const props = defineProps({
	data: { type: Object, required: true }
});

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

const frameRef = ref(null);
const pageCount = ref(0);
const loadError = ref("");
const scale = ref(1);

const pageEls = [];
let pdfDoc = null;
let resizeObserver = null;
let lastFrameWidth = 0;
let pinchStartDistance = 0;
let pinchStartScale = 1;

const setPageRef = (el, index) => {
	pageEls[index] = el;
};

const renderAllPages = async () => {
	if (!pdfDoc || !frameRef.value) return;
	const width = frameRef.value.clientWidth || 320;
	const outputScale = Math.min(window.devicePixelRatio || 1, 2);

	for (let i = 1; i <= pdfDoc.numPages; i += 1) {
		const canvas = pageEls[i - 1];
		if (!canvas) continue;
		const page = await pdfDoc.getPage(i);
		const base = page.getViewport({ scale: 1 });
		const viewport = page.getViewport({ scale: (width / base.width) * outputScale });
		canvas.width = Math.floor(viewport.width);
		canvas.height = Math.floor(viewport.height);
		canvas.style.width = `${Math.floor(viewport.width / outputScale)}px`;
		canvas.style.height = `${Math.floor(viewport.height / outputScale)}px`;
		await page.render({
			canvasContext: canvas.getContext("2d", { alpha: false }),
			viewport
		}).promise;
	}
};

const loadPdf = async () => {
	loadError.value = "";
	try {
		pdfDoc = await pdfjs.getDocument({
			data: props.data.slice ? props.data.slice() : props.data,
			cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
			cMapPacked: true,
			standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`
		}).promise;
		pageCount.value = pdfDoc.numPages;
		await nextTick();
		await renderAllPages();
	} catch (err) {
		loadError.value = err?.message || "無法讀取規格書";
	}
};

const touchDistance = (touches) =>
	Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);

const handleTouchStart = (event) => {
	if (event.touches.length !== 2) return;
	pinchStartDistance = touchDistance(event.touches);
	pinchStartScale = scale.value;
};

const handleTouchMove = (event) => {
	if (event.touches.length !== 2 || !pinchStartDistance) return;
	event.preventDefault();
	const next = pinchStartScale * (touchDistance(event.touches) / pinchStartDistance);
	scale.value = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next));
};

const handleTouchEnd = () => {
	if (pinchStartDistance && scale.value < 1.05) scale.value = 1;
	pinchStartDistance = 0;
};

onMounted(async () => {
	await loadPdf();
	const frame = frameRef.value;
	if (!frame) return;

	frame.addEventListener("touchstart", handleTouchStart, { passive: true });
	frame.addEventListener("touchmove", handleTouchMove, { passive: false });
	frame.addEventListener("touchend", handleTouchEnd, { passive: true });

	if (typeof ResizeObserver === "undefined") return;
	resizeObserver = new ResizeObserver(() => {
		const width = frameRef.value?.clientWidth || 0;
		if (Math.abs(width - lastFrameWidth) < 2) return;
		lastFrameWidth = width;
		renderAllPages();
	});
	lastFrameWidth = frame.clientWidth || 0;
	resizeObserver.observe(frame);
});

onUnmounted(() => {
	const frame = frameRef.value;
	frame?.removeEventListener("touchstart", handleTouchStart);
	frame?.removeEventListener("touchmove", handleTouchMove);
	frame?.removeEventListener("touchend", handleTouchEnd);
	resizeObserver?.disconnect();
	pdfDoc?.destroy?.();
	pdfDoc = null;
});
</script>

<template>
	<div>
		<p v-if="loadError" class="text-sm text-red-600" role="alert">{{ loadError }}</p>
		<div
			v-else
			ref="frameRef"
			class="max-h-[calc(100dvh-8rem)] overflow-auto overscroll-contain rounded-2xl bg-white [touch-action:pan-x_pan-y]"
			tabindex="0"
			role="document"
			aria-label="規格書"
		>
			<div class="origin-top-left" :style="{ zoom: scale }">
				<canvas
					v-for="n in pageCount"
					:key="n"
					:ref="(el) => setPageRef(el, n - 1)"
					class="block max-w-none bg-white"
				/>
			</div>
		</div>
	</div>
</template>
