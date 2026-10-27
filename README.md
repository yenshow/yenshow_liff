# 遠岫 Customer Hub（LIFF）

LINE Mini App：訂單追蹤、規格查詢、產品資訊、售後服務。

## 環境變數

```env
VITE_LIFF_ID=2011932335-Da0jJcpe
VITE_API_BASE_URL=https://api.yenshow.com
VITE_OFFICIAL_SITE_URL=https://www.yenshow.com
VITE_LINE_OA_ID=your_oa_basic_id
```

本機開發請用 [`.env.development`](.env.development)（`npm run dev` 自動載入）：

- `VITE_SKIP_LIFF_LOGIN=true` — 不走 LINE OAuth（避免 localhost redirect 400）
- `VITE_MOCK_LINE_USER_ID=U_local_dev_user` — 以 header 模擬 LINE 使用者
- `VITE_API_BASE_URL=http://localhost:4001` — 本機 Hub（區網開頁會自動改同 IP）；正式站用 `.env` 的 `https://api.yenshow.com`
- `VITE_OFFICIAL_SITE_URL` — 官網網址，產品消息「閱讀全文」導向 `/news/{slug}`
- `VITE_LINE_OA_ID` — 官方帳號 Basic ID（不含 `@`），供「詢問業務」開啟 LINE 對話並預填訊息

正式／`liff.yenshow.com` 仍走真實 LIFF Login，不要設 skip。

「詢問業務」優先在 LINE App 內 `sendMessages` 後關閉 LIFF 回到聊天室；若無法傳送則改開 `line.me` OA 對話（需 `VITE_LINE_OA_ID`）。LIFF 後台建議開啟 `chat_message.write` scope。

### Vercel（Production）

`.env` 已 gitignore，請在 Vercel Project → Settings → Environment Variables 設定（需 **Redeploy** 才會進 build）：

| 變數 | 必填 | 範例 | 說明 |
|------|------|------|------|
| `VITE_LIFF_ID` | 是 | `2011932335-Da0jJcpe` | LINE LIFF ID |
| `VITE_API_BASE_URL` | 是 | `https://api.yenshow.com` | Hub API |
| `VITE_OFFICIAL_SITE_URL` | 建議 | `https://www.yenshow.com` | 消息「閱讀全文」；未設則程式 fallback 同網址 |
| `VITE_LINE_OA_ID` | 建議 | OA Basic ID（不含 `@`） | 「詢問業務」 |

**不要**在 Production 設定 `VITE_SKIP_LIFF_LOGIN`、`VITE_MOCK_LINE_USER_ID`（僅本機 `.env.development`）。

## 開發

```bash
# 終端 1：YenShow server（本機需 HUB_SKIP_LINE_VERIFY=true）
cd d:\web\yenshow\server && npm run dev

# 終端 2：LIFF
npm install
npm run dev
```

| 場景 | 開啟網址 | API |
|------|----------|-----|
| 本機 | `http://localhost:5174/` | `localhost:4001` |
| 區網 | `http://<這台IP>:5174/` | 自動改 `<同IP>:4001`（server `CORS_ORIGIN` 需含該來源） |
| 公網 | `https://liff.yenshow.com`（build 部署） | `https://api.yenshow.com` |

本機／區網勿用 LINE 登入（`VITE_SKIP_LIFF_LOGIN` + `VITE_MOCK_LINE_USER_ID`，後端須 `HUB_SKIP_LINE_VERIFY=true`）。綁定請用真實 CRM 訂單編號與統編。

## 功能與 API

| 功能 | LIFF 路徑 | API |
|------|-----------|-----|
| 綁定（訂單＋統編） | `/bind` | `POST /api/hub/verify-order` |
| 綁定狀態 | — | `GET /api/hub/me` |
| 訂單 | `/orders` | `GET /api/hub/orders`、`/orders/:id` |
| 規格 | `/products` | `GET /api/products/search`、`/products/:id`、`liff-presign`（需 LINE Login） |
| 產品資訊 | `/info` | `GET /api/news`、`/news/:slug` |
| 售後 | `/service` | `GET\|POST /api/hub/service-tickets` |

Hub 請求需帶 LINE `idToken`：`Authorization: Bearer <idToken>`。本機略過 LIFF 時改送 `X-Line-User-Id`。

## 用戶流程（簡述）

1. 從 LINE Rich Menu／連結開啟 LIFF → LINE Login  
2. 首頁四入口：資訊可直接瀏覽；規格需 LINE Login 後開啟；訂單／售後需綁定  
3. 綁定：輸入訂單編號＋統編 → `POST /api/hub/verify-order`  
4. 之後可看訂單、建售後；通知 deep link：`/orders/:id`、`/service/:id`

## Rich Menu（LINE OA 後台）

建議四格：`/orders`｜`/products`｜`/info`｜`/service`

## 後端對接

YenShow Server（`d:\web\yenshow\server`）提供 `/api/hub/*`，以服務 Token 轉打 CRM（無需 Binding JWT）。

正式環境：

- `LINE_LOGIN_CHANNEL_ID`（LIFF ID 前段）
- `CRM_API_BASE_URL`、`CRM_API_TOKEN`、`CRM_CA_FILE`（內網自簽 CA）

本機開發另需 `HUB_SKIP_LINE_VERIFY=true`（略過 LINE verify，接受 `X-Line-User-Id`）。正式／Docker 必須為 `false`。
