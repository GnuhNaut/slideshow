# HƯỚNG DẪN QUẢN LÝ THƯ VIỆN ẢNH & NHẠC (PROJECT FOLDER GALLERY)
## Wedding Film Story — Tuấn Hùng & Sao Mai

Hệ thống **Project Folder Gallery** cho phép bạn quản lý toàn bộ ảnh, nhạc và thông số của bộ phim cưới trực tiếp trong thư mục dự án. **Không còn phụ thuộc vào IndexedDB của trình duyệt**, khi bạn đẩy code lên GitHub và Netlify build, **bất kỳ máy tính, điện thoại hay trình duyệt nào mở website cũng sẽ thấy đúng ảnh, đúng nhạc và đúng cấu hình của bạn**.

---

## 1. Cấu Trúc Thư Mục Trong Dự Án

Toàn bộ tài nguyên được phân chia theo 7 chương tương ứng với kịch bản phim cưới:

```text
slide-video/
├── config/
│   └── wedding.config.json       <-- File cấu hình duy nhất của phim
├── public/
│   ├── gallery/                  <-- Thư mục chứa ảnh 7 chương
│   │   ├── 01-intro/             <-- Chương 1: Lời Mở Đầu (Ảnh cưới chủ đạo/Hero)
│   │   ├── 02-memories/          <-- Chương 2: Những Ngày Bên Nhau (Cuộn phim 35mm)
│   │   ├── 03-proposal/          <-- Chương 3: Lời Cầu Hôn (Giây phút "Yes, I Do")
│   │   ├── 04-family/            <-- Chương 4: Hai Gia Đình, Một Hạnh Phúc
│   │   ├── 05-wedding/           <-- Chương 5: Ngày Chung Đôi (Bộ ảnh cưới chính)
│   │   ├── 06-thanks/            <-- Chương 6: Lời Cảm Ơn
│   │   └── 07-final/             <-- Chương 7: Khép Lại & Mãi Mãi (Ảnh kết thúc Final Freeze)
│   └── audio/                    <-- Thư mục chứa nhạc nền
│       ├── global/               <-- Nhạc nền phát xuyên suốt toàn bộ phim
│       ├── 01-intro/             <-- Nhạc riêng Chương 1 (nếu dùng chế độ per_chapter)
│       ├── 02-memories/          <-- Nhạc riêng Chương 2
│       ├── 03-proposal/          <-- Nhạc riêng Chương 3
│       ├── 04-family/            <-- Nhạc riêng Chương 4
│       ├── 05-wedding/           <-- Nhạc riêng Chương 5
│       ├── 06-thanks/            <-- Nhạc riêng Chương 6
│       └── 07-final/             <-- Nhạc riêng Chương 7
└── scripts/
    └── sync-gallery.mjs          <-- Script tự động quét ảnh & tối ưu
```

---

## 2. Quy Tắc Đặt Tên & Sắp Xếp Ảnh

### Định dạng ảnh hỗ trợ
* **JPG / JPEG**: Phổ biến nhất.
* **PNG**: Hỗ trợ đầy đủ.
* **WebP / AVIF**: Tối ưu dung lượng tốt.
* *(Nếu có file HEIC/HEIF từ iPhone, hệ thống sẽ tự động chuyển đổi sang WebP chất lượng cao khi build)*.

### Quy tắc đặt tên file để sắp xếp đúng thứ tự
Hệ thống sử dụng **sắp xếp số tự nhiên (Natural Numeric Sorting)**. Hãy đặt tên file theo mẫu:
* `001.jpg`, `002.jpg`, `003.jpg`, ... `010.jpg`, `025.jpg`
* Hoặc: `1.jpg`, `2.jpg`, `10.jpg` (hệ thống sẽ hiểu `2.jpg` đứng trước `10.jpg`, không bị nhảy lộn xộn).

> **Lưu ý:**
> * Bạn **không cần** phải khai báo tên từng file ảnh vào file JSON. Hệ thống tự động phát hiện mọi file ảnh trong thư mục khi dev hoặc build.
> * Các file ẩn, file `.gitkeep`, file tạm hệ thống đều được tự động bỏ qua.
> * Các ảnh 0 byte hoặc file lỗi sẽ được cảnh báo lúc quét mà không làm sập ứng dụng.

---

## 3. Thao Tác Thêm, Xóa & Đổi Thứ Tự Ảnh

