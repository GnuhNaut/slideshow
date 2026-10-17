# Rà soát hiệu năng và hình ảnh — 17/10/2026

## Cấu trúc hiện tại

`config/wedding.config.json` và các thư mục ảnh/nhạc được `scripts/sync-gallery.mjs` biên dịch thành manifest. Sharp đã tạo ba kích thước ảnh: thumbnail 240px, medium 960px và display nằm trong 1920×1080. Timeline compiler chia dự án hiện tại thành 17 cảnh từ 63 ảnh trong 7 chương.

`PlaybackClock` điều khiển thời gian bằng requestAnimationFrame. `MotionRuntime` tính trạng thái chuyển cảnh rồi phát frame cho các hiệu ứng GSAP. Zustand cập nhật đồng hồ và điều khiển ở 10Hz. Nền tảng này phù hợp với trình chiếu; các vấn đề chính nằm ở vòng đời React và cách ghép chuyển động.

## Những điểm đã sửa

| Vấn đề | Thay đổi |
| --- | --- |
| Cảnh được dựng ở nhánh DOM khác khi chuẩn bị, chuyển cảnh và trở thành cảnh chính | Compositor giữ các layer theo `scene.id` trong cùng một cấu trúc. Cảnh mới giữ nguyên DOM qua cả ba bước. Riêng chuyển rèm vẫn thay cảnh cũ bằng `CurtainSurface` nhẹ. |
| SceneRenderer phụ thuộc cập nhật đồng hồ 10Hz, có thể vào chuyển cảnh trễ đến một nhịp UI | Thêm snapshot bố cục trong MotionRuntime và `useSyncExternalStore`. React nhận thông báo khi đổi cảnh hoặc pha chuyển cảnh; chuyển động vẫn theo từng frame. |
| Hoạt ảnh cảnh mới giữ progress 0 trong khoảng overlap, khiến ảnh/chữ chưa hiện khi cảnh cũ mờ đi | Tách thời gian chuyển động hình ảnh khỏi tiến độ timeline. Hoạt ảnh bắt đầu từ overlap của cảnh trước và tiếp tục liên tục qua mốc đổi cảnh. Thời lượng phim và mốc chương giữ nguyên. |
| Intro có GSAP timeline tự chạy và một callback khác cùng ghi transform | Dùng chung đồng hồ phát cho toàn bộ chuyển động Intro, bao gồm xuất hiện, dừng và tua ngược. |
| Frame đầu có thể hiển thị trước khi transform được áp dụng | Khởi tạo callback chuyển động và compositor trong layout effect trước khi paint. |
| Ảnh/chữ cảnh Cầu Hôn chồng lên nhau | Bố cục ảnh bên phải, chữ bên trái trên màn rộng; ảnh phía trên và chữ phía dưới trên điện thoại. |
| Tim bay đổi filter blur trên từng frame | Giữ blur cố định cho mỗi tim; tiếp tục chuyển động bằng transform và opacity. |
| Chế độ high_performance vẫn dựng tim bay và film grain | Bỏ hai lớp trang trí này khi cấu hình high_performance. |
| Mở trực tiếp #stage có thể bị effect đồng bộ URL ghi đè bằng #home | Đợi áp dụng route ban đầu rồi mới đồng bộ viewMode trở lại URL. |

Thời gian chuẩn bị cảnh tăng từ 400ms lên 700ms. Cảnh được chuẩn bị ngay trong layer sẽ hiển thị, thay cho dựng một bản ẩn rồi dựng lại. Dọn thêm timeout ẩn điều khiển khi thoát trình chiếu và reset đầy đủ transform ảnh hero khi tua.

## Kiểm chứng

- Vitest: 120 test qua, gồm kiểm tra snapshot React giữ nguyên qua 120 frame, thông báo đổi pha, tua ngược và tính liên tục của chuyển động qua overlap.
- TypeScript và production build thành công.
- Lint thành công, còn 16 cảnh báo unused có sẵn ở các file khác.
- Chrome headless: kiểm tra toàn bộ 16 điểm nối cảnh, giữ nguyên phần tử incoming từ chuẩn bị đến overlap rồi trở thành active; tối đa hai layer cảnh. Kiểm tra Intro không đổi pose khi pause và trở lại đúng pose khi tua ngược. Không ghi nhận page error.
- Kiểm tra ảnh chụp ở 1440×900 và 390×844 cho cảnh Cầu Hôn, cùng cảnh cuộn phim trên điện thoại. Màn bắt đầu phải biến mất sau click và route vẫn là #stage.

Các kiểm tra này xác nhận tính liên tục và vòng đời cảnh. Chưa đo FPS trên TV/màn LED hoặc máy chạy lễ cưới, vì vậy chưa có cơ sở cam kết 60 FPS trên mọi thiết bị.

## Các hướng nên ưu tiên tiếp nếu còn khựng trên máy trình chiếu

1. **Virtualization thật cho cuộn phim khi tăng số ảnh.** `FilmRollScene` vẫn dựng toàn bộ ảnh lặp theo chiều rộng loop; bộ test `filmVirtualization.test.ts` hiện kiểm tra một hàm nằm trong file test, không chứng minh DOM production bị giới hạn. Có sẵn `getVisibleItems` trong `filmstripMath.ts` để phát triển theo cửa sổ nhìn thấy và vùng đệm. Cần kiểm tra cả cuộn RTL/LTR và lúc wrap trước khi thay.
2. **Đo frame time trên đúng thiết bị.** Chạy bản production qua các đoạn Intro → Memories, Memories → Proposal và Wedding → Thanks, đo long tasks, paint và GPU memory. Kiểm tra cả lúc ảnh chưa nằm trong cache. Thêm hiệu ứng trước khi có số đo có thể làm tình hình xấu đi.
3. **Rà lại khung hình lớn.** Mask bằng clip-path, bóng đổ lớn và các biến đổi 3D toàn cảnh vẫn có chi phí. Nếu GPU là nút thắt, ưu tiên dissolve nhẹ và giảm số layer có will-change trong chế độ high_performance.
4. **Chuẩn bị tài nguyên khi chạy tại lễ cưới.** Font đang tải từ Google Fonts; ảnh và nhạc vẫn cần tải qua mạng khi mở web lần đầu. Cân nhắc tự phục vụ font và chuẩn bị cache/offline có kiểm soát sau khi xác định yêu cầu vận hành.

Để giảm trang trí ngay trên máy yếu, đặt `display.performanceMode` thành `"high_performance"` trong config rồi chạy lại dev/build. Giá trị mặc định `"balanced"` được giữ nguyên.
