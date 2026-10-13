# 遠岫 Customer Hub（LIFF）

LINE Mini App：訂單追蹤、規格查詢、產品資訊、售後服務。

## 環境變數

```env
VITE_LIFF_ID=2011932335-Da0jJcpe
VITE_API_BASE_URL=https://api.yenshow.com
# 本機若後端開啟 HUB_SKIP_LINE_VERIFY，可帶 mock user：
# VITE_MOCK_LINE_USER_ID=U_local_dev_user
```

## 開發

```bash
npm install
npm run dev
```

預設 `http://localhost:5174`（已列入後端 CORS）。

## 功能與 API

| 功能 | LIFF 路徑 | API |
|------|-----------|-----|
| 綁定（訂單＋統編） | `/bind` | `POST /api/hub/verify-order` |
| 綁定狀態 | — | `GET /api/hub/me` |
| 訂單 | `/orders` | `GET /api/hub/orders`、`/orders/:id` |
| 規格 | `/products` | `GET /api/products/search`、`/products/:id`、`public-url` |
| 產品資訊 | `/info` | `GET /api/news`、`/news/:slug` |
| 售後 | `/service` | `GET\|POST /api/hub/service-tickets` |

Hub 請求需帶 LINE `idToken`：`Authorization: Bearer <idToken>`。

### Mock 綁定測試（後端 `HUB_USE_MOCK=true`）

- 訂單編號：`PO26002116`
- 統編：`03028349`

## 用戶流程（簡述）

1. 從 LINE Rich Menu／連結開啟 LIFF → LINE Login  
2. 首頁四入口：規格／資訊可直接用；訂單／售後需綁定  
3. 綁定：輸入訂單編號＋統編 → `POST /api/hub/verify-order`  
4. 之後可看訂單、建售後；通知 deep link：`/orders/:id`、`/service/:id`

## Rich Menu（LINE OA 後台）

建議四格：`/orders`｜`/products`｜`/info`｜`/service`

## 後端對接

YenShow Server（`d:\web\yenshow\server`）需提供 `/api/hub/*`，並依 `docs/crm-agent-api.md` 轉打 CRM。  
CRM 未就緒時可設 `HUB_USE_MOCK=true`。正式環境設定：

- `LINE_LOGIN_CHANNEL_ID`（LIFF ID 前段）
- `CRM_API_BASE_URL`、`CRM_API_TOKEN` 或 `CRM_API_KEY`
- `HUB_USE_MOCK=false`
- 事件推播：`POST /api/hub/events`（`x-api-key`）
