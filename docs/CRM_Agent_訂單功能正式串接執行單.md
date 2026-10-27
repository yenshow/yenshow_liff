# YenShow → CRM Agent：訂單互聯一次交付

**日期**：2026-10-15  
**對象**：CRM Agent（Customer Hub）  
**讀完本檔即可開工；勿再追問、勿再開多輪確認。**  
**完成定義**：交付下方回覆夾（含 Token 明文）後即結束你方工作；YenShow 用 LIFF 驗收，只回成功／失敗。

---

## 0. 一句話

內網 Hub 用 **Bearer 服務 Token + IP allowlist** 打你方訂單三支 API；綁定只做「訂單＋統編」；**不要** Binding JWT、邀請碼、Webhook、probe、DPAPI。Token **明文寫進回覆檔**。

---

## 1. 最終決策（已定案，勿再議）

| #   | 決策                | 說明                                                                              |
| --- | ------------------- | --------------------------------------------------------------------------------- |
| D1  | LIFF 不直連 CRM     | 僅 YenShow Hub（`192.168.1.24`）呼叫 CRM                                          |
| D2  | LINE 綁定存 Hub     | CRM 不存 LINE user id；不需員工 API／Jerry Token                                  |
| D3  | 綁定方式            | **僅** `orderNo` + `taxId`（8 位數字統編）                                        |
| D4  | Hub→CRM 認證        | **僅** `Authorization: Bearer <服務 Token>` + 來源 IP allowlist                   |
| D5  | Binding JWT         | **取消**。不要求 `X-Customer-Binding`、不驗 RS256／kid／公鑰                      |
| D6  | 客戶範圍            | path 的 `{customerId}`；CRM 信任持 Token 的 Hub                                   |
| D7  | 本階段範圍          | **僅訂單三支**；售後 API 契約可留、**本階段不聯測**                               |
| D8  | 邀請碼／代表人綁定  | **正式棄用**，規格與程式移除                                                      |
| D9  | Webhook／事件推播   | **正式棄用**；用戶靠 LIFF 刷新拉資料                                              |
| D10 | Token 交付          | **明文寫入回覆檔** `hub.env`（內網交付）；不要 DPAPI、不要另開安全管道多輪        |
| D11 | 驗收方式            | YenShow LIFF 綁定一筆真單；**不做** probe／聯測包／O-xx 表                        |
| D12 | 舊公鑰交付          | `ys-hub-202610` 公鑰／JWT 文件 **作廢**，可忽略、勿再載入為必填                   |
| D13 | joint-test／sandbox | **本次互聯測試才加入的臨時路徑 → 請移除**；驗收只打 `192.168.1.11:9443`＋金儀真單 |

---

## 2. 請你移除／停用（必做）

請從 Customer Hub **規格、OpenAPI、程式、設定、文件** 一併拿掉或改為非必填：

1. `X-Customer-Binding` **必填與驗簽**（RS256、kid、`ys-hub-202610` 公鑰、`serviceId` claim、opaque `sub`）
   - 請求沒帶此 header：**不得 401／403**
   - 若仍收到此 header：**可忽略**
2. **邀請碼／代表人綁定** 全部路徑與文件
3. **Webhook／事件推播／Hub events 訂閱**
4. **測試用 Binding JWT env**（如 `CRM_TEST_BINDING_JWT`）及要求 YenShow 另簽測試 JWT
5. **DPAPI／另開管道取 Token** 的流程說明（改為寫入 `hub.env`）
6. **本次互聯才加入的 joint-test／sandbox 整條路徑**（見 §2.1）— **請移除**，勿再當閘門或交付物

### 2.1 joint-test／sandbox（本次測試臨時物 → 移除）

確認：joint-test 庫／sandbox（含 `127.0.0.1:8899`、`TEST-ONLY` Token、假 seed、`yenshow-test`、kid `test-20261013`、probe／聯測包／O-xx）是**這次 Customer Hub 互聯測試才加的**，不是長期正式架構。

請 CRM **直接移除**與本互聯相關的：

| 移除項目                                       | 說明                            |
| ---------------------------------------------- | ------------------------------- |
| joint-test／sandbox 閘門                       | 勿再要求先過聯測庫再接正式      |
| `sandbox.py`／`8899` 交付路徑                  | 勿再寫進對 YenShow 的說明或回覆 |
| `TEST-ONLY-*` Token、假統編／`TEST-PO-*`       | 勿當驗收資料                    |
| `yenshow-test`、test kid、Binding JWT 測試流程 | 一併拿掉                        |
| `probe.py`、network／orders 聯測包、O-01～O-12 | 勿再交付或要求 YenShow 重跑     |

驗收只留：§3 Base URL＋服務 Token＋§4 金儀真單。

---

## 3. 網路與端點（固定值）

| 項目         | 值                                                                         |
| ------------ | -------------------------------------------------------------------------- |
| CRM Base URL | `https://192.168.1.11:9443/api/customer-hub/v1`                            |
| 允許來源 IP  | `192.168.1.24`（YenShow Hub）                                              |
| TLS          | 內網 HTTPS；YenShow 已備 CA（`crm-ca.pem`），你方無需再交公鑰給 Binding 用 |

### 本階段必開三支（相對 Base URL）