### Thêm ảnh
Chỉ cần copy file ảnh từ máy tính của bạn và dán vào thư mục chương mong muốn (ví dụ: `public/gallery/02-memories/`). Khi đang chạy `npm run dev`, giao diện sẽ tự làm mới nhận ảnh ngay.

### Xóa ảnh
Xóa file ảnh đó khỏi thư mục tương ứng trong `public/gallery/`.

### Đổi thứ tự ảnh
Đổi lại tên file. Ví dụ: Nếu muốn ảnh `005.jpg` chạy trước ảnh `001.jpg`, bạn chỉ cần đổi tên thành `000.jpg` hoặc đánh số lại `001.jpg`, `002.jpg`.

---

## 4. Tùy Chỉnh Toàn Diện Bằng `config/wedding.config.json`

File `config/wedding.config.json` là trung tâm điều khiển của toàn bộ phim cưới. Dưới đây là giải thích chi tiết từng phần:

```json
{
  "version": 1,
  "contentSource": "filesystem",
  "project": {
    "groomName": "Tuấn Hùng",
    "brideName": "Sao Mai",
    "weddingDate": "19.10.2026",
    "lunarDate": "09.09 Bính Ngọ",
    "venueName": "White Palace Convention Center",
    "thankYouMessage": "Xin chân thành cảm ơn gia đình, người thân và bạn bè đã đồng hành và chia sẻ niềm hạnh phúc cùng chúng tôi.",
    "openingPhoto": "01-intro/001.jpg",
    "endingPhoto": "07-final/001.jpg"
  },
  "display": {
    "aspectRatio": "16:9",
    "performanceMode": "balanced",
    "defaultCropMode": "contain"
  },
  "audio": {
    "mode": "global",
    "globalFile": "global/background.mp3",
    "globalVolume": 0.85,
    "loopGlobal": true,
    "crossfadeSeconds": 0.8,
    "perChapter": {
      "01-intro": "01-intro/music.mp3",
      "02-memories": "02-memories/music.mp3",
      "03-proposal": "03-proposal/music.mp3",
      "04-family": "04-family/music.mp3",
      "05-wedding": "05-wedding/music.mp3",
      "06-thanks": "06-thanks/music.mp3",
      "07-final": "07-final/music.mp3"
    }
  },
  "chapters": {
    "01-intro": { "enabled": true, "mode": "custom", "durationSeconds": 14 },
    "02-memories": {
      "enabled": true,
      "mode": "custom",
      "durationSeconds": 60,
      "showCenterTitle": true,
      "showCenterNames": false,
      "showFrameNames": false,
      "showMetadata35mm": false,
      "cropMode": "contain",
      "filmstripSpeedMode": "auto"
    },
    "03-proposal": { "enabled": true, "mode": "custom", "durationSeconds": 15 },
    "04-family": { "enabled": true, "mode": "custom", "durationSeconds": 30, "cropMode": "contain" },
    "05-wedding": { "enabled": true, "mode": "custom", "durationSeconds": 90, "cropMode": "contain" },
    "06-thanks": { "enabled": true, "mode": "custom", "durationSeconds": 14 },
    "07-final": { "enabled": true, "mode": "custom", "durationSeconds": 2 }
  },
  "photoOverrides": {
    "02-memories/003.jpg": {
      "durationSeconds": 6,
      "cropMode": "contain",
      "focalPoint": { "x": 50, "y": 50 },
      "isHero": true
    }
  }
}
```

### Cách chọn ảnh Mở đầu & Kết thúc
* **Ảnh mở đầu**: Đặt tại `project.openingPhoto`, ví dụ `"01-intro/001.jpg"`.
* **Ảnh kết thúc**: Đặt tại `project.endingPhoto`, ví dụ `"07-final/001.jpg"`. Bạn hoàn toàn có thể trỏ đến ảnh của chương khác (ví dụ: `"05-wedding/015.jpg"`), hệ thống sẽ tự động tìm và gán vào cảnh Final Freeze ở Chương 7 mà không cần copy ảnh sang thư mục `07-final`.

### Cách chỉnh thời lượng từng chương
Trong mục `chapters`, sửa giá trị `"durationSeconds"`:
* Ví dụ muốn Chương 2 chạy trong 90 giây: sửa `"durationSeconds": 90`.
* Ví dụ muốn Chương 5 chạy trong 120 giây: sửa `"durationSeconds": 120`.

