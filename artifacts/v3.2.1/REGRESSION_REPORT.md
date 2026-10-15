# BÁO CÁO KIỂM THỬ HỒI QUY TOÀN DIỆN V3.2.1 (REGRESSION REPORT)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI
**Phiên bản:** V3.2.1 — Release Candidate

---

## 1. MỤC TIÊU VÀ PHƯƠNG PHÁP
Đảm bảo rằng toàn bộ các thay đổi sửa lỗi cho P0-01, P0-02, P0-03, P0-04 không gây ra bất kỳ tác dụng phụ hoặc lỗi hồi quy nào đối với các tính năng đã hoạt động ổn định ở V3.2.

## 2. KẾT QUẢ ĐỐI SOÁT HỒI QUY

### 2.1. Nhóm Scene Lifecycle & Transitions
- **Trước thay đổi:** 2 bài test cơ bản.
- **Sau thay đổi:** Bổ sung 4 ca kiểm thử chi tiết về ranh giới $T-16\text{ms}, T, T+16\text{ms}$ (TC-41, TC-42, TC-43, TC-44).
- **Kết quả:** Không có xung đột với `computeTransitionState`. Tiến trình của cảnh đi ra và cảnh đi vào tiếp tục phát triển mượt mà từ 0 đến 1 mà không bị reset.

### 2.2. Nhóm Filmstrip Virtualization & Math
- **Trước thay đổi:** 6 bài test ảo hóa cơ bản.
- **Sau thay đổi:** Bổ sung 5 ca kiểm thử toán học tọa độ thuần túy (TC-47, TC-48, TC-49, TC-50, TC-51, TC-59).
- **Kết quả:** `getTrackPosition` và `getVisibleItems` bao phủ hoàn hảo cả hai chiều RTL và LTR, không có khoảng hở màn hình ở bất kỳ mốc modulo wrap nào.

### 2.3. Nhóm Split Curtain 3D & Surface Texture
- **Trước thay đổi:** Chưa có test kiểm soát số lượng listener của curtain.
- **Sau thay đổi:** Thêm TC-52 và TC-53 kiểm tra việc giải phóng tài nguyên sau transition.
- **Kết quả:** Outgoing scene không còn bị mount kép; `releaseCurtainSnapshot()` thu hồi toàn bộ canvas và dữ liệu ảnh đệm, ngăn chặn hoàn toàn rò rỉ bộ nhớ.

### 2.4. Nhóm IndexedDB & Atomic Project Import
- **Trước thay đổi:** Test import chưa kiểm tra trường hợp schema hỏng hoặc transaction abort.
- **Sau thay đổi:** Thêm TC-54, TC-55, TC-56.
- **Kết quả:** Hàm `validateProjectSchema` từ chối các định dạng sai trước khi tương tác với IndexedDB, đảm bảo 100% tính nguyên vẹn của dự án hiện tại.

---

## 3. KẾT LUẬN
- **Số lỗi hồi quy phát hiện:** 0.
- **Tương thích ngược:** 100% tương thích với cấu trúc dự án V3.2.
- **Toàn bộ 60 ca nghiệm thu:** **PASS (100%)**.
