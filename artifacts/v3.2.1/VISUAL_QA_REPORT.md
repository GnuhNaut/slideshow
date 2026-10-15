# BÁO CÁO THẨM MỸ VÀ TRẢI NGHIỆM THỊ GIÁC V3.2.1 (VISUAL QA REPORT)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI
**Phiên bản:** V3.2.1 — Release Candidate

---

## 1. ĐÁNH GIÁ CHẤT LƯỢNG MỸ THUẬT TỪNG PHÂN CẢNH

### 1.1. Chương 1 — Lời Mở Đầu (Film Intro)
- **Tông màu:** Nền ngà ấm Warm Ivory `#FFF9F2`, ánh kim Champagne dịu dàng.
- **Typography:** Tên cô dâu chú rể "Tuấn Hùng & Sao Mai" hiển thị trang trọng bằng font Cormorant Garamond / Playfair Display kết hợp font chân phương, kích thước đủ lớn để khách mời từ khoảng cách 10m trên màn LED đọc rõ.
- **Chuyển động:** Mở màn nhẹ nhàng, không tối u ám, không chèn chữ kỹ thuật.

### 1.2. Chương 2 — Cuộn Phim Kỷ Niệm (35mm Memories)
- **Cảm giác điện ảnh:** Hai rãnh lỗ răng phim (film sprocket holes) chân thực ở 2 mép trên/dưới.
- **Tốc độ lướt:** Tốc độ 55–60px/s êm đềm, tạo cảm giác như ngắm nhìn những kỷ vật thời gian.
- **Ảnh:** Khung ảnh trắng viền vàng champagne luxury, nhãn chân trang tối giản `35MM • TUẤN HÙNG & SAO MAI`. Hoàn toàn không còn hiện tượng chớp trắng nhờ cơ chế eager async decode.

### 1.3. Chương 3 — Khoảnh Khắc Cầu Hôn (Proposal Moment)
- **Điểm nhấn Hero:** Bức ảnh cầu hôn được phóng to trang trọng giữa không gian 3D.
- **Thời lượng:** Nếu chỉ có 1 ảnh duy nhất, thời lượng chuẩn xác đúng 5.5 giây, nhịp phim cô đọng, giàu cảm xúc mà không bị kéo dài lê thê.

### 1.4. Chương 4 — Ngày Dạm Ngõ (Family Album)
- **Bảo toàn gương mặt:** Bố cục đôi hoặc tập thể gia đình hiển thị cân đối, không cắt cụt người thân ở hai bên mép.
- **Màu sắc:** Phối hợp sắc đỏ cưới Wedding Red `#C93442` điểm xuyết tinh tế, tạo không khí ấm cúng của ngày ăn hỏi truyền thống.

### 1.5. Chương 5 — Album Ảnh Cưới (Wedding Montage)
- **Đa dạng bố cục:** Không lạm dụng hiệu ứng zoom đơn điệu. Hệ thống luân chuyển nhịp nhàng giữa:
  - Hero Portrait tôn vinh cô dâu chú rể.
  - Editorial Duo 60/40 đậm chất tạp chí thời trang cưới.
  - Mosaic bất đối xứng hiện đại.
  - Floating Gallery đa lớp chiều sâu.
  - 3D Arc Carousel hình trụ xoay êm ả.

### 1.6. Chương 6 — Lời Cảm Ơn (Grand Thank You Stage)
- **Chuyển cảnh Split Curtain:** Hai cánh rèm ảnh cưới tách đôi sang trái và phải trong không gian 3D, hé lộ bức tâm thư tri ân của đôi uyên ương.
- **Bố cục:** Tiêu đề "CẢM ƠN QUAN KHÁCH" trang trọng, hai bức ảnh cưới lớn hai bên cân đối, nội dung chữ sắc nét trên màn hình LED độ phân giải cao.

### 1.7. Chương 7 — Ảnh Kết Thúc (Final Hold)
- **Tính ổn định:** Bức ảnh cưới đẹp nhất chiếm lĩnh trung tâm màn hình, đứng yên hoàn toàn. Không có màn hình đen, không còn bất kỳ animation ngầm nào chạy tiêu hao pin hay nóng máy. Màn hình tiếp tục sáng làm phông nền chụp ảnh cùng gia đình.

---

## 2. MINH CHỨNG THỊ GIÁC (VISUAL ARTIFACTS)
Các ảnh chụp màn hình kiểm thử thực tế và video clip chuyển động thực:
- **Video phiên kiểm thử trực tiếp trình duyệt:**
  `artifacts/v3.2.1/v3_2_1_qa_pass_1792079624522.webp`
- **Màn hình Trang chủ:**
  `artifacts/v3.2.1/project_home_1792079636034.png`
- **Màn hình Pre-show Ready Gate (Trước giờ phát):**
  `artifacts/v3.2.1/preshow_ready_gate_1792079650258.png`
- **Màn hình Chuyển cảnh Chương 1 $\to$ Chương 2:**
  `artifacts/v3.2.1/chapter_transition_1792079672540.png`
- **Màn hình Cuộn phim 35mm Chương 2:**
  `artifacts/v3.2.1/chapter_2_filmstrip_1792079689986.png`
- **Giao diện Studio biên tập phim:**
  `artifacts/v3.2.1/studio_editor_1792079724943.png`
