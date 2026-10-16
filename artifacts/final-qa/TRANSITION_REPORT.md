# BÁO CÁO SÁU HIỆU ỨNG CHUYỂN CẢNH 3D (TRANSITIONS REPORT)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI  
**Phiên bản:** V3.2.2 — Release Candidate  

---

## 1. BẢNG TỔNG HỢP 6 HIỆU ỨNG CHUYỂN CẢNH ĐỘC BẢN

| STT | Chuyển cảnh | Tên hiệu ứng kỹ thuật | Thời lượng | Đặc trưng thị giác & Hình học | Trạng thái |
| :---: | :--- | :--- | :---: | :--- | :---: |
| 1 | **Chương 1 $\to$ 2** | `FILM_PORTAL_OPENING` | 1.2s | Chữ Lời Mở Đầu lùi sâu vào Z-space, dải phim 35mm lướt qua mở ra cuộn phim | **PASS** |
| 2 | **Chương 2 $\to$ 3** | `TRUE_FILM_TO_HERO_MORPH` | 1.3s | Dải phim nghiêng lùi về sau trong không gian 3D, ảnh Cầu Hôn phóng to về trung tâm | **PASS** |
| 3 | **Chương 3 $\to$ 4** | `PREMIUM_3D_ALBUM_TURN` | 1.1s | Lật trang album 3D có bản lề mép trái (`transformOrigin: 0% 50%`) sang trọng | **PASS** |
| 4 | **Chương 4 $\to$ 5** | `GALLERY_SPACE_TRANSFORMATION` | 1.2s | Không gian ảnh gia đình lùi Z-space, album ảnh cưới trào dâng về phía trước | **PASS** |
| 5 | **Chương 5 $\to$ 6** | `GRAND_WEDDING_CURTAIN_REVEAL` | 1.3s | Hai cánh rèm ảnh cưới dùng `CurtainSurface` tĩnh tách đôi sang trái/phải, hé lộ Lời Cảm Ơn | **PASS** |
| 6 | **Chương 6 $\to$ 7** | `FOREVER_FINAL_REVEAL` | 1.2s | Typography tri ân tan êm dịu, bức ảnh cưới cuối mở rộng toàn màn hình vào FINAL_HOLD | **PASS** |

---

## 2. KIỂM ĐỊNH VISUAL CONTINUITY CỦA GRAND WEDDING CURTAIN
- **Tại thời điểm 0% transition:** Hai cánh rèm hiển thị nửa trái và nửa phải của outgoing scene khớp $100\%$ về hình học, không có độ trễ tạo texture, không co giãn méo hình.
- **Tại 25%, 50%, 75% transition:** Hai cánh rèm quay 3D quanh bản lề mép ngoài (`rotationY: -18deg` và `rotationY: 18deg`) với đường viền Champagne Gold và bóng đổ sâu.
- **Tài nguyên:** Sử dụng `CurtainSurface` tĩnh nhẹ, **0 duplicate GSAP subscriptions, 0 audio instances**.
