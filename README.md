# WEDDING FILM STORY V2 — TUẤN HÙNG & SAO MAI
### Modern Editorial Wedding Cinema • 19.10.2026
**Production Website:** [https://hungmai.netlify.app/](https://hungmai.netlify.app/)  
**GitHub Repository:** [https://github.com/GnuhNaut/slideshow](https://github.com/GnuhNaut/slideshow)  
**Reference Site:** [https://shinxsana.netlify.app/](https://shinxsana.netlify.app/)

---

## 1. Tổng Quan Kiến Trúc V2 & Các Cải Tiến P0

Phiên bản V2 là một bước nâng cấp toàn diện về **Motion Architecture**, **Performance**, **Lưu Trữ Bền Vững** và **Phong Cách Thẩm Mỹ**:

### 1.1. Master Playback Clock Độc Lập (`src/player/PlaybackClock.ts`)
- **Tách biệt hoàn toàn nhịp 60 FPS khỏi chu kỳ re-render của React:**
  - `masterClock` sử dụng vòng lặp RequestAnimationFrame duy nhất.
  - Các canvas, filmstrip và transform lắng nghe sự kiện `onFrame(currentTime)` trực tiếp qua CSS/DOM transforms mà không kích hoạt re-render toàn bộ cây component React.
  - Cung cấp `onThrottledTime` ở tần số ~10Hz (100ms) để cập nhật timecode và playhead scrubber mượt mà mà không gây giật lag.
  - Xử lý dừng, tua (seek), phát lại (resume) chính xác tuyệt đối mà không tích lũy RAF loop thừa khi đổi chương nhiều lần.

### 1.2. Rebuilt Filmstrip Engine (`src/scenes/FilmRollScene.tsx`)
- **Tính toán chuyển động trên quãng đường thực tế (Pixel Distance):**
  - Tích hợp `ResizeObserver` đo đạc chính xác chiều rộng container viewport thực tế.
  - Tính toán kích thước khung ảnh linh hoạt theo tỷ lệ thực tế (Ảnh ngang 16:9, 4:3, ảnh dọc 3:4, 9:16, ảnh vuông 1:1) bảo đảm không kéo méo hay cắt ảnh.
  - Cơ chế tính toán lặp liền mạch (*monotonic wrap*), loại bỏ hoàn toàn hiện tượng nhảy vị trí hoặc khoảng trắng tại điểm nối.
  - Cập nhật vị trí trực tiếp bằng `style.transform = translate3d(...)` ở 60 FPS, không có độ trễ CSS transition.

### 1.3. Đảm Bảo Không Bỏ Sót Ảnh (No Photos Left Behind)
- **Tự động phân cảnh (Auto Director Pagination):**
  - Trong **Chương 2 (Kỷ niệm):** Trình diễn toàn bộ danh sách ảnh trong cuộn phim 35mm mà không giới hạn template.
  - Trong **Chương 4 (Gia đình):** Tự động gom nhóm thành các phân cảnh 1 hoặc 2 ảnh bảo vệ toàn diện tỷ lệ ảnh tập thể (không crop mất người thân ở rìa).
  - Trong **Chương 5 (Ảnh cưới):** Phân bổ chu kỳ đa dạng (*Single Hero -> Editorial Duo -> Living Collage -> Fullscreen Reveal*). Dù người dùng tải 20, 50 hay 100 ảnh, 100% số ảnh đều được xếp lịch trình chiếu theo thứ tự.
  - Đã vượt qua kiểm thử tự động với 20 ảnh và 60 ảnh (*Vitest passing 100%*).

### 1.4. Lưu Trữ Ảnh Bền Vững Bằng IndexedDB (`src/media/mediaManager.ts`)
- **Lưu trữ Blob thực vào IndexedDB (`db.media`):**
  - Không lưu URL tạm thời `URL.createObjectURL` vào database dự án.
  - Lưu file gốc dạng `Blob` và thumbnail nén riêng biệt dưới `mediaId` ổn định.
  - Khi khởi động lại hoặc reload trang, `mediaManager.restoreProjectMedia()` đọc Blobs từ Dexie và cấp phát object URLs hợp lệ.
  - Cơ chế thu hồi URL tự động (`revokeUrl`, `revokeAll`) tránh rò rỉ bộ nhớ.
  - Xử lý tải ảnh hàng loạt theo hàng đợi linh hoạt: File lỗi được báo riêng mà không làm đứt đoạn cả lô ảnh.
  - **Export ZIP:** Đóng gói file nhị phân (binary blobs) thực tế từ IndexedDB vào thư mục `media/`.
  - **Import ZIP:** Giải nén và lưu thẳng Blobs vào IndexedDB.

### 1.5. Cơ Chế Kết Thúc Phim (`FINAL_HOLD`)
- Loại bỏ thời lượng ảo 10 giờ (`duration = 36000`).
- Thời lượng hiển thị trên timeline phản ánh chính xác độ dài thực tế của bộ phim (ví dụ: 2 phút 30 giây).
- Khi kết thúc phân cảnh Chương 7 (Our Forever, ~12s):
  - `masterClock` chuyển sang trạng thái `FINAL_HOLD`.
  - Dừng hoàn toàn đồng hồ phát và mọi chuyển động.
  - Giữ ảnh cuối vô thời hạn trên màn hình lớn.
  - **Không lặp lại, không hiện màn hình đen, không bật controls gây rối mắt trước quan khách.**

---

## 2. Phong Cách Thẩm Mỹ Mới: Modern Editorial Wedding Cinema

Loại bỏ các viền vàng giả kim, gradient lòe loẹt và các icon dày đặc. Sử dụng phong cách tạp chí điện ảnh tối giản, sang trọng:
- **Bảng màu:**
  - **Deep Espresso:** `#1C1718`
  - **Wine Red:** `#581E2C`
  - **Warm Ivory:** `#F5EDE1`
  - **Matte Champagne:** `#BFA47D`
  - **Dusty Rose:** `#CEB2AB`
- **Typography:** `Cormorant Garamond`, `Cormorant SC` (Small Caps Serif), `Playfair Display` kết hợp cùng `Be Vietnam Pro` (dấu tiếng Việt chuẩn xác).
- **Project Home:** Thiết kế như poster phim điện ảnh cao cấp, bố cục editorial bất đối xứng với ảnh cưới lớn làm trung tâm cùng 2 CTA tinh gọn: **MỞ STUDIO** và **BẮT ĐẦU TRÌNH CHIẾU**.

---

## 3. Kết Quả Kiểm Thử Tự Động (Vitest)

Chạy lệnh kiểm thử:
```bash
npx vitest run
```

Kết quả:
```
 ✓ src/player/__tests__/playbackClock.test.ts (4 tests)
 ✓ src/timeline/__tests__/compiler.test.ts (4 tests)
 ✓ src/media/__tests__/mediaManager.test.ts (2 tests)

 Test Files  3 passed (3)
      Tests  10 passed (10)
```
- **Test 1:** Nhập 20 ảnh kỷ niệm -> đủ 20 ảnh trong dải phim, không bỏ sót.
- **Test 2:** Nhập 20 ảnh gia đình -> phân cảnh an toàn, không crop mặt người.
- **Test 3:** Nhập 60 ảnh cưới -> toàn bộ 60 ảnh được xếp lịch trình chiếu đúng thứ tự.
- **Test 4:** Thời lượng phim thực tế, không cộng thêm 10 giờ.
- **Test 5:** MasterPlaybackClock tua, dừng, phát và kích hoạt `FINAL_HOLD` chính xác.
- **Test 6:** MediaManager xử lý batch và quản lý vòng đời URLs không rò rỉ.

---

## 4. Hướng Dẫn Khởi Chạy & Đóng Gói

```bash
# 1. Cài đặt dependencies
npm install

# 2. Khởi chạy dev server
npm run dev

# 3. Mở ứng dụng tại
http://localhost:5173/

# 4. Build production bundle (đã kiểm tra thành công)
npm run build
```

---

## 5. Triển Khai Lên Netlify

Dự án đã sẵn sàng 100% để triển khai lên Netlify:
- File `netlify.toml` đã cấu hình build command `npm run build` và thư mục `dist`.
- File `public/_redirects` bảo đảm hỗ trợ chuyển hướng SPA Client-side routing:
  ```
  /*    /index.html   200
  ```
- File cấu hình caching assets trong `netlify.toml` tối ưu tốc độ tải phim trên mạng tiệc cưới.
