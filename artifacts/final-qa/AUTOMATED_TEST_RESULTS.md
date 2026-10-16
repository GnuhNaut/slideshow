# BÁO CÁO KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST RESULTS)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI  
**Phiên bản:** V3.2.2 — Release Candidate  
**Lệnh thực thi:** `npm run qa:final` hoặc `npx vitest run`  
**Kết quả tổng thể:** **90 / 90 TESTS PASS (100%)**  

---

## 1. DANH SÁCH TEST SUITES (12 / 12 PASSED)

| STT | File Test Suite | Số Test | Thời gian | Trạng thái |
| :---: | :--- | :---: | :---: | :---: |
| 1 | `src/timeline/__tests__/regressionV3_2_2.test.ts` (TC-71 đến TC-90) | 20 | 66ms | **PASS** |
| 2 | `src/timeline/__tests__/regressionHotfix.test.ts` (TC-HOTFIX-01 đến 10) | 10 | 21ms | **PASS** |
| 3 | `src/timeline/__tests__/regressionV3_2_1.test.ts` (TC-41 đến TC-60) | 19 | 8ms | **PASS** |
| 4 | `src/timeline/__tests__/acceptanceV3_2.test.ts` (TC-01 đến TC-40) | 12 | 20ms | **PASS** |
| 5 | `src/scenes/__tests__/filmVirtualization.test.ts` | 6 | 4ms | **PASS** |
| 6 | `src/timeline/__tests__/compilerV3.test.ts` | 5 | 10ms | **PASS** |
| 7 | `src/timeline/__tests__/compiler.test.ts` | 4 | 11ms | **PASS** |
| 8 | `src/player/__tests__/playbackClock.test.ts` | 4 | 4ms | **PASS** |
| 9 | `src/motion/__tests__/motionRuntime.test.ts` | 3 | 4ms | **PASS** |
| 10 | `src/player/__tests__/wakeLock.test.ts` | 3 | 5ms | **PASS** |
| 11 | `src/transitions/__tests__/transitions.test.ts` | 2 | 3ms | **PASS** |
| 12 | `src/media/__tests__/mediaManager.test.ts` | 2 | 4ms | **PASS** |

**Tổng cộng:** **90 tests passed across 12 files** trong thời gian ~350ms.

---

## 2. CHI TIẾT 20 CA KIỂM ĐỊNH MỚI V3.2.2 (TC-71 ĐẾN TC-90)

- **TC-71: Split Curtain không mount 2 instance outgoing scene nặng:**  
  *Kết quả:* PASS. Compositor sử dụng `CurtainSurface` tĩnh thay vì mount 2 cây React nặng của `LivingCollageScene`.
- **TC-72: Khung hình outgoing tại 0% transition khớp frame ngay trước đó:**  
  *Kết quả:* PASS. `outgoingSceneProgress` tính toán chính xác, các thẻ ảnh định vị chuẩn xác tại ranh giới transition.
- **TC-73: Pause/seek giữa Split Curtain không làm hai nửa lệch hình:**  
  *Kết quả:* PASS. Cả hai cánh rèm tính toán từ cùng một `outgoingSceneProgress`, tỷ lệ đối xứng tuyệt đối.
- **TC-74: Split Curtain không leak GSAP listeners sau 20 lần seek:**  
  *Kết quả:* PASS. Toàn bộ unsubscriptions được giải phóng sạch sẽ.
- **TC-75: Export ZIP khi thiếu một ảnh phải FAIL và thông báo lỗi rõ:**  
  *Kết quả:* PASS. Báo lỗi `Không thể xuất ZIP: Thiếu hoặc hỏng file nhị phân ảnh cho...` và dừng tiến trình.
- **TC-76: Export ZIP khi thiếu một track nhạc phải FAIL và thông báo lỗi rõ:**  
  *Kết quả:* PASS. Báo lỗi `Không thể xuất ZIP: Thiếu hoặc hỏng file nhị phân âm thanh cho...` và dừng tiến trình.
- **TC-77: ZIP xuất thành công chứa đủ 100% media và manifest có mediaEntries:**  
  *Kết quả:* PASS. File zip tạo ra có đầy đủ `manifest.json`, `project.json`, thư mục `media/`, `audio/` và mảng `mediaEntries`.
- **TC-78: ZIP tự xuất có thể import trở lại mà không thiếu file:**  
  *Kết quả:* PASS. Import trơn tru, nạp đủ các chương và nhạc.
- **TC-79: Ảnh nhập từ ZIP phục hồi live URL sau reload:**  
  *Kết quả:* PASS. `restoreProjectMedia` đọc thành công từ `db.media`.
- **TC-80: Nhạc nhập từ ZIP phục hồi live URL sau reload:**  
  *Kết quả:* PASS. `restoreProjectMedia` đọc thành công từ `db.audio`.
- **TC-81: Thumbnail không bị lưu URL chết sau F5 reload:**  
  *Kết quả:* PASS. Mọi URL blob cũ đều được làm mới bằng live tracked URL.
- **TC-82: Thumbnail phục hồi sạch sẽ không làm mất metadata:**  
  *Kết quả:* PASS. Giữ nguyên focalPoint, aspectRatio và orderIndex.
- **TC-83: Thu hồi tracked URLs không gây rò rỉ RAM:**  
  *Kết quả:* PASS. `mediaManager.revokeAll()` thu hồi toàn bộ `URL.revokeObjectURL`.
- **TC-84: Cuộn phim không có frame trắng tại điểm wrap/seek:**  
  *Kết quả:* PASS. Tọa độ tính toán liên tục, không vượt ngưỡng loop.
- **TC-85: Lookahead decode ảnh lỗi không gây crash promise:**  
  *Kết quả:* PASS. Xử lý catch ngoại lệ độc lập.
- **TC-86: Cầu hôn 1 ảnh cô đọng đúng 5.5 giây:**  
  *Kết quả:* PASS. Scene biên dịch đạt chuẩn thời lượng 5.5s.
- **TC-87: Tiêu đề và thông điệp cảm ơn hiển thị chuẩn xác:**  
  *Kết quả:* PASS. Chương 6 biên dịch đầy đủ nội dung tri ân.
- **TC-88: FinalHold duy trì Wake Lock đến khi thoát Stage:**  
  *Kết quả:* PASS. `presentationWakeLock` duy trì cho đến khi unmount.
- **TC-89: Timeline 7 chương phủ kín thời gian liên tục:**  
  *Kết quả:* PASS. Mọi mốc thời gian nối tiếp nhau chính xác, không có khoảng hở.
- **TC-90: AudioEngine hỗ trợ stop/pause an toàn:**  
  *Kết quả:* PASS. Gọi `audioEngine.stop()` không phát sinh lỗi.
