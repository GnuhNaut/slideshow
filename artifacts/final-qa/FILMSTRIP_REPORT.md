# BÁO CÁO ĐỒNG BỘ CUỘN PHIM 35MM (FILMSTRIP SYNCHRONIZATION REPORT)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI  
**Phiên bản:** V3.2.2 — Release Candidate  

---

## 1. THUẬT TOÁN ĐỒNG BỘ KHUNG HÌNH VÀ TỌA ĐỘ ẢO
- **Mô đun toán học thuần túy:** `src/scenes/filmstripMath.ts`
  - `getTrackPosition(time, speed, loopWidth, direction)`: Tính toán độ dịch chuyển wrap modulo liên tục, đơn điệu hóa hoàn toàn tọa độ `cameraX`.
  - `calculateCumulativeOffsets`: Lập bảng tra cứu $O(1)$ cho vị trí từng frame ảnh dọc theo dải phim.
  - `getVisibleItems`: Cắt lát cửa sổ ảo trong khoảng $[cameraX - buffer, cameraX + viewport + buffer]$.
- **Khử độ trễ khởi động:** `initialCameraX` được tính toán trực tiếp từ frame đầu tiên, tránh độ trễ 1 nhịp 160px.
- **Giới hạn số DOM Image Elements:**
  - Với 10 ảnh: 8–12 thẻ ảnh trong DOM.
  - Với 100 ảnh: 12–16 thẻ ảnh trong DOM (tối đa không bao giờ vượt quá 24 thẻ).
  - Không bao giờ mount hàng trăm thẻ `<img>` vào cây DOM.
- **Bộ nhớ đệm giải mã (Decode Cache):**
  - Cài đặt `decodedUrlsRef` dạng Set giới hạn tối đa 200 items.
  - Ngăn chặn việc liên tục gọi `new Image()` trùng lặp cho cùng một URL khi danh sách `visibleItems` thay đổi theo từng pixel cuộn.
