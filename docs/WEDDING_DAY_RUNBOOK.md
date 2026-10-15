# SỔ TAY VẬN HÀNH TRÌNH CHIẾU NGÀY CƯỚI (WEDDING DAY RUNBOOK)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI
**Ngày cưới:** 19/10/2026
**Phiên bản khuyến nghị:** V3.2.1 — Release Candidate

---

## 1. THIẾT BỊ VÀ PHẦN CỨNG BẮT BUỘC
1. **Laptop điều khiển chính:**
   - Hệ điều hành: Windows 10/11 hoặc macOS với Google Chrome / Microsoft Edge bản mới nhất.
   - Luôn cắm bộ sạc nguồn chính hãng trong suốt buổi lễ (không dùng pin để tránh chế độ tiết kiệm điện làm giảm FPS).
2. **Laptop dự phòng:**
   - Chuẩn bị sẵn 1 laptop thứ hai đã sao lưu file dự án `.zip` và đã mở sẵn website.
3. **Cáp kết nối và Adapter:**
   - Dây cáp HDMI 2.0 / 2.1 hỗ trợ chuẩn Full HD 1080p@60Hz hoặc 4K.
   - Đầu chuyển Type-C sang HDMI chất lượng cao nếu laptop không có cổng HDMI tiêu chuẩn.
4. **Hệ thống âm thanh:**
   - Dây cáp âm thanh 3.5mm sang AV/Canon hoặc kết nối trực tiếp qua ngõ HDMI của bộ mixer âm thanh tiệc cưới.

---

## 2. THIẾT LẬP MÀN HÌNH VÀ HỆ ĐIỀU HÀNH
1. **Cấu hình hiển thị (Windows Display Settings):**
   - Nhấn tổ hợp phím `Windows + P` và chọn **Duplicate** (nhân bản màn hình) hoặc **Second Screen Only** (chỉ hiển thị màn hình ngoài).
   - Vào `Display Settings`:
     - Độ phân giải: **1920 × 1080 (Recommended)**.
     - Tỷ lệ hiển thị (Scale): **100%** (tránh để 125% hoặc 150% gây lệch layout).
     - Tần số quét (Refresh rate): **60 Hz**.
2. **Chống tắt màn hình / Sleep:**
   - Vào `Windows Settings` $\to$ `System` $\to$ `Power & battery` $\to$ `Screen and sleep`:
     - **When plugged in, turn off my screen after:** Đặt **Never**.
     - **When plugged in, put my device to sleep after:** Đặt **Never**.
   - Kiểm tra cài đặt của TV / Bộ xử lý màn hình LED (LED Video Processor): Tắt tính năng *Auto Standby*, *Eco Mode*, hoặc *Sleep Timer*.

---

## 3. QUY TRÌNH MỞ VÀ VẬN HÀNH TRÌNH CHIẾU
1. **Khởi động ứng dụng:**
   - Mở trình duyệt Chrome / Edge trên laptop.
   - Mở website: `https://hungmai.netlify.app/` (hoặc mở bản local offline nếu mạng chập chờn).
2. **Xác minh dữ liệu ảnh và nhạc:**
   - Tại trang chủ hoặc Studio, kiểm tra các chương:
     - Chương 1: Lời Mở Đầu (Intro).
     - Chương 2: Cuộn Phim Kỷ Niệm (Film Roll 35mm).
     - Chương 3: Khoảnh Khắc Cầu Hôn (Hero Moment).
     - Chương 4: Ngày Dạm Ngõ (Family Album).
     - Chương 5: Album Ảnh Cưới (Wedding Montage).
     - Chương 6: Lời Cảm Ơn (Grand Thank You Stage).
     - Chương 7: Ảnh Kết Thúc (Final Hold).
3. **Mở Stage (Phòng Chiếu):**
   - Nhấn nút **TRÌNH CHIẾU PHIM CƯỚI** từ trang chủ.
   - Màn hình sẽ chuyển sang chế độ **Pre-show Ready Gate**:
     - Đồng hồ ở trạng thái 00:00.
     - Âm thanh ở trạng thái chờ (chưa phát).
     - Toàn bộ ảnh của Chương 1 và Chương 2 được pre-warm ngầm.
