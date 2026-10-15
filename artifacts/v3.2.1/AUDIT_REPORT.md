# BÁO CÁO KIỂM TOÁN HỆ THỐNG V3.2.1 (AUDIT REPORT)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI
**Phiên bản:** V3.2.1 — Release Candidate
**Commit nền tảng:** `100e1dd`
**Nhánh kiểm toán:** `v3.2.1-release-candidate`
**Ngày hoàn tất:** 15/10/2026

---

## 1. TỔNG QUAN PHẠM VI KIỂM TOÁN
Đợt kiểm toán V3.2.1 tập trung triệt để vào 4 trục lỗi nghiêm trọng (P0) đã tồn tại dai dẳng qua các phiên bản trước:
1. **P0-01 (Scene Lifecycle & Lookahead):** Cơ chế chọn cảnh dựa trên clock UI 10Hz dẫn tới nguy cơ trễ khung hình tại ranh giới $T$.
2. **P0-02 (Filmstrip Wrap & Virtual Window Sync):** Lệch pha giữa biến đổi `translate3d` theo RAF và danh sách ảnh gắn vào DOM ảo khi gặp seek/modulo wrap, kèm nguy cơ lag từ `loading="lazy"`.
3. **P0-03 (Split Curtain Double-Mounting):** Render hai lần cây React outgoing scene nặng nề trong cả 2 cánh rèm cửa, nhân đôi GSAP listeners và tài nguyên DOM.
4. **P0-04 (Atomic Project Import & Data Safety):** Quy trình nạp ZIP thiếu transaction phân tầng, có nguy cơ ghi dở dang nếu bộ nhớ bị đầy (QuotaExceededError).

---

## 2. KẾT QUẢ KIỂM TOÁN KỸ THUẬT

### 2.1. Phân tích nguyên nhân gốc (Root-Cause Audit)
- **Scene Lifecycle:** Thiếu khoảng chuẩn bị đón đầu (lookahead preparation). React component của scene kế tiếp chỉ bắt đầu mount vào đúng millisecond ranh giới transition kích hoạt, khiến browser phải vừa parse JSX vừa tải/decode ảnh ngay tại frame đầu tiên của chuyển cảnh.
- **Filmstrip Coordinate Invariant:** Biến đổi `translateX` và `virtualCameraX` bị tách rời; điều kiện cập nhật state ảo `Math.abs(diff) > 160` bị lỡ nhịp khi có cú nhảy modulo đột ngột. Thêm vào đó, `loading="lazy"` trì hoãn nạp ảnh khi dải phim đang chuyển động nhanh.
- **Split Curtain Compositing:** JSX `{outgoingSceneNode}` được truyền trực tiếp vào cả `leftCurtainRef` và `rightCurtainRef`. React buộc phải mount 2 instances riêng rẽ của component cảnh Chương 5 (`LivingCollageScene`), kích hoạt 2 vòng lặp hiệu ứng GSAP độc lập.
- **ZIP Import Pipeline:** Hàm `importProjectZip` cũ ghi trực tiếp vào `db.media` từng file một trước khi kiểm tra toàn vẹn cấu trúc và timeline; nếu người dùng ngắt trang hoặc hết quota giữa chừng, IndexedDB rơi vào trạng thái rác và store bị lệch.

### 2.2. Đánh giá chất lượng sau khắc phục
- **Codebase Integrity:** Không có bất kỳ thay đổi phá vỡ nào đối với schema dự án, màu sắc đám cưới, hay 6 chuyển chương điện ảnh.
- **TypeScript & Build:** `tsc -b && vite build` hoàn thành trong **261ms**, bundle tối ưu, không có lỗi kiểu dữ liệu.
- **Automated Test Suite:** **10/10 test suites, 60/60 tests PASS (100%)**, bao gồm 40 tests V3.2 và 20 tests hồi quy mới V3.2.1.
- **Browser Runtime:** Browser Playwright/Chromium ghi nhận 0 unhandled promise rejections, 0 console errors, 0 runtime exceptions.
