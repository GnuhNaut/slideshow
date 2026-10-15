# BÁO CÁO CÁC LỖI ĐÃ XỬ LÝ TRIỆT ĐỂ (FIXED ISSUES REPORT)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI
**Phiên bản:** V3.2.1 — Release Candidate

---

## 1. DANH SÁCH LỖI P0 ĐÃ KHẮC PHỤC TRIỆT ĐỂ

### 1. P0-01 — Scene Lifecycle & Frame-Accurate Transitions
- **Tệp thay đổi:** `src/transitions/TransitionDirector.ts`, `src/scenes/SceneRenderer.tsx`, `src/motion/MotionRuntime.ts`
- **Nguyên nhân gốc:** `SceneRenderer` phụ thuộc vào throttled clock 10Hz mà không có cơ chế tiền trạm. Khi thời gian chạm mốc $T$, incoming scene mới bắt đầu được mount, gây nguy cơ giật hoặc khựng 1 khung hình.
- **Giải pháp triệt để:**
  - Thiết lập cửa sổ đón đầu `TRANSITION_LOOKAHEAD_WINDOW = 0.4s` (400ms) trong `computeTransitionState`.
  - Tự động nhận diện `upcomingScene` và kích hoạt bề mặt tiền xử lý vô hình (`pointer-events-none opacity-0`) trong `SceneRenderer` để React mount component và khởi tạo DOM trước.
  - Tự động gọi `Image.decode()` đón đầu cho toàn bộ ảnh của scene sắp đến.
  - Đồng bộ `MotionRuntime` để cung cấp `upcomingScene` và `isPrepared` đồng nhất trên từng frame RAF 60Hz.

### 2. P0-02 — Filmstrip Wrap & Virtual Window Synchronization
- **Tệp thay đổi:** `src/scenes/filmstripMath.ts` (mới), `src/scenes/FilmRollScene.tsx`
- **Nguyên nhân gốc:** Biến đổi CSS `translate3d` cập nhật tức thì trên RAF trong khi `visibleItems` chỉ cập nhật sau ngưỡng 160px. Cú nhảy modulo hoặc seek khiến danh sách ảnh bị trễ 1 nhịp so với vị trí camera. Đồng thời `loading="lazy"` khiến ảnh chưa kịp giải mã khi dải phim lướt nhanh.
- **Giải pháp triệt để:**
  - Tách toàn bộ toán học tọa độ thành các hàm thuần túy độc lập trong `filmstripMath.ts`: `getTrackPosition`, `calculateItemDimensions`, `calculateCumulativeOffsets`, `getVisibleItems`, `getRequiredMediaIds`.
  - Nhận diện tức thì cú nhảy modulo hoặc thao tác tua thời gian (`Math.abs(currentTime - lastTime) > 0.25s`) để cập nhật ngay lập tức `virtualCameraX`.
  - Mở rộng vùng đệm buffer lên `Math.max(1200, containerWidth * 0.7)` đảm bảo ảnh 2 đầu luôn có sẵn trong DOM ngay cả khi vừa wrap qua mép.
  - Loại bỏ hoàn toàn `loading="lazy"`, thay bằng `loading="eager"` kết hợp `decoding="async"` và vòng lặp `Image.decode()` chạy ngầm.
  - Bổ sung fallback hiển thị tao nhã nếu ảnh hỏng, ngăn ngừa crash màn hình chiếu.

### 3. P0-03 — Optimize Split Curtain Without Duplicating Heavy Scenes
- **Tệp thay đổi:** `src/transitions/curtainSnapshot.ts` (mới), `src/transitions/StaticCurtainSurface.tsx` (mới), `src/transitions/SceneCompositor.tsx`, `src/scenes/SceneRenderer.tsx`
- **Nguyên nhân gốc:** Trong `GRAND_WEDDING_CURTAIN_REVEAL`, `{outgoingSceneNode || activeSceneNode}` được truyền vào cả 2 cánh rèm cửa trái/phải, làm React mount 2 cây component Chương 5 độc lập với 2 bộ GSAP timeline song song.
- **Giải pháp triệt để:**
  - Xây dựng module `curtainSnapshot.ts`: tự động tạo snapshot canvas 1080p sắc nét cho outgoing scene trong bộ nhớ đệm trước khi rèm mở.
  - Tạo component tĩnh `StaticCurtainSurface.tsx`: hiển thị snapshot texture hoặc layout ảnh tĩnh với **0 GSAP listeners, 0 animation loops, 0 subscription**.
  - Hai cánh rèm 3D tiếp tục chuyển động quay đa chiều (`rotationY: -ease * 18` và `rotationY: ease * 18`) với viền vàng Champagne `#C5A16E` sang trọng, nhưng chỉ chứa 1 thẻ texture tĩnh.
  - Cơ chế `releaseCurtainSnapshot()` thu hồi toàn bộ canvas và giải phóng bộ nhớ ngay khi rèm mở xong.

### 4. P0-04 — Atomic ZIP Import & Staging Rollback
- **Tệp thay đổi:** `src/project/exportImport.ts`, `src/app/store.ts`
- **Nguyên nhân gốc:** Hàm import cũ ghi trực tiếp từng tệp nhị phân vào IndexedDB mà không có transaction bảo vệ; lỗi quota hoặc file hỏng giữa chừng gây tình trạng dự án dở dang và dữ liệu rác.
- **Giải pháp triệt để:**
  - Thiết kế quy trình 5 giai đoạn nghiêm ngặt:
    1. **Prepare:** Đọc ZIP, kiểm tra `manifest.json`, xác thực schema dự án qua `validateProjectSchema`. Kiểm tra tệp binary tồn tại trước khi chạm vào bộ nhớ máy.
    2. **Stage:** Nạp toàn bộ blob ảnh/nhạc vào bộ đệm RAM tạm thời `stagedMediaRecords`. Biên dịch thử timeline `compileProjectTimeline` để xác minh mọi cảnh hợp lệ.
    3. **Commit:** Sử dụng `db.transaction('rw', [db.projects, db.media], ...)` của Dexie. Toàn bộ media và project được lưu nguyên tử: hoặc thành công 100%, hoặc tự động hủy bỏ không lưu bất kỳ thay đổi nào.
    4. **Activate:** Tạm dừng phát cũ, khởi tạo tracked object URLs từ blob đã commit, cập nhật `motionRuntime`, reset clock về 0 và cập nhật store Zustand.
    5. **Rollback:** Nếu có bất kỳ lỗi nào ở giai đoạn 1, 2, 3, dự án cũ trong cơ sở dữ liệu và giao diện hoàn toàn không bị thay đổi.