| 方法   | 路徑                                       | 用途                                                 |
| ------ | ------------------------------------------ | ---------------------------------------------------- |
| `POST` | `/customers/verify-order`                  | body：`{ "orderNo", "taxId" }` → 回 customer + order |
| `GET`  | `/customers/{customerId}/orders`           | 訂單列表（可支援 page／limit／status）               |
| `GET`  | `/customers/{customerId}/orders/{orderId}` | 訂單明細（含交貨／品項欄位依現有契約）               |

認證：每個請求  
`Authorization: Bearer <CRM_API_TOKEN>`  
**不要**再要求第二組 header。

上列三支須對 `192.168.1.24` 可打通，且能回 §4 金儀訂單（或你更新後的 `ACCEPT_*`）。

---

## 4. 驗收用訂單（固定；若變更請改 hub.env 的 ACCEPT\_\*）

| 欄位               | 值               |
| ------------------ | ---------------- |
| 訂單編號 `orderNo` | `ORD-2026-0130`  |
| 統編 `taxId`       | `03028349`       |
| customerId         | `84`             |
| orderId            | `130`            |
| 客戶               | 金儀股份有限公司 |

YenShow 流程：LIFF 輸入上列訂單＋統編 → Hub `verify-order` → 列表／明細可顯示即通過。

---

## 5. 你方唯一交付物

### 路徑

`Desktop/YenShow_CRM_訂單互聯_回覆/`

（本機與 YenShow 同機桌面即可；或複製整個資料夾給 YenShow。）

### 必寫檔：`hub.env`（請覆寫，勿留空 Token）

```env
CRM_API_BASE_URL=https://192.168.1.11:9443/api/customer-hub/v1
CRM_API_TOKEN=<在此寫入正式服務 Token 明文，必填>
CRM_TOKEN_EXPIRES_AT=<ISO8601 效期；若無固定效期可寫 never 或留空>
ACCEPT_ORDER_NO=ORD-2026-0130
ACCEPT_TAX_ID=03028349
ACCEPT_CUSTOMER_ID=84
ACCEPT_ORDER_ID=130
```

### 規則

- `CRM_API_TOKEN` **必填明文**；寫完即完成交付
- **勿**進 git、**勿**貼公開頻道／群組
- **不要**附 probe 結果、長篇說明、多個 JSON、第二份密文檔
- 可選：同資料夾放一行 `DONE.txt`，內容僅 `ready`（非必要）

YenShow 會把 Token 轉入 Hub env、重啟後用 LIFF 驗收。

---

## 6. 明確不做／勿再問

| 主題                                    | 答案（已定）                                                                      |
| --------------------------------------- | --------------------------------------------------------------------------------- |
| 要不要永久 Token？                      | 長期服務 Token 即可；效期寫在 `CRM_TOKEN_EXPIRES_AT`；到期前再換並更新 `hub.env`  |
| 還要 Binding JWT／公鑰嗎？              | **不要**                                                                          |
| 還要邀請碼／Webhook 嗎？                | **不要**                                                                          |
| 售後／員工受理這輪要做嗎？              | **不要**（另案）                                                                  |
| 要 YenShow 跑 probe／聯測包嗎？         | **不要**（本次測試臨時物，請移除）                                                |
| joint-test／sandbox 要留嗎？            | **不要**（本次才加 → 請移除；驗收只用 §3＋金儀）                                  |
| Token 怎麼交？                          | **只寫** `hub.env`                                                                |
| Base URL 要不要改成 api.yenshow／反代？ | **本階段維持** `192.168.1.11:9443`                                                |
| 缺少欄位怎麼辦？                        | 用上表固定值；若單號失效，只改 `hub.env` 的 `ACCEPT_*` 並在回覆夾註一行列出新單號 |

---

## 7. 完成檢查清單（你方自檢後交卷）

- [ ] 三支訂單 API 對 `192.168.1.24` 可呼叫
- [ ] 認證僅 Bearer Token＋IP；**無** Binding JWT 必填
- [ ] 邀請碼、Webhook 已從對外規格／實作移除或停用
- [ ] `hub.env` 已填 `CRM_API_TOKEN` 明文與 ACCEPT\_\*
- [ ] 驗收單 `ORD-2026-0130`／`03028349` 仍有效（或已更新 ACCEPT\_\*）
- [ ] joint-test／sandbox／probe／聯測包已從本互聯交付路徑移除
- [ ] 未夾帶上述臨時測試物

交卷後等 YenShow LIFF 結果即可；**不必**主動再開下一輪規格討論。

---

## 8. 給 CRM Agent 的執行指令（可整段貼上）

```
請完整閱讀並執行：
Desktop/liff/docs/CRM_Agent_訂單功能正式串接執行單.md
（或同內容：YenShow_CRM_訂單互聯_回覆/交付CRM_Agent.md）

依該文件：
1) 訂單三支 API：Bearer 服務 Token + IP allowlist（192.168.1.24）→ https://192.168.1.11:9443/api/customer-hub/v1
2) 移除：X-Customer-Binding、邀請碼、Webhook
3) 移除本次互聯才加的 joint-test／sandbox（8899、TEST Token、probe、聯測包、O-xx、yenshow-test）
4) 覆寫 Desktop/YenShow_CRM_訂單互聯_回覆/hub.env，寫入 CRM_API_TOKEN 明文
5) 驗收單 ORD-2026-0130 / 03028349；不要再追問
完成後只交付該回覆資料夾。
```
