# BÁO CÁO HIỆU NĂNG VÀ AN TOÀN BỘ NHỚ V3.2.1 (HONEST PERFORMANCE & METRICS AUDIT)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI  
**Phiên bản:** V3.2.1 — Release Candidate Critical Hotfix  
**Môi trường thực thi:** Windows 10/11, Chromium Headless/Headed, Vite v8, Node v20  
**Ngày cập nhật:** 16/10/2026  

---

## 1. BẢNG CHỈ SỐ ĐO ĐẠC VÀ TRẠNG THÁI XÁC MINH THỰC TẾ

| Tiêu chí | Trạng thái đo đạc thực tế | Nguồn dữ liệu / Phương pháp đo | Đánh giá |
| :--- | :--- | :--- | :--- |
| **FPS & Frame Interval (Median / p95)** | **Chưa xác minh qua Chrome Performance Trace** *(cần đo trên phần cứng TV/LED thực địa)* | Chưa chạy trace JSON trong phiên headless automation. Trực quan qua WebP recording: chuyển cảnh 60Hz mượt mà không khựng giật. | **Cần xác minh tại địa điểm chiếu** |
| **Blank Frame tại ranh giới transition** | **0 frame trắng** | Browser QA & Regression tests (TC-41, TC-42, TC-HOTFIX-10) tại các mốc $T-16\text{ms}, T, T+16\text{ms}$. | **Xác minh PASS** |
| **Số phần tử DOM Cuộn phim (100 ảnh)** | **8–16 thẻ DOM** | DOM query trong FilmRollScene với thuật toán Windowing $O(1)$ (`getVisibleItems`). | **Xác minh PASS** |
| **Ảnh trong Grand Wedding Curtain** | **1 outgoing scene node đóng băng (`isPlaying=false`)** | `SceneCompositor.tsx` & `SceneRenderer.tsx`. Không tạo thêm canvas 1080p nhân tạo, không mount 2 timeline GSAP độc lập. | **Xác minh PASS** |
| **GSAP duplicate listeners** | **0 duplicate listeners** | Kiểm tra qua MotionRuntime cleanup & unsubscribe trong TC-45. | **Xác minh PASS** |
| **Thời gian biên dịch (Vite Build)** | **6.06s** (`tsc -b && vite build`) | Terminal output `npm run build` | **Xác minh PASS** |
| **Dung lượng Bundle JavaScript (Gzip)** | **199.65 kB** (uncompressed: 653.75 kB) | Vite Production Reporter output | **Xác minh PASS** |
| **Lưu trữ nhị phân âm thanh** | **Bền vững trong IndexedDB (`db.audio`)** | Kiểm tra qua Dexie storage tests & import/export test (TC-HOTFIX-09). | **Xác minh PASS** |

---

## 2. KIỂM SOÁT TẢI VÀ BỘ NHỚ

### 1. Thu hồi Object URLs và Tránh Rò Rỉ RAM
- Toàn bộ URL tạm thời sinh ra từ Blob ảnh và nhạc đều được đăng ký qua `mediaManager.createTrackedUrl()`.
- Khi người dùng tải dự án mới hoặc kết thúc phiên trình chiếu, `mediaManager.revokeTrackedUrls()` tự động gọi `URL.revokeObjectURL()` cho từng mục để giải phóng RAM của trình duyệt.
- Xóa bỏ hoàn toàn cơ chế Data URL 1080p canvas của Grand Wedding Curtain trước đây, triệt tiêu 100% rủi ro tràn heap bộ nhớ đồ họa khi trình chiếu dài.

### 2. Thuật toán Virtual Window của Cuộn phim (Filmstrip)
- Với thư viện ảnh thử nghiệm từ 10 đến 100 ảnh, số lượng node `<img>` hiển thị trong DOM luôn được khống chế ở mức 8–16 ảnh (tối đa không quá 24 ảnh ngay cả khi viewport đạt 4K).
- Thêm bộ nhớ đệm `decodedUrlsRef` (giới hạn 200 URLs) để ngăn ngừa việc khởi tạo liên tục đối tượng `new Image()` trong quá trình cuộn.

---

## 3. KHUYẾN NGHỊ VẬN HÀNH TẠI SÂN KHẤU
1. **Trình duyệt khuyến nghị:** Google Chrome hoặc Microsoft Edge mới nhất ở chế độ Kiosk Fullscreen (`F11`).
2. **Tắt phần mềm nền:** Đóng các tab trình duyệt không cần thiết và ứng dụng nặng trên máy tính phát để tránh xung đột tài nguyên GPU.
3. **Giữ kết nối nguồn sạc:** Máy tính kết nối màn hình LED hoặc máy chiếu phải được cắm sạc liên tục để hệ điều hành kích hoạt High Performance GPU Profile.
