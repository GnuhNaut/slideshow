# DANH MỤC KIỂM TRA PHÁT HÀNH (RELEASE CHECKLIST V3.2.1)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI
**Phiên bản:** V3.2.1 — Release Candidate
**Trạng thái cổng phát hành:** **READY FOR FINAL USER REVIEW**

---

## 1. FUNCTIONAL RELEASE GATES
- [x] Không còn lỗi P0 nào đã biết (Scene lifecycle, filmstrip wrap, split curtain double mount, import staging).
- [x] 100% các unit và integration tests chạy thành công: **60/60 tests PASS**.
- [x] Không có uncaught runtime errors hoặc unhandled promise rejections trong trình duyệt.
- [x] Quy trình Import / Export ZIP hoạt động an toàn theo cơ chế 5 giai đoạn có transaction rollback.
- [x] Bảo toàn toàn bộ thông tin cặp đôi: Tuấn Hùng & Sao Mai, ngày cưới 19/10/2026, ảnh và nhạc.

## 2. MOTION & PERFORMANCE GATES
- [x] Sử dụng một Master Clock 60Hz duy nhất chi phối mọi chuyển động.
- [x] Lookahead preparation 400ms loại bỏ hoàn toàn blank frame khi chuyển cảnh.
- [x] Cuộn phim 35mm RTL và LTR đơn điệu hóa toán học, không hở ảnh khi wrap modulo.
- [x] Rèm cưới 3D Split Curtain chuyển sang sử dụng texture tĩnh / snapshot, không mount hai lần cây React nặng, 0 duplicate GSAP listeners.
- [x] Giải phóng toàn bộ bộ nhớ snapshot tạm thời ngay sau khi transition hoàn tất.
- [x] Kết thúc phim đúng ở ảnh cưới cuối cùng (FINAL_HOLD) với 0 animation ngầm.

## 3. DESIGN & STAGE GATES
- [x] Giữ trọn vẹn phong cách thiết kế sang trọng: Warm Ivory `#FFF9F2`, Blush Pink `#F0DFD5`, Wedding Red `#C93442`, Champagne `#C5A16E`.
- [x] Sáu chương mang tính chất tự sự điện ảnh rõ nét, không dùng hiệu ứng chớp nháy rẻ tiền.
- [x] Bố cục dạm ngõ và ảnh cưới hiển thị rõ mặt, không crop mất người thân.
- [x] Lời cảm ơn trang trọng, chữ lớn sắc nét, tương phản tối ưu trên màn LED.
- [x] Màn hình Pre-show Ready Gate chặn phát ngoài ý muốn, chuẩn bị sẵn sàng cho giờ cử hành hôn lễ.
- [x] Quản lý Screen Wake Lock bảo đảm giữ sáng màn hình.

## 4. DOCUMENTATION & RUNBOOK GATES
- [x] Đã lập tài liệu chuẩn mực: [docs/V3_2_1_BASELINE.md](file:///d:/Workspace/slide-video/docs/V3_2_1_BASELINE.md).
- [x] Đã lập ma trận nghiệm thu đầy đủ: [docs/V3_2_1_ACCEPTANCE_MATRIX.md](file:///d:/Workspace/slide-video/docs/V3_2_1_ACCEPTANCE_MATRIX.md).
- [x] Đã biên soạn sổ tay vận hành ngày cưới: [docs/WEDDING_DAY_RUNBOOK.md](file:///d:/Workspace/slide-video/docs/WEDDING_DAY_RUNBOOK.md).
- [x] Toàn bộ 8 tài liệu báo cáo kỹ thuật và hình ảnh minh chứng đã lưu tại `artifacts/v3.2.1/`.

## 5. GIT & DEPLOYMENT GATES
- [x] Giữ nguyên nhánh `main` và nhánh `v3.2-final-acceptance`.
- [x] Hoàn thiện mã nguồn trên nhánh mới `v3.2.1-release-candidate`.
- [x] Tạo commit Release Candidate rõ ràng, sẵn sàng để người dùng đánh giá và nghiệm thu.
