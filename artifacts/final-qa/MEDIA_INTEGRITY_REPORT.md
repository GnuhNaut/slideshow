# BÁO CÁO TÍNH TOÀN VẸN DỮ LIỆU ĐA PHƯƠNG TIỆN (MEDIA INTEGRITY REPORT)
**Dự án:** WEDDING FILM STORY — TUẤN HÙNG & SAO MAI  
**Phiên bản:** V3.2.2 — Release Candidate  
**Cơ chế lưu trữ:** Dexie IndexedDB v4.4.6 (`db.projects`, `db.media`, `db.audio`)  

---

## 1. QUY TRÌNH KIỂM SOÁT TÍNH TOÀN VẸN TRONG XUẤT ZIP (EXPORT)
1. **Pre-scan & Validation:**
   - Trước khi nén file, hệ thống quét $100\%$ ảnh và nhạc được project tham chiếu.
   - Truy xuất blob trực tiếp từ IndexedDB (`db.media` và `db.audio`).
   - Kiểm tra `blob.size > 0`. Nếu bất kỳ file nào thiếu hoặc 0-byte, quá trình ném ngoại lệ lập tức và dừng lại.
2. **Manifest Chuẩn hóa:**
   - Ghi lại danh sách `mediaEntries` gồm `id`, `path`, `type`, `mimeType`, `size`.
   - Lưu trữ `totalChapters`, `totalPhotos`, `totalAudioTracks`.
3. **Self-Validation trong RAM:**
   - Tự động nạp lại ZIP blob vừa tạo để đối chiếu từng file trong `mediaEntries`.
   - Đảm bảo gói ZIP hoàn hảo trước khi người dùng tải về.

---

## 2. QUY TRÌNH NHẬP ZIP NGUYÊN TỬ (ATOMIC IMPORT)
1. **Prepare:** Đọc manifest, kiểm tra phiên bản hỗ trợ, xác thực cấu trúc `project.json` qua `validateProjectSchema`.
2. **Zero-Tolerance Scan:** Kiểm tra sự tồn tại của từng file ảnh và nhạc trong thư mục `media/` và `audio/`.
3. **Stage:** Nạp toàn bộ nhị phân vào bộ nhớ RAM tạm thời và cấp `mediaId` ổn định.
4. **Commit:** Sử dụng `db.transaction('rw', [db.projects, db.media, db.audio], ...)` của Dexie. Toàn bộ dự án, ảnh và nhạc được ghi nguyên tử: thành công trọn vẹn $100\%$ hoặc tự động rollback.
5. **Activate:** Tái tạo tracked URLs cho cả `photo.url` và `photo.thumbnail`, kích hoạt dự án vào store.

---

## 3. CHIẾN LƯỢC THUMBNAIL BỀN VỮNG SAU RELOAD (F5)
1. Không bao giờ lưu vĩnh viễn `blob:` URL vào schema cơ sở dữ liệu.
2. Khi người dùng tải lại trang (`restoreProjectMedia`), hệ thống đọc blob gốc từ `db.media` và sinh ra tracked live URL mới, đồng thời cập nhật cả `photo.url` và `photo.thumbnail`.
3. Bổ sung `onError` fallback tự động trên các component UI để tránh tuyệt đối nguy cơ hiện icon ảnh lỗi.
