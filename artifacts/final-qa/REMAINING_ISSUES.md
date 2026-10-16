# BÁO CÁO CÁC VẤN ĐỀ TỒN ĐỌNG & LƯU Ý VẬN HÀNH (REMAINING ISSUES REPORT)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI  
**Phiên bản:** V3.2.2 — Release Candidate  

---

## 1. PHÂN LOẠI MỨC ĐỘ VẤN ĐỀ
- **Blocker (P0): 0 VẤN ĐỀ.**
  - Toàn bộ các vấn đề P0 (Curtain dual scene mount, ZIP export/import integrity, Thumbnail persistence, Audio persistence) đã được giải quyết tận gốc và chứng minh bằng 90 tests tự động + kiểm thử Chromium có video.
- **High (P1): 0 VẤN ĐỀ.**
  - Toàn bộ 7 chương và 6 chuyển cảnh hoạt động ổn định.
- **Medium (P2) — Giới hạn hệ điều hành / Trình duyệt bên ngoài:**
  1. *Screen Wake Lock:* Trình duyệt Chromium hỗ trợ tốt khi có user interaction (bấm nút "Bắt đầu trình chiếu"). Tuy nhiên, nếu laptop dùng pin và kích hoạt chế độ tiết kiệm điện nghiêm ngặt, Windows có thể cưỡng chế tắt màn hình. Kỹ thuật viên bắt buộc cắm nguồn điện cho laptop theo Runbook.
  2. *Autoplay Audio:* Trình duyệt chặn tự phát âm thanh nếu không có cử chỉ người dùng. Đã thiết kế màn hình Pre-show Ready Gate để người dùng bấm nút mở khóa Web Audio context.

---

## 2. KHUYẾN NGHỊ VẬN HÀNH TẠI SÂN KHẤU (RUNBOOK SUMMARY)
1. **Thiết bị:** Laptop kết nối cổng HDMI ra máy chiếu/màn hình LED rạp cưới.
2. **Nguồn điện:** Cắm sạc 100% thời gian chiếu.
3. **Trình duyệt:** Google Chrome hoặc Microsoft Edge mới nhất, mở Kiosk Fullscreen (`F11`).
4. **Kiểm tra âm thanh:** Trước giờ đón khách, bấm thử "BẮT ĐẦU TRÌNH CHIẾU" để kiểm tra âm lượng đầu ra ra dàn loa sân khấu.
