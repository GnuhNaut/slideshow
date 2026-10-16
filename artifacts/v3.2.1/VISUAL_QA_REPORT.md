# BÁO CÁO THẨM MỸ VÀ TRẢI NGHIỆM THỊ GIÁC V3.2.1 (HOTFIX VISUAL QA REPORT)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI  
**Phiên bản:** V3.2.1 — Release Candidate Critical Hotfix  
**Ngày thực hiện:** 16/10/2026  

---

## 1. ĐÁNH GIÁ CHẤT LƯỢNG MỸ THUẬT VÀ TÍNH LIÊN TỤC HÌNH ẢNH (VISUAL CONTINUITY)

### 1.1. Grand Wedding Curtain Reveal (Chương 5 $\to$ Chương 6)
- **Tính liên tục tại 0%:**
  - Khung hình tại thời điểm bắt đầu mở rèm ($p = 0\%$) khớp chính xác $100\%$ với khung hình đang hiển thị của Chương 5 ngay trước đó.
  - Không còn hiện tượng tự ý sắp xếp lại 4 ảnh, không bị co giãn méo hình dạng ảnh chân dung hay ảnh phong cảnh ngang.
  - Tỷ lệ khung hình và tâm điểm (focal point) được giữ vững tuyệt đối.
- **Quá trình mở rèm (25% - 50% - 75%):**
  - Hai cánh rèm quay 3D êm ả quanh hai trục bản lề ngoài cùng với bóng đổ sâu và viền Champagne Gold `#D4AF37`.
  - Không có hiện tượng giật hình hoặc flash khi texture sẵn sàng; khung hình được đóng băng sạch sẽ với `isPlaying={false}`.
- **Tiếp quản Chương 6 (Lời Cảm Ơn):**
  - Sau khi rèm mở hết, Chương 6 lộ diện trang trọng, tiêu đề tri ân nổi bật và rõ ràng trên mọi màn hình độ phân giải cao.

### 1.2. Cuộn phim 35mm (Chương 2)
- Thuật toán `initialCameraX` loại bỏ hoàn toàn độ trễ 1 khung hình lúc bắt đầu.
- Bộ nhớ đệm giải mã `decodedUrlsRef` (tối đa 200 ảnh) ngăn ngừa tạo mới `Image()` liên tục, bảo đảm không có blank frame dù cuộn nhanh hay tua thời gian.

---

## 2. MINH CHỨNG THỊ GIÁC THỰC TẾ (REAL BROWSER ARTIFACTS)

Dưới đây là các ảnh chụp thực tế và video ghi hình phiên chạy trên trình duyệt Chromium thực nghiệm:

- **Video toàn bộ phiên kiểm tra trực tiếp (Visual Continuity & ZIP Export/Import):**  
  `artifacts/v3.2.1/curtain_and_export_qa.webp`
- **Màn hình Trang chủ (Home Page):**  
  `artifacts/v3.2.1/home_page_hotfix.png`
- **Giao diện Studio Biên tập (Đầy đủ 7 chương & Nút Xuất ZIP):**  
  `artifacts/v3.2.1/studio_hotfix.png`
- **Màn hình Chuẩn bị phát (Pre-show Ready Gate):**  
  `artifacts/v3.2.1/stage_gate_hotfix.png`
- **Màn hình Chương 5 — Album Ảnh Cưới (Ngay trước ranh giới chuyển rèm):**  
  `artifacts/v3.2.1/chapter_5_hotfix.png`
- **Màn hình Grand Wedding Curtain Reveal (Mở rèm 3D bảo toàn hình học):**  
  `artifacts/v3.2.1/curtain_transition_hotfix.png`
- **Màn hình Chương 6 — Lời Cảm Ơn (Tri ân quan khách trang trọng):**  
  `artifacts/v3.2.1/chapter_6_hotfix.png`
