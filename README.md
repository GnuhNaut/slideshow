# WEDDING FILM STORY — TUẤN HÙNG & SAO MAI
### Cinematic Hybrid 35mm Film Journey • 19.10.2026

Ứng dụng web cao cấp biến những bức ảnh cưới tĩnh thành một bộ phim điện ảnh sống động để trình chiếu trên màn hình LED, TV hoặc máy chiếu trong ngày trọng đại.

---

## 1. Thông Tin Đám Cưới & Thiết Kế

- **Chú rể & Cô dâu:** Tuấn Hùng & Sao Mai
- **Ngày cưới:** 19.10.2026 (Nhằm ngày 10/09 Âm lịch năm Bính Ngọ)
- **Phong cách thẩm mỹ:** *Cinematic Hybrid Film Journey*
  - Phim nhựa 35mm với dải lỗ đục (sprockets/perforations) và viền phim Kodak cổ điển.
  - Tông màu hoàng gia kết hợp: *Cinematic Black* (`#151114`), *Deep Burgundy* (`#81252D`), *Lacquer Red* (`#C91D26`), *Champagne Gold* (`#D4AC59`), *Warm Ivory* (`#FFF4E4`).
  - Typography điện ảnh: *Cormorant Garamond*, *Cormorant SC*, *Playfair Display* và *Be Vietnam Pro* (hỗ trợ trọn vẹn dấu tiếng Việt).
  - Khung hình chuẩn điện ảnh 16:9 với cơ chế letterbox thông minh tự thích ứng mọi độ phân giải.

---

## 2. Kiến Trúc 3 Khu Vực Chính

### A. Project Home (Trang Bìa Poster Phim)
- Thiết kế như poster bộ phim cưới cao cấp.
- Hiển thị đầy đủ thông tin: Tên cô dâu chú rể, ngày cưới, tổng số ảnh, tổng thời lượng, trạng thái lưu tự động.
- Các nút hành động chính:
  - **Mở Studio Biên Tập** (`#studio`)
  - **Xem Thử Phim** (bắt đầu phát trong monitor 16:9)
  - **Trình Chiếu** (`#stage`)
  - **Xuất Trọn Gói Dự Án (ZIP)**
  - **Nhập Dự Án (ZIP)**

### B. Wedding Film Studio (Giao Diện Dựng Phim)
- **Header:** Logo, tên dự án, trạng thái lưu IndexedDB thời gian thực, Undo/Redo, phím tắt, nút xuất/nhập ZIP, cài đặt thông tin, mở cửa sổ trình chiếu thứ hai.
- **Sidebar Trái (7 Chương):** Danh sách 7 chương điện ảnh kèm số lượng ảnh, thời lượng và nút bật/tắt hoặc phát nhanh từng chương.
- **Khu Vực Trung Tâm:** Màn hình Preview 16:9 sắc nét, thanh điều khiển phát (Play/Pause, tua lùi/tua tới chương, tốc độ 0.75x–1.25x, âm lượng, toàn màn hình).
- **Thước Thời Gian (Timeline Scrubber):** Hiển thị phân đoạn từng chương theo tỷ lệ thời gian thực tế, playhead scrubber kéo thả mượt mà.
- **Thư Viện Ảnh (Media Library):** Hỗ trợ chọn hàng loạt ảnh từ máy tính hoặc kéo thả (drag & drop), đổi thứ tự, đặt làm Hero moment, chuyển chương, xóa ảnh.
- **Inspector Bên Phải:**
  - *Với ảnh:* Công cụ chọn tâm điểm ống kính trực quan (**Focal Point Crosshair Picker** bằng cách nhấp chuột lên ảnh), chế độ Crop (**Cover / Contain / Fill**), đặt làm ảnh kết thúc.
  - *Với chương:* Đổi hiệu ứng Film Engine (F01–F08), tốc độ cuộn, câu trích dẫn lãng mạn, thời lượng ghi đè.

### C. Cinema Player / Stage Mode (Chế Độ Trình Chiếu)
- Thiết kế chuyên biệt cho sân khấu tiệc cưới:
  - **Màn hình chuẩn bị (Ready Gate):** Hiển thị tên hai người, ngày cưới và nút lớn **BẮT ĐẦU TRÌNH CHIẾU**.
  - Tự động kích hoạt fullscreen và bật âm thanh khi người điều khiển bấm bắt đầu (tuân thủ chính sách autoplay trình duyệt).
  - **Không có thanh cuộn, không có viền nút cố định, con trỏ chuột tự ẩn sau 2.8 giây**.
  - **Phím tắt nhanh:**
    - `Space`: Phát / Tạm dừng
    - `Phím mũi tên Trái / Phải`: Chuyển chương
    - `M`: Bật / Tắt tiếng (Mute/Unmute)
    - `F`: Toàn màn hình (Fullscreen)
    - `R`: Phát lại từ đầu (Restart)
    - `Esc`: Thoát chế độ trình chiếu
  - **Hỗ trợ 2 màn hình (Remote Dual Screen):** Mở cửa sổ thứ 2 qua `BroadcastChannel` để máy điều khiển nằm một nơi, màn hình LED phát một nơi.
  - **Chương 7 (Our Forever - Final Freeze):** Dừng hoàn toàn ở bức ảnh kết thúc đã chọn, **KHÔNG lặp lại, KHÔNG tắt màn hình đen, KHÔNG hiện thanh điều khiển trước quan khách**, giữ nguyên vẹn cho đến khi người điều khiển chủ động thoát.

