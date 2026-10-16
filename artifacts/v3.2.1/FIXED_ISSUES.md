# BÁO CÁO CÁC LỖI ĐÃ XỬ LÝ TRIỆT ĐỂ (CRITICAL HOTFIX REPORT)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI  
**Phiên bản:** V3.2.1 — Release Candidate Critical Hotfix  
**Commit cơ sở:** `7ae3225` | **Nhánh làm việc:** `v3.2.1-critical-hotfix`  
**Ngày thực hiện:** 16/10/2026  

---

## 1. TỔNG QUAN HOTFIX
Bản hotfix này xử lý dứt điểm các vấn đề then chốt về **Visual Continuity**, **Lưu trữ âm thanh bền vững (Audio Persistence)** và **Kiểm soát tính toàn vẹn dữ liệu ZIP (Media Integrity)** trước khi bàn giao và nghiệm thu thực tế cho lễ cưới.

---

## 2. CHI TIẾT CÁC LỖI P0 ĐÃ KHẮC PHỤC TRIỆT ĐỂ

### 1. P0-01 — Sửa Snapshot của Grand Wedding Curtain Reveal (Visual Continuity)
- **Tệp thay đổi:**
  - `src/transitions/SceneCompositor.tsx`
  - `src/scenes/SceneRenderer.tsx`
  - Xóa bỏ: `src/transitions/curtainSnapshot.ts`, `src/transitions/StaticCurtainSurface.tsx`
- **Nguyên nhân gốc:**
  - `generateCurtainSnapshot()` trước đó tạo một canvas 1080p nhân tạo, tự ý bốc tối đa 4 ảnh đầu trong scene và xếp thành một bố cục độc lập không liên quan đến khung hình đang chạy của Chương 5 (Album Ảnh Cưới).
  - Hậu quả: Tại thời điểm $p = 0\%$, màn hình bị giật/nhảy ảnh đột ngột, ảnh bị co giãn méo tỷ lệ, khuôn mặt bị cắt, và có độ trễ tạo texture gây hiện tượng flash khi rèm bắt đầu mở.
- **Giải pháp triệt để:**
  - Loại bỏ hoàn toàn phương pháp chụp snapshot canvas nhân tạo và tệp `StaticCurtainSurface.tsx`.
  - Trong `SceneCompositor.tsx`, hai cánh rèm (trái & phải) trực tiếp chứa khung hình outgoing scene thật (`outgoingSceneNode`), được đóng băng chuyển động hoàn toàn thông qua cờ `isPlaying={false}` trong `SceneRenderer.tsx`.
  - Cánh rèm trái hiển thị chính xác nửa trái $[0\%, 50\%]$ với `overflow-hidden` và `w-[200%]`. Cánh rèm phải hiển thị chính xác nửa phải $[50\%, 100\%]$ với `ml-[-100%]`.
  - Hiệu ứng rèm mở 3D chân thực bằng GSAP quay quanh trục bản lề (`transformOrigin: 'left center'` và `transformOrigin: 'right center'`), kết hợp đường viền vàng ánh kim Champagne Luxe `#D4AF37` và dải bóng đổ sang trọng.
- **Kết quả nghiệm thu:**
  - Khung hình tại $0\%$ khớp $100.00\%$ hình học, nội dung và vị trí ảnh của outgoing scene ngay trước khi mở rèm.
  - Tỷ lệ khung hình và focal point được bảo toàn tuyệt đối, không co méo, không cắt mặt.
  - Zero độ trễ, không flash, không chiếm dụng bộ nhớ RAM cho Data URL 1080p.

---

### 2. P0-02 — Nhạc Nhập Từ ZIP Phải Lưu Bền Vững (Persistent Audio in IndexedDB)
- **Tệp thay đổi:**
  - `src/types/project.ts`: Bổ sung thuộc tính `mediaId?: string` cho interface `AudioTrack`.
  - `src/media/mediaManager.ts`: Cập nhật `restoreProjectMedia` khôi phục audio blobs từ `db.audio` thành tracked object URLs khi tải lại trang; thêm hàm `saveAudioFile`.
  - `src/project/exportImport.ts`:
    - `exportProjectZip`: Đọc nhị phân trực tiếp từ `db.audio` theo `mediaId` để đóng gói vào thư mục `audio/`.
    - `importProjectZip`: Tạo `mediaId` ổn định, đóng gói `stagedAudioRecords` và ghi bền vững vào bảng `db.audio` trong transaction nguyên tử của Dexie.
- **Nguyên nhân gốc:**
  - Trong quy trình import trước đây, binary âm thanh chỉ được tạo thành blob URL tạm thời trong RAM mà không lưu nhị phân vào IndexedDB `db.audio`. Khi người dùng F5 hoặc mở lại trình duyệt, blob URL bị vô hiệu dẫn đến mất nhạc.
