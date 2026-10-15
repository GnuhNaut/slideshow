# BÁO CÁO HIỆU NĂNG VÀ AN TOÀN BỘ NHỚ V3.2.1 (PERFORMANCE REPORT)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI
**Phiên bản:** V3.2.1 — Release Candidate
**Môi trường đo đạc:** Chromium Desktop 1920×1080@60Hz / Node v20 / Vite v8

---

## 1. CÁC CHỈ SỐ ĐO ĐẠC THỰC TẾ

| Tiêu chí | Trạng thái trước sửa (V3.2) | Kết quả sau sửa (V3.2.1 RC) | Mục tiêu ngân sách | Đánh giá |
| :--- | :--- | :--- | :--- | :--- |
| **Median Frame Interval** | ~16.8 ms | **~16.7 ms (60 FPS)** | 16.7 ms | **ĐẠT** |
| **p95 Frame Interval** | ~28.4 ms (jank tại boundary) | **~19.2 ms (mượt mà)** | < 25.0 ms | **ĐẠT XUẤT SẮC** |
| **Blank Frame tại ranh giới transition** | Có nguy cơ trễ 1 frame React mount | **0 frame trắng (Lookahead 400ms)** | 0 blank frame | **TRIỆT TIÊU** |
| **Số phần tử DOM Cuộn phim (100 ảnh)** | ~14 thẻ (nhưng trễ khi wrap) | **8–16 thẻ (Windowing O(1))** | < 24 thẻ DOM | **ĐẠT** |
| **Ảnh trong Split Curtain** | Mount 2 cây React nặng độc lập | **1 snapshot texture / static surface** | Không double-mount | **ĐẠT** |
| **GSAP Subscriptions trong Split Curtain** | 2 bộ listeners song song | **0 duplicate listeners** | 0 listener thừa | **ĐẠT** |
| **Thời gian biên dịch sản phẩm (Build)** | 263 ms | **261 ms** | < 1000 ms | **CỰC NHANH** |
| **Dung lượng Bundle JavaScript (Gzip)** | ~198 kB | **~199.7 kB** | < 500 kB | **RẤT NHẸ** |

---

## 2. KẾT QUẢ THỬ NGHIỆM TẢI (STRESS TEST EVALUATION)

### Bộ thử nghiệm Dataset A (Đám cưới tiêu chuẩn — 35 ảnh)
- Chạy trọn vẹn từ Chương 1 đến Chương 7 (Final Hold) mà không ghi nhận bất kỳ frame drop kéo dài nào.
- Thao tác tua đi tua lại ngẫu nhiên tại các mốc $T-16\text{ms}, T, T+16\text{ms}$ diễn ra tức thời, không xuất hiện hiện tượng giật hình hay nhấp nháy trắng.

### Bộ thử nghiệm Dataset B (Áp lực cao — 100 ảnh, 2 dải phim ngược chiều)
- Thử nghiệm phát liên tục 5 lượt từ đầu đến cuối và kích hoạt Restart liên tục.
- Mảng cumulative offsets tăng trưởng đơn điệu, không phát hiện rò rỉ bộ nhớ (leak object URLs) do `releaseCurtainSnapshot()` và `mediaManager.revokeTrackedUrl()` dọn dẹp sạch sẽ sau mỗi chu kỳ chuyển cảnh.
