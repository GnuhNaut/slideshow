# WEDDING FILM STORY V3 — TUẤN HÙNG & SAO MAI
### Complete Cinematic Experience Rebuild • Luxury Wedding Motion Design • 19.10.2026
**Production Website:** [https://hungmai.netlify.app/](https://hungmai.netlify.app/)  
**GitHub Repository:** [https://github.com/GnuhNaut/slideshow](https://github.com/GnuhNaut/slideshow)  
**Reference Site:** [https://shinxsana.netlify.app/](https://shinxsana.netlify.app/)

---

## 1. Tổng Quan Kiến Trúc V3 — Bước Đột Phá Về Mỹ Thuật & Motion

Phiên bản V3 là bản nâng cấp toàn diện và triệt để về **Art Direction**, **GSAP 3D Motion Engine**, **Transition Director**, **Screen Wake Lock**, và **Hiệu Suất Thực Tế**:

### 1.1. Art Direction Hoàn Toàn Mới: Bright Luxury Wedding Cinema
Chuyển đổi từ phong cách tối sang phong cách **Tươi Sáng, Sang Trọng, Lãng Mạn & Tràn Đầy Không Khí Lễ Cưới**:
- **Warm Ivory:** `#FFF9F2` (Nền chủ đạo thanh nhã, ấm cúng)
- **Blush Pink:** `#F0DFD5` (Sắc hồng phấn dịu dàng)
- **Wedding Red:** `#C93442` (Đỏ cưới điểm nhấn thiêng liêng và may mắn)
- **Champagne Gold:** `#C5A16E` (Vàng champagne quý phái)
- **Soft Cocoa:** `#40322F` (Màu chữ và chi tiết tương phản sắc nét)
- **Pure White:** `#FFFFFF` (Khung ảnh và thẻ bài trí cao cấp)
- Loại bỏ hoàn toàn các lớp phủ tối màu dày đặc, brightness thấp hay vignette đen làm tối ảnh cưới.

---

## 2. Thư Viện 12 Hiệu Ứng GSAP 3D Cao Cấp (`src/effects/`)

| Mã FX | Tên Hiệu Ứng | Mô Tả & Công Nghệ Thực Hiện |
| :--- | :--- | :--- |
| **FX01** | `CinematicFilmRibbon` | Dải phim 35mm trôi nổi trong không gian 3D với phối cảnh perspective, tính khoảng cách thực tế, không giật và loop liền mạch. |
| **FX02** | `ArcCarousel3D` | Các bức ảnh bố trí trên cung cong 3D (cylinder space), thẻ giữa phóng lớn chính diện, hai bên nghiêng sâu theo trục Z. |
| **FX03** | `HeroFrameMorph` | Biến hình hình học liên tục từ khung nhỏ phóng lớn thành tâm điểm điện ảnh với camera drift cực nhẹ. |
| **FX04** | `LuxuryAlbumPageTurn` | Lật trang album cưới bìa cứng 3D sang trang màu ivory với bóng đổ và nếp gấp chân thực (`rotateY: -180deg`). |
| **FX05** | `FloatingPhotoGallery` | Thư viện ảnh đa tầng chiều sâu (multi-depth) với độ lệch Z-space và chuyển động lơ lửng tinh tế. |
| **FX06** | `EditorialSplitReveal` | Bố cục tạp chí cưới 60/40 với ảnh chính chiếm đa số và ảnh phụ kèm lời tựa chạy trượt mượt mà. |
| **FX07** | `DepthPushTransition` | Cảnh cũ lùi dần vào chiều sâu Z-space (`translateZ`), cảnh mới tiến từ sau ra trước với độ mờ chuyển tiếp. |
| **FX08** | `PhotoStackReveal` | Chồng ảnh in cưới vật lý trượt mở từng tấm sang hai bên để lộ những khoảnh khắc tiếp theo. |
| **FX09** | `CinematicMaskReveal` | Mở màn khung ảnh bằng mặt nạ hình học mở rộng từ trung tâm ra toàn màn hình. |
| **FX10** | `ElegantParallax` | Chuyển động 3 lớp quang sai (nền ánh sáng, ảnh cưới hero, hạt sáng tiền cảnh) tạo chiều sâu điện ảnh thực. |
| **FX11** | `PhotoMosaicTransformation` | Ghép ảnh bất đối xứng nghệ thuật (1 ảnh lớn + 2 ảnh phụ xếp chồng) chuyển đổi vị trí mượt mà. |
| **FX12** | `GrandThankYouReveal` | Sân khấu tri ân cao trào cảm xúc: Hai ảnh cưới bao bọc hai bên, tiêu đề LỜI CẢM ƠN lớn nổi bật trên nền ivory/champagne. |

---

## 3. Bộ Máy Điều Khiển Chuyển Chương (`TransitionDirector` & `SceneCompositor`)

Khắc phục hoàn toàn việc chuyển cảnh sơ sài bằng hệ thống chuyển chương 3D thực thụ:
- **`TransitionRegistry` & `TransitionDirector`:**
  - **Chương 1 → 2 (`CINEMATIC_FILM_OPENING`):** Intro thu nhỏ nhẹ, dải phim 35mm trôi vào trung tâm mở rộng không gian.
  - **Chương 2 → 3 (`FILM_TO_HERO_3D_MORPH`):** Dải phim nghiêng 3D lùi lại, bức ảnh cầu hôn tách ra phóng lớn vào chính diện.
  - **Chương 3 → 4 (`ALBUM_PAGE_TURN_3D`):** Trang ảnh cầu hôn lật sang trang album gia đình ấm cúng màu ivory.
  - **Chương 4 → 5 (`PREMIUM_GALLERY_REVEAL`):** Album gia đình chuyển tiếp 3D sang các mảng ảnh cưới rực rỡ.
  - **Chương 5 → 6 (`GRAND_THANK_YOU_TRANSITION`):** Các ảnh cưới dạt nhẹ sang hai bên nhường vị trí trung tâm cho lời cảm ơn.
  - **Chương 6 → 7 (`FINAL_PHOTO_REVEAL`):** Lời cảm ơn mờ dần, ảnh cưới cuối cùng chiếm trọn màn hình, đóng băng vĩnh viễn (`FINAL_HOLD`).
- **`SceneCompositor`:** Cho phép cảnh cũ và cảnh mới đồng thời tồn tại trong khoảng thời gian transition (0.9s - 1.4s), dựng bằng GSAP 3D transforms (`rotateY`, `scale`, `translateZ`, `opacity`), không có chớp đen hay chớp trắng.

---

## 4. Giải Quyết Triệt Để Các Vấn Đề Thực Tế (P0)

1. **Khắc phục chương Cầu Hôn (1 ảnh):**
   - Loại bỏ hoàn toàn 2 scene thừa kéo dài 16s.
   - Khi chỉ có 1 ảnh: Tự động biên soạn **chuỗi duy nhất đúng 5.5 giây**:
     - `0.0 - 0.8s`: Hiệu ứng vào cảnh
     - `0.8 - 1.7s`: Chuyển động 3D vào vị trí trung tâm
     - `1.7 - 4.8s`: Ổn định sắc nét, camera breathing cực nhẹ
     - `4.8 - 5.5s`: Chuẩn bị lật trang sang chương Dạm ngõ.
2. **Bảo vệ toàn vẹn ảnh gia đình (Chương 4):**
   - Sử dụng layout Album Spread bảo vệ tỷ lệ gốc (`contain`), cam kết không cắt mất khuôn mặt cha mẹ, người thân ở hai bên mép ảnh.
3. **Chương Ảnh Cưới (Chương 5) đa dạng phong phú:**
   - Chu kỳ 5 dạng phân cảnh liên tục thay đổi (Fullscreen Hero, Editorial Split 60/40, Photo Mosaic, Floating Gallery, 3D Arc Carousel). Loại bỏ hoàn toàn sự đơn điệu của việc zoom in/out lặp lại.
4. **Giữ màn hình luôn sáng (`PresentationWakeLock`):**
   - Tích hợp Screen Wake Lock API (`navigator.wakeLock.request('screen')`).
   - Tự động kích hoạt khi bắt đầu trình chiếu, duy trì xuyên suốt bộ phim và cả trong trạng thái `FINAL_HOLD`.
   - Tự động xin lại quyền khi người dùng chuyển tab và quay trở lại (`visibilitychange`).
   - Tự động giải phóng khi thoát Stage Mode.
5. **Lời Cảm Ơn nổi bật nhất phần kết:**
   - Nền sáng ivory/champagne, typography thanh lịch nhìn rõ từ xa trên màn hình LED.
6. **Lưu trữ ảnh bền vững (IndexedDB & ZIP):**
   - Lưu trữ Blob nhị phân thực tế, tự động cấp phát và phục hồi URL sau mỗi lần reload, xuất/nhập ZIP hoàn chỉnh.

---

## 5. Kết Quả Kiểm Thử Tự Động (Vitest) & Build Production

### 5.1. Kết Quả Test Vitest (100% Pass)
```bash
✓ src/player/__tests__/wakeLock.test.ts (3 tests)
✓ src/player/__tests__/playbackClock.test.ts (4 tests)
✓ src/transitions/__tests__/transitions.test.ts (2 tests)
✓ src/media/__tests__/mediaManager.test.ts (2 tests)
✓ src/timeline/__tests__/compiler.test.ts (4 tests)
✓ src/timeline/__tests__/compilerV3.test.ts (5 tests)

Test Files  6 passed (6)
Tests       20 passed (20)
Duration    236ms
```

### 5.2. Kết Quả Build Production
```bash
> tsc -b && vite build
✓ 1974 modules transformed.
dist/index.html                   1.64 kB │ gzip:   0.90 kB
dist/assets/index-C2Dp92EH.css   58.54 kB │ gzip:  10.33 kB
dist/assets/index-cE6hmQwn.js   640.80 kB │ gzip: 196.27 kB
✓ built in 271ms
```

---

## 6. Hướng Dẫn Khởi Chạy & Triển Khai (Deploy)

### Chạy Local Development:
```bash
npm install
npm run dev
# Mở trình duyệt tại http://localhost:5173/
```

### Phím Tắt Khi Trình Chiếu (Stage Mode):
- `Space`: Tạm dừng / Tiếp tục phát
- `Mũi tên phải`: Chuyển sang chương tiếp theo
- `Mũi tên trái`: Quay lại chương trước
- `F`: Bật / Tắt toàn màn hình (Fullscreen)
- `M`: Bật / Tắt âm thanh (Mute/Unmute)
- `R`: Xem lại từ đầu (Restart)
- `Esc`: Thoát chế độ trình chiếu về Studio

### Triển Khai Lên Netlify:
Dự án đã được cấu hình sẵn tệp `netlify.toml` và `public/_redirects`:
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Redirects:** Đã cấu hình `/* /index.html 200` hỗ trợ Single Page Application định tuyến mượt mà.