---

## 3. Cấu Trúc 7 Chương Điện Ảnh

1. **CHƯƠNG 1 — INTRO: THE BEGINNING**
   - Ánh sáng lan tỏa từ bóng tối, tựa đề *The Wedding of Tuấn Hùng & Sao Mai*, ngày 19.10.2026, con dấu monogram hoàng gia, ảnh mở đầu đưa vào khung hình trang trọng.
2. **CHƯƠNG 2 — NHỮNG NGÀY BÊN NHAU**
   - Cuộn phim 35mm liên tục hoặc cuộn kép ngược chiều (*Dual Film Roll*), viền phim đục lỗ, chạy ngang mượt mà tái hiện thanh xuân ngọt ngào.
3. **CHƯƠNG 3 — LỜI CẦU HÔN**
   - Dải phim giảm tốc mềm mại (*Film to Hero*), bức ảnh cầu hôn phóng lớn ra giữa sân khấu kết hợp chuyển động camera chậm đầy cảm xúc.
4. **CHƯƠNG 4 — HAI GIA ĐÌNH, MỘT HẠNH PHÚC**
   - Ảnh dạm ngõ, ăn hỏi. Chế độ bảo vệ toàn diện ảnh gia đình (*Family Contain Protection*) bảo đảm các cô chú, bố mẹ ở rìa ảnh không bị cắt méo.
5. **CHƯƠNG 5 — FOREVER TOGETHER**
   - Cao trào thị giác: Bộ ảnh cưới bờ biển, váy cưới tinh khôi, bố cục *Living Collage* với chuyển động nổi đa tầng và ảnh toàn màn hình.
6. **CHƯƠNG 6 — LỜI CẢM ƠN**
   - Thông điệp tri ân sâu sắc trên phông nền ảnh cưới chuyển động chậm, nhạc nền dịu êm:
   > *"Xin chân thành cảm ơn gia đình, người thân và bạn bè đã đồng hành và chia sẻ niềm hạnh phúc cùng chúng tôi."*
7. **CHƯƠNG 7 — OUR FOREVER (FINAL FREEZE)**
   - Bức ảnh kết thúc thiêng liêng xuất hiện và dừng hoàn toàn vô thời hạn.

---

## 4. Hệ Thống Âm Thanh

- **Web Audio Synthesizer Tích Hợp:** Tự động phát chuỗi hòa âm piano giao hưởng cưới lãng mạn (D major / B minor) bản quyền miễn phí, không lo thiếu file nhạc.
- **Hỗ trợ Tải File MP3 Riêng:** Cho phép tải các bài hát cưới yêu thích, tự động đồng bộ tua/dừng theo hình ảnh.

---

## 5. Cài Đặt & Chạy Cục Bộ (Local Development)

```bash
# 1. Cài đặt dependencies
npm install

# 2. Khởi chạy máy chủ phát triển
npm run dev

# 3. Mở trình duyệt tại:
http://localhost:5173/
```

### Build Sản Phẩm

```bash
npm run build
```
Thư mục xuất xưởng tối ưu nằm tại `./dist`.

---

## 6. Triển Khai Lên Netlify

Dự án đã được cấu hình sẵn cho Netlify:
- File `netlify.toml` đã thiết lập lệnh build `npm run build` và thư mục `dist`.
- File `public/_redirects` bảo đảm hỗ trợ chuyển hướng SPA Client-side routing:
  ```
  /*    /index.html   200
  ```
- Để deploy:
  1. Đẩy mã nguồn lên GitHub/GitLab.
  2. Kết nối kho lưu trữ với Netlify.
  3. Chọn branch `main`, hệ thống sẽ tự động build và cung cấp link xem trực tiếp.

---

## 7. Xuất & Khôi Phục Dự Án (Offline Backup)

- Nhấn nút **Xuất Trọn Gói (ZIP)** ở góc trên thanh công cụ để lưu trữ toàn bộ cấu hình, ảnh và nhạc thành một file `.zip` duy nhất.
- Khi chuyển sang máy tính khác, chỉ cần nhấn **Nhập ZIP** và chọn file để khôi phục toàn bộ timeline và hình ảnh nguyên vẹn mà không cần kết nối mạng.
