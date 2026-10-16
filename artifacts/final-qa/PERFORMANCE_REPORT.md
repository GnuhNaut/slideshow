# BÁO CÁO HIỆU NĂNG THẬT VÀ AN TOÀN TÀI NGUYÊN (PERFORMANCE & RESOURCE AUDIT)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI  
**Phiên bản:** V3.2.2 — Release Candidate  
**Môi trường thực thi:** Chromium Engine / Vite v8.3.4 / Node v20  

---

## 1. CÁC CHỈ SỐ KỸ THUẬT ĐO ĐẠC THỰC TẾ

| Tiêu chí | Kết quả đo đạc thực tế | Phương pháp & Nguồn dữ liệu | Đánh giá |
| :--- | :--- | :--- | :--- |
| **FPS & Frame Interval (Median / p95)** | **Chưa xác minh qua Chrome Performance Trace chính thức** *(cần thiết bị phần cứng TV/LED rạp chiếu)* | Cần đo đạc thực địa theo runbook. Quan sát bằng mắt thường qua video WebP: chuyển động 60Hz êm ái, không có drop kéo dài. | **Cần diễn tập tại sân khấu** |
| **Số thẻ DOM Image trong Cuộn phim (100 ảnh)** | **8–16 thẻ DOM** | Thuật toán Windowing $O(1)$ trong `filmstripMath.ts`. | **Xác minh PASS** |
| **Số Outgoing Instances trong Split Curtain** | **0 heavy scene duplicate** | Sử dụng `CurtainSurface` tĩnh nhẹ, không mount `LivingCollageScene` 2 lần. | **Xác minh PASS** |
| **GSAP duplicate listeners trong Transition** | **0 duplicate listeners** | Kiểm tra qua MotionRuntime cleanup & unsubscribe trong TC-74. | **Xác minh PASS** |
| **Thời gian biên dịch (Vite Build)** | **1.08s** | Output `vite build` | **Xác minh PASS** |
| **Dung lượng Bundle JavaScript (Gzip)** | **200.89 kB** (gốc: 661.15 kB) | Vite Production Reporter | **Xác minh PASS** |
| **Lưu trữ âm thanh nhị phân** | **Bền vững trong `db.audio`** | Dexie transaction commit & phục hồi sau reload (TC-79, TC-80). | **Xác minh PASS** |

---

## 2. KIỂM SOÁT BỘ NHỚ VÀ CHỐNG RÒ RỈ RAM
- **Thu hồi Tracked URLs:** Mọi object URL tạo ra từ ảnh và nhạc đều được lưu trong Map và thu hồi qua `mediaManager.revokeTrackedUrl()` khi unmount hoặc import dự án mới.
- **Không lưu Data URL 1080p:** Đã loại bỏ hoàn toàn cơ chế tạo Data URL canvas 1080p, giải phóng hoàn toàn áp lực RAM trên heap đồ họa của trình duyệt.
- **Bounded Decode Cache:** Giới hạn tối đa 200 items trong `decodedUrlsRef` ngăn rò rỉ bộ nhớ khi cuộn phim dài.