- **Giải pháp triệt để:**
  - Mỗi bản nhạc nhập từ ZIP được cấp một `mediaId` cố định (ví dụ `audio_import_...`).
  - Binary được ghi bền vững vào bảng `db.audio` của IndexedDB trước khi báo import thành công.
  - Khi F5 / reload trang, `restoreProjectMedia` đọc từ `db.audio` để tái tạo tracked object URLs.
  - Khi không dùng nữa hoặc import dự án mới, các URLs cũ được thu hồi tự động qua `mediaManager.revokeTrackedUrls()`.

---

### 3. P0-03 — Không Được Báo Import Thành Công Khi Thiếu Media (Zero Tolerance)
- **Tệp thay đổi:**
  - `src/project/exportImport.ts`: Nâng cấp hàm `validateProjectSchema` và hàm `importProjectZip`.
- **Nguyên nhân gốc:**
  - Khi gặp ảnh hoặc nhạc không tồn tại trong file ZIP, hàm import cũ chỉ gọi `console.warn` rồi tiếp tục import dự án thiếu dữ liệu, để lại các đường dẫn gãy `media/...`.
- **Giải pháp triệt để:**
  - Bổ sung xác thực cấu trúc sâu `validateProjectSchema`: kiểm tra bắt buộc `id`, `title`, mảng `chapters`, `chapterIndex`, mảng `photos` (có `id` và `url`), cùng mảng `audioTracks`.
  - Kiểm tra phiên bản manifest hợp lệ (hỗ trợ `1.0.0`, `2.0.0`, `3.0.0`, `3.2.0`, `3.2.1`).
  - **Zero Tolerance Pre-scan:** Quét toàn bộ danh sách ảnh và nhạc tham chiếu trong project. Nếu thiếu bất kỳ file nào trong thư mục `media/` hoặc `audio/`, hoặc file có kích thước 0 byte (hỏng), quá trình dừng ngay lập tức và ném lỗi rõ ràng (`File ZIP bị thiếu ... tệp phương tiện bắt buộc`).
  - Quy trình Commit nguyên tử bằng Dexie Transaction: nếu có lỗi, tự động rollback, bảo đảm không làm hỏng hay mất dự án đang chạy.

---

## 3. CHI TIẾT CÁC TỐI ƯU P1 ĐÃ KHẮC PHỤC

### 1. P1-04 — Filmstrip Frame Synchronization & Decode Cache
- **Tệp thay đổi:** `src/scenes/FilmRollScene.tsx`
- **Tối ưu:**
  - Tính toán `initialCameraX` ngay từ frame render đầu tiên để tránh độ trễ 1 khung hình.
  - Thiết lập bộ nhớ đệm giải mã `decodedUrlsRef` với giới hạn tối đa 200 mục, ngăn ngừa việc gọi `new Image()` trùng lặp liên tục khi danh sách `visibleItems` thay đổi trong lúc cuộn.
  - Đồng bộ tức thì `virtualCameraX` khi seek hoặc wrap dải phim, không để xuất hiện khoảng trống (blank frame).

### 2. P1-05 — Scene Prewarm Isolation & Freeze Outgoing Scene
- **Tệp thay đổi:** `src/scenes/SceneRenderer.tsx`
- **Tối ưu:**
  - Vùng prewarm ẩn được khóa hoàn toàn tương tác (`pointer-events-none opacity-0`) với cờ `isPrewarming={true}` để ngăn chạy âm thanh hoặc loop hoạt họa ngầm.
  - Outgoing scene khi chuyển cảnh được truyền cờ `isPlaying={false}` nhằm đóng băng trạng thái hiển thị, giảm tải CPU/GPU và đảm bảo visual continuity ổn định.

---

## 4. KẾT QUẢ KIỂM THỬ TỔNG THỂ
- **Vitest Unit & Regression Tests:** 11/11 files passed, **70/70 tests passed** (100%).
  - Bổ sung bộ test mới `src/timeline/__tests__/regressionHotfix.test.ts` (10 tests) chuyên trách cho P0-01, P0-02, P0-03.
- **TypeScript & Production Build:** `tsc -b && vite build` hoàn thành với **0 lỗi**, bundle sạch 653.75 kB (gzip 199.65 kB).
- **Browser Visual QA:** Ghi hình và chụp ảnh thực tế qua trình duyệt Chromium:
  - Landing Home Page hiển thị chuẩn sắc nét.
  - Studio timeline đầy đủ 7 chương, tính năng Xuất ZIP tải về thành công.
  - Stage Presentation: Grand Wedding Curtain Reveal tách đôi mượt mà, rèm mở lộ diện Chương 6 trang trọng.
