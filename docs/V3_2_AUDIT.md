# WEDDING FILM STORY V3.2 — COMPREHENSIVE CODE & ARCHITECTURE AUDIT
**Tuấn Hùng & Sao Mai — 19/10/2026**
*Tác giả: Principal React Engineer & GSAP Motion Specialist*

---

## 1. MỤC TIÊU AUDIT
Thực hiện rà soát chuyên sâu toàn bộ mã nguồn V3.1 để phát hiện và xử lý tận gốc mọi rủi ro kỹ thuật, đảm bảo không có bất kỳ regression nào trong phiên bản V3.2.

---

## 2. BẢNG PHÂN LOẠI & PHÂN TÍCH LỖI GỐC (ROOT CAUSES)

### Lỗi 01: Lệch hệ tọa độ LTR / RTL trong VirtualizedFilmTrack
- **File ảnh hưởng:** `src/scenes/FilmRollScene.tsx`
- **Nguyên nhân gốc:** Khi cuộn theo chiều LTR (`direction === 'ltr'`), `translateX` được tính là `wrappedOffset - singleLoopWidth`. Tuy nhiên, cửa sổ ảo `minX` và `maxX` lại được tính dựa trên `virtualBaseOffset = wrappedOffset` (vốn là hệ tọa độ của RTL).
- **Hậu quả:** Reel B (băng phim dưới chạy LTR trong dual-track) bị chọn sai danh sách ảnh trong cửa sổ hiển thị, gây trống ảnh hoặc nhảy frame khi xem dải phim ngược chiều.
- **Cách sửa:** Thống nhất hệ quy chiếu bất biến (Coordinate Invariant): Vị trí màn hình $X_{\text{screen}} = X_{\text{world}} + T$. Do đó, vùng nhìn thấy bất biến luôn là `minX = -T - buffer` và `maxX = -T + containerWidth + buffer` cho cả hai chiều RTL và LTR.
- **Regression Test:** Bổ sung test case kiểm tra cả RTL và LTR trong `src/scenes/__tests__/filmVirtualization.test.ts`.

---

### Lỗi 02: Trùng lặp & có nguy cơ mâu thuẫn giữa `MotionRuntime` và `TransitionDirector`
- **File ảnh hưởng:** `src/motion/MotionRuntime.ts`, `src/transitions/TransitionDirector.ts`
- **Nguyên nhân gốc:** Cả hai file đều tự cài đặt logic tìm `currentIndex`, `transDuration`, `outgoingSceneProgress` và `incomingSceneProgress`. Khi có điều chỉnh timing ở một file, file kia có thể cho kết quả khác biệt, gây lệch trạng thái giữa Stage và Compositor.
- **Cách sửa:** Chuyển `computeTransitionState(scenes, currentTime)` thành single source of truth cho transition logic. `MotionRuntime.computeState` gọi trực tiếp `computeTransitionState` và gắn thêm thông tin clock status.
- **Regression Test:** `src/motion/__tests__/motionRuntime.test.ts` kiểm thử tính nhất quán giữa hai module.

---

### Lỗi 03: Chuyển chương `GRAND_WEDDING_CURTAIN_REVEAL` chưa tách ảnh thật sang hai bên
- **File ảnh hưởng:** `src/transitions/SceneCompositor.tsx`
- **Nguyên nhân gốc:** Hiệu ứng trước đây chỉ áp dụng `scale` và `opacity` trên container chung của outgoing scene, chưa thực sự tách ảnh cưới thành hai cánh rèm mở sang trái và phải như thiết kế sân khấu.
- **Cách sửa:** Xây dựng cấu trúc True Split Curtain trong `SceneCompositor`: chia outgoing scene thành hai nửa (trái 0–50% và phải 50–100%). Khi transition tiến triển, nửa trái trượt sang trái (`x: -ease * 105%`, `rotateY: -ease * 20deg`), nửa phải trượt sang phải (`x: ease * 105%`, `rotateY: ease * 20deg`), hé mở trung tâm `LỜI CẢM ƠN` đang dâng lên từ từ.
- **Regression Test:** Kiểm tra chuyển cảnh bằng frame captures và Playwright browser QA.

---

### Lỗi 04: Chuyển động `FX12_GrandThankYouReveal` phụ thuộc React prop `progress` 10Hz
- **File ảnh hưởng:** `src/effects/FX12_GrandThankYouReveal.tsx`, `src/scenes/ThankYouScene.tsx`
- **Nguyên nhân gốc:** `FX12` sử dụng `useEffect([progress])` để cập nhật GSAP transforms cho hai ảnh flanking và chữ trung tâm. Vì `progress` truyền từ React props chỉ cập nhật theo chu kỳ 10Hz của Zustand, hiệu ứng rèm mở của màn Cảm ơn bị giật từng nấc 100ms.
- **Cách sửa:** Đăng ký trực tiếp `masterClock.onFrame` (60 FPS) bên trong component để nội suy chuyển động mượt mà liên tục trên DOM refs, dùng prop `progress` làm fallback khi pause/seek.
- **Regression Test:** Chạy kiểm thử RAF frame interval trên màn cảm ơn.

---

### Lỗi 05: Import ZIP chưa đồng bộ nguyên tử (Atomic Project Replacement)
- **File ảnh hưởng:** `src/App.tsx`, `src/app/store.ts`
- **Nguyên nhân gốc:** Trong `App.tsx`, sau khi `importProjectZip` hoàn tất, code chỉ gọi `useWeddingStore.setState({ project: importedProject })` mà không biên dịch lại timeline, không khởi tạo lại master clock duration, và không cập nhật `motionRuntime.setScenes`.
- **Hậu quả:** Ứng dụng hiển thị tên dự án mới nhưng vẫn phát theo timeline và số lượng scene của dự án cũ.
- **Cách sửa:** Xây dựng action nguyên tử `replaceProject(importedProject)` trong `store.ts` thực hiện đồng thời: phục hồi media blobs, compile timeline mới, thiết lập lại master clock, đồng bộ MotionRuntime và ghi đè IndexedDB an toàn.
- **Regression Test:** Test case TC-35 trong Acceptance Matrix.

---

### Lỗi 06: Chuỗi `await` tuần tự làm mất transient user activation khi bắt đầu trình chiếu
- **File ảnh hưởng:** `src/components/player/StagePlayer.tsx`
- **Nguyên nhân gốc:** Trong `handleStartPresentation`, `await containerRef.current.requestFullscreen()` được thực hiện trước `await audioEngine.unlock()`. Nếu fullscreen mất vài trăm mili-giây, user gesture token của trình duyệt có thể hết hạn, khiến audio unlock bị từ chối trên Safari / Chrome.
- **Cách sửa:** Khởi động đồng thời cả hai promise `requestFullscreen` và `audioEngine.unlock()` trong cùng micro-tick của cử chỉ người dùng trực tiếp, xử lý lỗi độc lập cho từng nhánh (fault-tolerant).
- **Regression Test:** TC-27, TC-28, TC-29.

---

## 3. KẾT LUẬN AUDIT
Cả 6 nhóm lỗi gốc trên đã được định vị chính xác mã nguồn và thiết kế phương án khắc phục triệt để trong các Phase tiếp theo. Mã nguồn V3.2 sẽ đạt chuẩn zero-regression.
