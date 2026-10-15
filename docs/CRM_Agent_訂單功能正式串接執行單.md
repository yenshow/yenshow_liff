# CRM Agent：訂單正式串接執行單

**日期**：2026-10-15  
**目標**：正式啟用 Customer Hub **訂單** API，供 YenShow Hub 轉打；LIFF 打開時可查列表／詳情（唯讀）。

### 範圍

| 等級 | 項目 | 說明 |
|------|------|------|
| **本單必做** | 公鑰、Token、allowlist、訂單投影、verify-order、orders list／detail | 客戶開／刷新 LIFF 即可拉訂單 |
| **售後延後（本單不測）** | 報修 API、員工受理、工單同步 | 與訂單進度無關；另案再說 |
| **正式棄用（請 CRM 移除／勿實作）** | **邀請碼綁定**、**Webhook／事件推播** | 見下方產品決議 |

### 產品決議（2026-10-15）— 請 CRM Agent 執行移除

1. **邀請碼**：正式棄用。綁定僅保留「訂單編號＋統編」。請自 Customer Hub 規格／程式／設定／文件中**移除**邀請碼、代表人邀請相關設計與 API，勿列 roadmap。  
2. **Webhook／事件推播**：正式棄用。訂單更新靠用戶在 LINE LIFF **開啟或刷新頁面**向 Hub／CRM **拉資料**；CRM **勿**實作推播。YenShow Hub 已移除 `POST /api/hub/events`；CRM 側草案／P2 請取消並移除。

JWT／公鑰見：`docs/crm-customer-hub/`（`ys-hub-202610-public.pem`、`jwt_claims.example.json`）。

---

## 1. 固定參數

### 1.1 網路（請照完整位址設定）

| 角色                          | 完整位址                                                   |
| ----------------------------- | ---------------------------------------------------------- |
| **CRM Customer Hub Base URL** | `https://192.168.1.11:9443/api/customer-hub/v1`            |
| **連線（YenShow → CRM）**     | 來源 IP `192.168.1.24` → 目的 `192.168.1.11:9443`（HTTPS） |
| **CRM allowlist**             | 允許 `192.168.1.24`（建議 `/32`）存取 `192.168.1.11:9443`  |

> `192.168.1.24`＝YenShow Hub 所在 Linux VM 的**內網 IP**（呼叫端）。CRM 服務本體在 `192.168.1.11:9443`，兩者不要對調。

### 1.2 身分與金鑰

| 項          | 值                                                                                                               |
| ----------- | ---------------------------------------------------------------------------------------------------------------- |
| serviceId   | `yenshow-hub`                                                                                                    |
| kid         | `ys-hub-202610`                                                                                                  |
| 公鑰        | `ys-hub-202610-public.pem`（YenShow 交付；只要公鑰）                                                             |
| 公鑰 SHA256 | `72507532A08A470EF78FDD31CDA80434AD7D5CBB2B921F696C80B395197445D1`                                               |
| Binding JWT | RS256；header `X-Customer-Binding`；`iss=https://api.yenshow.com`；`aud=yenshow-crm-customer-hub`；`exp-iat≤300` |
| 服務 Token  | `Authorization: Bearer …`（**CRM 簽發**；CRM 存 SHA256；明文交 YenShow）                                         |

---

## 2. CRM 必做清單（依序）

- [ ] **1. 公鑰**：核對 SHA256 → 載入（`kid=ys-hub-202610`）。勿用隔離測試鑰 `test-20261013`。
- [ ] **2. 服務設定**：`services[].id=yenshow-hub`；聯測前可 `enabled=false`，僅允許 §1.1 allowlist。
- [ ] **3. 訂單公開投影**：接**正式**排程／訂單事件。
  - 發布：accepted＋有效核准＋非歷史補登
  - 不發布：草稿／退回／來源錯誤
  - 已公開後取消：保留取消狀態
  - 無實體物流：`items: []`；未知交期：`nextDeliveryDate: null`；不偽造出貨量
  - `shipments`：可先 `[]`（有正式 ship 再填）
- [ ] **4. 掛三支訂單 API**（§3）；售後本階段不測、不挡啟用
- [ ] **5. Allowlist**：依 §1.1（`192.168.1.24` → `192.168.1.11:9443`）
- [ ] **6. 簽發正式服務 Token** → 安全管道交 YenShow → CRM 只留 SHA256／效期／撤銷
- [ ] **7. 棄用清理**：移除／取消邀請碼綁定與 Webhook／事件推播（規格、程式、待辦、OpenAPI）；回報已清除項目清單
- [ ] **8. 聯測** §4 → 通過後訂單 `enabled=true`
- [ ] **9. 回報** §5 JSON

**阻塞**：缺 PEM → 向 YenShow 索取（指紋須符合）；`192.168.1.24`→`192.168.1.11:9443` 不通 → 寫入 `blocked_on_yenshow`，勿虛構。

---

## 3. API 契約（Hub `crmClient.js`）

Base＝`https://192.168.1.11:9443/api/customer-hub/v1`（無結尾 `/`）。

| Method | Path                                       | Auth                            |
| ------ | ------------------------------------------ | ------------------------------- |
| `POST` | `/customers/verify-order`                  | Bearer only（不要 Binding JWT） |
| `GET`  | `/customers/{customerId}/orders`           | Bearer + `X-Customer-Binding`   |
| `GET`  | `/customers/{customerId}/orders/{orderId}` | 同上                            |

