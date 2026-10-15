import { PhotoItem } from '../types/project';

// Creates an editorial, cinematic SVG photo with high-aesthetic styling, warm lighting and monogram
export function createCinematicSvgPhoto(
  title: string,
  subtitle: string,
  accentColor: string = '#581E2C',
  width: number = 1920,
  height: number = 1080,
  orientation: 'landscape' | 'portrait' = 'landscape'
): string {
  const w = orientation === 'portrait' ? 1080 : width;
  const h = orientation === 'portrait' ? 1440 : height;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <defs>
      <radialGradient id="grad_${title.replace(/[^a-zA-Z0-9]/g, '')}" cx="50%" cy="46%" r="70%">
        <stop offset="0%" stop-color="#F5EDE1" stop-opacity="0.10"/>
        <stop offset="48%" stop-color="${accentColor}" stop-opacity="0.75"/>
        <stop offset="100%" stop-color="#140F11" stop-opacity="0.98"/>
      </radialGradient>
      <linearGradient id="champagne_line" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#BFA47D" stop-opacity="0.3"/>
        <stop offset="50%" stop-color="#BFA47D" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#BFA47D" stop-opacity="0.3"/>
      </linearGradient>
    </defs>

    <!-- Deep espresso background -->
    <rect width="${w}" height="${h}" fill="#1C1718"/>
    <rect width="${w}" height="${h}" fill="url(#grad_${title.replace(/[^a-zA-Z0-9]/g, '')})"/>

    <!-- Subtle Inner Editorial Border -->
    <rect x="${w * 0.05}" y="${h * 0.05}" width="${w * 0.90}" height="${h * 0.90}" 
          fill="none" stroke="#BFA47D" stroke-width="1.5" stroke-opacity="0.35" rx="4"/>

    <!-- Corner Accents -->
    <path d="M ${w * 0.05 + 8} ${h * 0.05 + 20} L ${w * 0.05 + 8} ${h * 0.05 + 8} L ${w * 0.05 + 20} ${h * 0.05 + 8}" 
          stroke="#BFA47D" stroke-width="2" fill="none" stroke-opacity="0.8"/>
    <path d="M ${w * 0.95 - 8} ${h * 0.05 + 20} L ${w * 0.95 - 8} ${h * 0.05 + 8} L ${w * 0.95 - 20} ${h * 0.05 + 8}" 
          stroke="#BFA47D" stroke-width="2" fill="none" stroke-opacity="0.8"/>
    <path d="M ${w * 0.05 + 8} ${h * 0.95 - 20} L ${w * 0.05 + 8} ${h * 0.95 - 8} L ${w * 0.05 + 20} ${h * 0.95 - 8}" 
          stroke="#BFA47D" stroke-width="2" fill="none" stroke-opacity="0.8"/>
    <path d="M ${w * 0.95 - 8} ${h * 0.95 - 20} L ${w * 0.95 - 8} ${h * 0.95 - 8} L ${w * 0.95 - 20} ${h * 0.95 - 8}" 
          stroke="#BFA47D" stroke-width="2" fill="none" stroke-opacity="0.8"/>

    <!-- Center Monogram -->
    <circle cx="${w / 2}" cy="${h * 0.38}" r="${Math.min(w, h) * 0.11}" 
            fill="#581E2C" fill-opacity="0.6" stroke="#BFA47D" stroke-width="1.5" stroke-opacity="0.6"/>
    <text x="${w / 2}" y="${h * 0.395}" font-family="'Cormorant Garamond', serif" 
          font-size="${Math.min(w, h) * 0.075}" font-style="italic" fill="#F5EDE1" text-anchor="middle" font-weight="600">
      H &amp; M
    </text>

    <!-- Couple Names / Caption -->
    <text x="${w / 2}" y="${h * 0.62}" font-family="'Cormorant SC', serif" 
          font-size="${Math.min(w, h) * 0.05}" letter-spacing="5" fill="#F5EDE1" text-anchor="middle" font-weight="600">
      ${title.toUpperCase()}
    </text>

    <line x1="${w / 2 - 60}" y1="${h * 0.66}" x2="${w / 2 + 60}" y2="${h * 0.66}" 
          stroke="url(#champagne_line)" stroke-width="1.5"/>

    <text x="${w / 2}" y="${h * 0.72}" font-family="'Be Vietnam Pro', sans-serif" 
          font-size="${Math.min(w, h) * 0.024}" letter-spacing="2" fill="#F5EDE1" text-anchor="middle" font-weight="400" opacity="0.85">
      ${subtitle}
    </text>

    <text x="${w / 2}" y="${h * 0.88}" font-family="'Cormorant Garamond', serif" 
          font-size="${Math.min(w, h) * 0.022}" letter-spacing="4" fill="#BFA47D" text-anchor="middle">
      TUẤN HÙNG &amp; SAO MAI • 19.10.2026
    </text>
  </svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function generateDefaultPhotos(chapterId: string, count: number, chapterPrefix: string): PhotoItem[] {
  const photos: PhotoItem[] = [];
  const titles = [
    { title: 'Khoảnh Khắc Đẹp', sub: 'Hành trình tình yêu ngọt ngào' },
    { title: 'Nụ Cười Trao Nhau', sub: 'Ánh mắt ngày đầu gặp gỡ' },
    { title: 'Bên Nhau Bình Yên', sub: 'Những sớm mai đón nắng ấm' },
    { title: 'Chuyến Đi Kỷ Niệm', sub: 'Bước chân in dấu ngàn phương' },
    { title: 'Hoàng Hôn Ngọt Ngào', sub: 'Thời khắc tình yêu lên ngôi' },
    { title: 'Hẹn Ước Trọn Đời', sub: 'Lời thì thầm dưới ngàn vì sao' },
    { title: 'Hạnh Phúc Giản Đơn', sub: 'Có nhau trong từng khoảnh khắc' },
    { title: 'Nắm Tay Qua Năm Tháng', sub: 'Vững tin trên con đường chung' },
  ];

  for (let i = 0; i < count; i++) {
    const item = titles[i % titles.length];
    const isPortrait = i % 3 === 1;
    const width = isPortrait ? 1080 : 1920;
    const height = isPortrait ? 1440 : 1080;
    const titleText = `${chapterPrefix} - ${item.title} #${i + 1}`;

    photos.push({
      id: `${chapterId}_photo_${i + 1}`,
      chapterId,
      title: titleText,
      url: createCinematicSvgPhoto(
        titleText,
        item.sub,
        i % 2 === 0 ? '#581E2C' : '#3D1520',
        width,
        height,
        isPortrait ? 'portrait' : 'landscape'
      ),
      originalWidth: width,
      originalHeight: height,
      aspectRatio: width / height,
      cropMode: 'cover',
      focalPoint: { x: 50, y: 50 },
      isHero: i === 0,
      order: i,
      createdAt: Date.now() + i * 100,
    });
  }

  return photos;
}
