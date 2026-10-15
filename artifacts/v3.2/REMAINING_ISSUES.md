# BÁO CÁO CÁC VẤN ĐỀ VÀ KHUYẾN NGHỊ VẬN HÀNH (REMAINING ISSUES & OPERATIONAL ADVICE)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI
**Phiên bản:** V3.2

---

## 1. CÁC LỖI TỒN TẠI (ZERO P0 BUGS)
- **Lỗi mức P0 (Blocker / Crash):** 0 lỗi. Toàn bộ các luồng chính hoạt động ổn định.
- **Lỗi mức P1 (Critical):** 0 lỗi.
- **Lỗi mức P2 / Minor:**
  1. *Screen Wake Lock trên một số thiết bị di động cũ:* Nếu trình duyệt di động hoặc hệ điều hành cũ không hỗ trợ Screen Wake Lock API, màn hình có thể tự tắt theo cài đặt của hệ điều hành. (Đã có giải pháp dự phòng: panel kỹ thuật hướng dẫn tắt chế độ sleep trong Windows/macOS Settings).
  2. *Autoplay Audio chính sách trình duyệt:* Nếu người dùng không nhấn nút Bắt đầu trình chiếu mà cố tình gõ link trực tiếp vào `#stage`, trình duyệt có thể chặn autoplay âm thanh theo quy chuẩn bảo mật Web Audio (Đã xử lý: luồng bắt đầu luôn đi qua cử chỉ người dùng trực tiếp trên nút BẮT ĐẦU TRÌNH CHIẾU).

---

## 2. HƯỚNG DẪN DÀNH CHO NGƯỜI ĐIỀU KHIỂN TẠI LỄ CƯỚI (19/10/2026)
1. **Thiết lập máy tính trình chiếu:**
   - Cắm sạc máy tính suốt buổi lễ.
   - Kết nối dây HDMI hoặc cổng Type-C DisplayPort với màn hình LED/TV.
   - Mở Windows Settings > System > Power & battery > chọn "Never" cho Screen timeout và Sleep khi đang cắm sạc.
2. **Khởi chạy buổi diễn:**
   - Mở trình duyệt Google Chrome hoặc Microsoft Edge.
   - Truy cập vào trang web hoặc link production.
   - Nhấn nút **BẮT ĐẦU TRÌNH CHIẾU** để hệ thống tự động vào Toàn màn hình và kích hoạt Wake Lock.
3. **Phím tắt nhanh khi cần điều khiển:**
   - `Space`: Tạm dừng / Tiếp tục.
   - `Mũi tên Phải (→)`: Tiến nhanh tới chương sau.
   - `Mũi tên Trái (←)`: Lùi về chương trước.
   - `F`: Toàn màn hình / Thu nhỏ.
   - `M`: Bật / Tắt tiếng.
   - `ESC`: Quay trở lại Studio biên tập.