- `customerId`：字串，且＝JWT `customerId`＝path
- Body：`{ "orderNo": "<string>", "taxId": "<8位數字>" }`
- List query：`page`、`limit`、`status`（可選）

### verify-order

| 情況     | HTTP | 說明                                                                    |
| -------- | ---- | ----------------------------------------------------------------------- |
| 唯一命中 | 200  | `customer.id`（字串）、`companyName`、`taxId`、`code?`；含 `order` 摘要 |
| 不符     | 404  |                                                                         |
| 多筆     | 409  | 建議 `code: AMBIGUOUS_ORDER`                                            |
| 過頻     | 429  |                                                                         |

### 訂單欄位

列表：`id`, `poNumber`, `projectName`, `status`, `statusLabel`, `nextDeliveryDate`（可 null）

詳情另加：

```json
{
	"items": [{ "sku": "", "name": "", "orderedQty": 0, "shippedQty": 0, "pendingQty": 0 }],
	"shipments": [{ "shipmentNo": "", "shippedAt": null, "items": [{ "sku": "", "qty": 0 }] }]
}
```

`items`／`shipments` 可為 `[]`。勿回成本、毛利、銀行、員工、內部備註。

### 憑證

|      | 服務 Token | Binding JWT         |
| ---- | ---------- | ------------------- |
| 誰產 | CRM        | YenShow（每次現簽） |
| CRM  | 存 SHA256  | 公鑰驗簽            |
| 用途 | 服務身分   | 本次 `customerId`   |

---

## 4. 驗收

| ID   | 案例                | 預期                     |
| ---- | ------------------- | ------------------------ |
| O-01 | Token＋JWT 列客戶 A | 僅 A、已發布             |
| O-02 | A 讀 B orderId      | 403／404                 |
| O-03 | 錯 kid／過期 JWT    | 401／403                 |
| O-04 | 有品項              | `items` qty 合理         |
| O-05 | 純服務單            | `items: []`              |
| O-06 | 未知交期            | `nextDeliveryDate: null` |
| O-07 | 已公開後取消        | 可見取消態               |
| O-08 | shipments           | 允許 `[]`（非挡門）      |
| O-09 | verify 正確         | 200＋字串 `customer.id`  |
| O-10 | 錯統編              | 404                      |
| O-11 | 多筆                | 409                      |
| O-12 | 草稿／未核准        | 不在列表                 |

**通過**：O-01～O-07、O-09～O-12；YenShow 設定 `CRM_API_BASE_URL`、`CRM_API_TOKEN`、`HUB_USE_MOCK=false` 後 list／detail 可通。O-08 有出貨再補驗。

---

## 5. 完成時回報

```json
{
	"as_of": "YYYY-MM-DD",
	"base_url": "https://192.168.1.11:9443/api/customer-hub/v1",
	"allowlist": {
		"source_ip": "192.168.1.24",
		"dest": "192.168.1.11:9443"
	},
	"production_router_installed": true,
	"enabled": false,
	"service_id": "yenshow-hub",
	"kid": "ys-hub-202610",
	"public_key_sha256_matched": true,
	"token_issued_to_yenshow": true,
	"projection_scheduler_connected": true,
	"order_apis_ready": true,
	"service_tickets_in_scope": false,
	"orders_only_enablement_accepted": true,
	"invite_code_removed": true,
	"webhook_removed": true,
	"removed_items": [],
	"acceptance": { "passed": [], "failed": [], "skipped": ["O-08"] },
	"known_limitations": [],
	"blocked_on_yenshow": []
}
```

聯測通過且雙方同意後再 `enabled=true`。

---

## 6. YenShow 配合（非本 Agent 實作）

| 項   | 內容                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------------------- |
| 公鑰 | 交付 `ys-hub-202610-public.pem`（私鑰不交）                                                             |
| 網路 | 確認 `192.168.1.24` 可 HTTPS 連 `192.168.1.11:9443`                                                     |
| Env  | `CRM_API_BASE_URL=https://192.168.1.11:9443/api/customer-hub/v1`；`CRM_API_TOKEN`；`HUB_USE_MOCK=false` |

---

## 7. 執行指令

```
執行本訂單正式串接執行單：
1) 載入公鑰 kid=ys-hub-202610，SHA256=72507532A08A470EF78FDD31CDA80434AD7D5CBB2B921F696C80B395197445D1
2) 服務 Base URL=https://192.168.1.11:9443/api/customer-hub/v1；allowlist 來源 192.168.1.24 → 目的 192.168.1.11:9443
3) 掛 POST /customers/verify-order、GET /customers/{id}/orders、GET /customers/{id}/orders/{orderId}
4) 訂單投影接正式事件；shipments 可 []；售後本單不測
5) 正式棄用並移除：邀請碼綁定、Webhook／事件推播（用戶靠 LIFF 刷新拉單即可）
6) 簽發服務 Token 交 YenShow（CRM 只存 SHA256）；跑 O-01～O-12（O-08 可 skip）；回報 §5 JSON（含 invite_code_removed、webhook_removed、removed_items）
阻塞時填 blocked_on_yenshow，勿虛構憑證或網路。
```
