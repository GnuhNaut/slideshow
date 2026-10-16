# BẢNG KIỂM TRA PHÁT HÀNH (RELEASE CHECKLIST V3.2.2)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI  
**Phiên bản:** V3.2.2 — Release Candidate  
**Commit:** Đang chuẩn bị commit trên nhánh `v3.2.2-final-validation`  

---

## 1. DANH MỤC KIỂM TRA TRƯỚC PHÁT HÀNH

- [x] **Git Branching:** Tạo nhánh mới `v3.2.2-final-validation` từ commit nền `99ac210`, bảo vệ nguyên vẹn nhánh `v3.2.1-critical-hotfix` và `main`.
- [x] **Scope Freeze:** Không thêm framework mới, không tạo hiệu ứng FX rác, không thay đổi tên cặp đôi Tuấn Hùng & Sao Mai hoặc ngày cưới 19/10/2026.
- [x] **FIX 01 (Grand Wedding Curtain):** Xóa bỏ hoàn toàn việc mount 2 component outgoing scene nặng; thay bằng `CurtainSurface` tĩnh nhẹ.
- [x] **FIX 02 (ZIP Export/Import Integrity):** Pre-scan và self-validation 100% media; chặn tạo file ZIP thiếu dữ liệu; transaction rollback Dexie an toàn.
- [x] **FIX 03 (Thumbnail Persistence):** Khôi phục live tracked URL cho `photo.thumbnail` sau reload; bổ sung `onError` fallback.
- [x] **FIX 04 (Audio Persistence & Lifecycle):** Ghi bền vững binary vào `db.audio`; `audioEngine.stop()` dọn sạch khi thoát rạp chiếu; chống double-click.
- [x] **Filmstrip Sync:** Không hở frame, monotonic math, decode cache bounded 200 items.
- [x] **7 Phân cảnh & 6 Chuyển cảnh:** Hoạt động đúng bản thiết kế, nhịp điệu điện ảnh, Lời Cảm Ơn nổi bật, Final Hold đứng yên.
- [x] **Single QA Pipeline (`qa:final`):** Script `npm run qa:final` chạy đồng bộ TypeScript, Build và Vitest đạt 100% PASS.
- [x] **Full Automated Suite:** 90/90 tests PASS across 12 test files (`TC-01` đến `TC-90`).
- [x] **Browser E2E Video & Screenshots:** Ghi lại đầy đủ video WebP và 11 ảnh chụp màn hình trong `artifacts/final-qa/`.
- [x] **Bàn giao hoàn chỉnh:** Sẵn sàng nghiệm thu cuối cùng (`READY FOR FINAL REVIEW`).
