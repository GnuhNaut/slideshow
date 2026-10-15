# BÁO CÁO CÁC VẤN ĐỀ TỒN ĐỌNG & LƯU Ý VẬN HÀNH (REMAINING ISSUES REPORT)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI
**Phiên bản:** V3.2.1 — Release Candidate

---

## 1. PHÂN LOẠI MỨC ĐỘ VẤN ĐỀ

### 1.1. BLOCKER (P0) — 0 VẤN ĐỀ
- Không còn bất kỳ lỗi P0 nào còn tồn đọng trong mã nguồn hoặc quá trình thử nghiệm.
- Cả 4 lỗi P0 (Scene Lifecycle, Filmstrip Wrap, Split Curtain, Project Import) đã được sửa dứt điểm tận gốc và chứng minh bằng test tự động + trình duyệt thật.

### 1.2. HIGH (P1) — 0 VẤN ĐỀ
- Không có lỗi chức năng ảnh hưởng tới tính năng chiếu phim hoặc chỉnh sửa trong Studio.

### 1.3. MEDIUM (P2) — CÁC GIỚI HẠN NGOẠI CẢNH CỦA TRÌNH DUYỆT (EXTERNAL CONSTRAINTS)
1. **Quyền Screen Wake Lock của Hệ điều hành:**
   - *Mô tả:* Screen Wake Lock API hoạt động tốt trên Chrome/Edge khi trang web đang hiển thị và người dùng đã tương tác (nhấn Bắt đầu trình chiếu). Tuy nhiên, trên một số laptop cài đặt quản lý nguồn điện ở mức gắt gao (Aggressive Battery Saver), hệ điều hành có thể ghi đè quyền của trình duyệt nếu laptop không được cắm sạc.
   - *Hướng dẫn xử lý:* Kỹ thuật viên bắt buộc cắm nguồn điện trực tiếp cho laptop và đặt Windows Sleep thành "Never" theo hướng dẫn trong [WEDDING_DAY_RUNBOOK.md](file:///d:/Workspace/slide-video/docs/WEDDING_DAY_RUNBOOK.md).

2. **Chính sách Autoplay Audio của Trình duyệt:**
   - *Mô tả:* Trình duyệt Chromium chặn tự phát âm thanh nếu không có cử chỉ người dùng (user gesture).
   - *Khắc phục đã triển khai:* Đã thiết kế màn hình Pre-show Ready Gate với nút "BẮT ĐẦU TRÌNH CHIẾU", mở khóa audio context ngay trong sự kiện click của người dùng. Kèm theo cơ chế cảnh báo và bật thủ công nếu bị tắt tiếng.

### 1.4. LOW (P3) — CẢI TIẾN TRẢI NGHIỆM TRONG TƯƠNG LAI
1. **Đổi nhạc nền trực tuyến:** Hiện tại hỗ trợ tải file MP3 nội bộ hoặc file nhạc có sẵn. Trong tương lai có thể bổ sung kho nhạc đám cưới mẫu phong phú hơn nếu người dùng muốn thay đổi nhanh trên mây.