### Cách chỉnh crop và điểm hội tụ (Focal Point) từng ảnh
Mặc định mọi ảnh đều có `cropMode: "contain"` để bảo đảm **không bao giờ bị mất đầu hoặc mất chân** (đặc biệt là ảnh đứng toàn thân).
Nếu bạn muốn một ảnh cụ thể phủ đầy khung hình (`cover`), hãy thêm vào `photoOverrides`:
```json
"photoOverrides": {
  "05-wedding/008.jpg": {
    "cropMode": "cover",
    "focalPoint": { "x": 50, "y": 35 }
  }
}
```
* `focalPoint.x`: từ 0 (trái) đến 100 (phải), tâm là 50.
* `focalPoint.y`: từ 0 (đỉnh đầu) đến 100 (chân), 35 là vị trí khuôn mặt tiêu chuẩn.

---

## 5. Quản Lý Nhạc Nền

### Chế độ 1 bài nhạc xuyên suốt (Global Mode - Khuyên dùng)
1. Chép file nhạc vào `public/audio/global/background.mp3`.
2. Trong `config/wedding.config.json`, đặt:
   ```json
   "audio": {
     "mode": "global",
     "globalFile": "global/background.mp3",
     "globalVolume": 0.85,
     "loopGlobal": true
   }
   ```
Bài nhạc sẽ tự động lặp lại mượt mà nếu tổng thời lượng phim dài hơn bài hát.

### Chế độ nhạc riêng từng chương (Per-Chapter Mode)
1. Chép từng bài nhạc vào thư mục của chương đó (ví dụ: `public/audio/02-memories/music.mp3`).
2. Trong `config/wedding.config.json`, đổi:
   ```json
   "audio": {
     "mode": "per_chapter",
     "crossfadeSeconds": 0.8
   }
   ```
AudioDirector sẽ tự động chuyển bài với hiệu ứng crossfade mượt mà khi đổi chương. Nếu chương nào chưa có nhạc, hệ thống sẽ yên lặng chuyển tiếp mà không gây crash hoặc phát sai bài.

---

## 6. Quy Trình Phát Triển & Triển Khai (Deploy)

### Chạy thử nghiệm trên máy local
```bash
npm run dev
```
* Bộ quét sẽ tự động chạy trước khi mở server.
* Khi bạn chép ảnh mới vào `public/gallery/`, Vite Watcher sẽ tự phát hiện và đồng bộ lại manifest ngay lập tức.
* Nếu muốn chủ động quét lại thư viện bằng tay bất kỳ lúc nào:
  ```bash
  npm run gallery:sync
  ```

### Kiểm tra build trước khi đẩy lên mạng
```bash
npm run build
```
Lệnh này sẽ tự động:
1. Quét toàn bộ 7 thư mục `gallery` và `audio`.
2. Tối ưu ảnh (tạo bản WebP chất lượng cao + thumbnail nhẹ để không giật lag).
3. Đọc và kiểm tra file `config/wedding.config.json`.
4. Biên dịch TypeScript và đóng gói Vite.

### Đẩy lên GitHub để Netlify tự động deploy
```bash
git add .
git commit -m "feat: cập nhật ảnh cưới và cấu hình chương"
git push origin feat-project-folder-gallery
```
Netlify sẽ tự động chạy `prebuild` -> `build` và cập nhật trang web chính:
👉 **Production**: https://hungmai.netlify.app/

---

## 7. Kiểm Tra Trên Các Máy Tính & Trình Duyệt Khác

Vì toàn bộ ảnh và cấu hình đã nằm sẵn trong mã nguồn build:
1. Mở một trình duyệt hoàn toàn mới (hoặc chế độ Ẩn danh / Incognito).
2. Truy cập `https://hungmai.netlify.app/?mode=stage#stage`.
3. Website sẽ lập tức tải ảnh, nhạc và timeline từ file tĩnh mà **không cần upload lại, không phụ thuộc vào bộ nhớ cũ của trình duyệt**.

---

## 8. Cách Khắc Phục Lỗi (Rollback)

Nếu lỡ xóa nhầm ảnh hoặc sửa file JSON bị sai cú pháp:
1. Kiểm tra lại thông báo lỗi trên terminal (hệ thống sẽ báo rõ dòng bị lỗi cú pháp trong `wedding.config.json`).
2. Khôi phục lại trạng thái cũ bằng Git:
   ```bash
   git checkout config/wedding.config.json
   ```
3. Chạy lại `npm run gallery:sync` để đồng bộ lại.