4. **Kích hoạt phát phim chính thức:**
   - Khi MC tuyên bố bắt đầu phát video cưới, kỹ thuật viên nhấn nút **BẮT ĐẦU TRÌNH CHIẾU** (hoặc nhấn phím `Space` / `F`).
   - Cử chỉ này tự động:
     - Kích hoạt chế độ Fullscreen toàn màn hình.
     - Mở khóa AudioContext phát nhạc đám cưới chất lượng cao.
     - Kích hoạt API Presentation Screen Wake Lock giữ sáng màn hình.
     - Bắt đầu chuyển động Master Clock 60 FPS từ giây 0.0.

---

## 4. XỬ LÝ CÁC TÌNH HUỐNG SỰ CỐ TẠI CHỖ (TROUBLESHOOTING)
1. **Nếu Fullscreen bị trình duyệt chặn:**
   - Hệ thống tự động chuyển sang **Theater Mode** lấp đầy toàn bộ cửa sổ trình duyệt mà không bị crash.
   - Kỹ thuật viên có thể nhấn phím `F11` trên bàn phím để đưa trình duyệt về Fullscreen hệ điều hành.
2. **Nếu âm thanh chưa phát tiếng:**
   - Di chuột lên góc trên màn hình, kiểm tra biểu tượng Loa ở thanh điều khiển.
   - Nhấn vào biểu tượng Loa để bật âm lượng (hoặc tăng âm lượng hệ thống của laptop).
3. **Nếu vô tình bấm ESC thoát Fullscreen:**
   - Phim vẫn tiếp tục chiếu bình thường.
   - Kỹ thuật viên chỉ cần click vào icon **Toàn màn hình** ở góc phải hoặc nhấn phím `F` để quay lại toàn màn hình.
4. **Nếu cần tạm dừng hoặc tua lại:**
   - Nhấn phím `Space` để Tạm dừng / Tiếp tục.
   - Sử dụng phím mũi tên Trái $\leftarrow$ / Phải $\rightarrow$ để tua lùi/tiến 5 giây.
5. **Khi kết thúc phim:**
   - Phim sẽ tự động dừng tại bức ảnh cưới đẹp nhất ở **FINAL_HOLD**.
   - Bức ảnh đứng yên trang trọng, không có màn hình đen, không tự động phát lặp lại.
   - Màn hình tiếp tục được giữ sáng để làm phông nền chụp ảnh cho quan khách.

---

## 5. DỰ PHÒNG SAO LƯU VÀ KHÔI PHỤC (BACKUP & RECOVERY)
1. **Xuất file dự phòng trước ngày cưới:**
   - Trong giao diện Studio hoặc Trang chủ, nhấn **Xuất file dự án (.ZIP)**.
   - Lưu file `.zip` vào USB và gửi vào email/Google Drive cá nhân.
2. **Khôi phục trên máy mới:**
   - Mở website trên laptop mới $\to$ Nhấn **Nhập file dự án (.ZIP)** $\to$ Chọn file ZIP vừa lưu.
   - Quy trình nạp nguyên tử (Atomic Import) sẽ giải nén toàn bộ ảnh và nhạc vào IndexedDB của máy mới trong vài giây.
3. **Chạy bản dự phòng Offline (Không cần Internet):**
   - Đã chuẩn bị sẵn thư mục dist được build tĩnh: mở terminal gõ `npm run preview` hoặc dùng bất kỳ static local server nào để chiếu mà không cần kết nối mạng.
4. **Khuyến nghị vàng:**
   - **Bắt buộc diễn tập chạy thử ít nhất 1 lần** vào buổi tổng duyệt trước giờ đón khách với chính laptop, dây cáp HDMI, màn hình LED và hệ thống âm thanh của sảnh cưới.
