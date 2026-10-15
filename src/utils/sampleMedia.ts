import { PhotoItem } from '../types/project';

// Creates a romantic, cinematic SVG photo with high-aesthetic styling, warm lighting and monogram
export function createCinematicSvgPhoto(
  title: string,
  subtitle: string,
  accentColor: string = '#81252D',
  width: number = 1920,
  height: number = 1080,
  orientation: 'landscape' | 'portrait' = 'landscape'
): string {
  const w = orientation === 'portrait' ? 1080 : width;
  const h = orientation === 'portrait' ? 1620 : height;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <defs>
      <radialGradient id="grad_${title.replace(/\s+/g, '')}" cx="50%" cy="45%" r="75%">
        <stop offset="0%" stop-color="#fff8f0" stop-opacity="0.12"/>
        <stop offset="45%" stop-color="${accentColor}" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="#151114" stop-opacity="0.98"/>
      </radialGradient>
      <linearGradient id="gold_foil" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#ecd28f"/>
        <stop offset="50%" stop-color="#d4ac59"/>
        <stop offset="100%" stop-color="#a47738"/>
      </linearGradient>
      <pattern id="film_grain" width="100" height="100" patternUnits="userSpaceOnUse">
        <circle cx="10" cy="20" r="1" fill="#ecd28f" opacity="0.08"/>
        <circle cx="50" cy="70" r="1.5" fill="#ecd28f" opacity="0.05"/>
        <circle cx="80" cy="30" r="1" fill="#fff" opacity="0.06"/>
      </pattern>
    </defs>

    <!-- Deep cinematic background -->
    <rect width="${w}" height="${h}" fill="#191317"/>
    <rect width="${w}" height="${h}" fill="url(#grad_${title.replace(/\s+/g, '')})"/>
    <rect width="${w}" height="${h}" fill="url(#film_grain)"/>

    <!-- Subtle Inner Luxury Border -->
    <rect x="${w * 0.04}" y="${h * 0.04}" width="${w * 0.92}" height="${h * 0.92}" 
          fill="none" stroke="url(#gold_foil)" stroke-width="2" stroke-opacity="0.45" rx="8"/>
    <rect x="${w * 0.05}" y="${h * 0.05}" width="${w * 0.90}" height="${h * 0.90}" 
          fill="none" stroke="rgba(255,244,228,0.18)" stroke-width="1" rx="4"/>

    <!-- Corner Ornaments -->
    <path d="M ${w * 0.04 + 10} ${h * 0.04 + 25} L ${w * 0.04 + 10} ${h * 0.04 + 10} L ${w * 0.04 + 25} ${h * 0.04 + 10}" 
          stroke="url(#gold_foil)" stroke-width="3" fill="none"/>
    <path d="M ${w * 0.96 - 10} ${h * 0.04 + 25} L ${w * 0.96 - 10} ${h * 0.04 + 10} L ${w * 0.96 - 25} ${h * 0.04 + 10}" 
          stroke="url(#gold_foil)" stroke-width="3" fill="none"/>
    <path d="M ${w * 0.04 + 10} ${h * 0.96 - 25} L ${w * 0.04 + 10} ${h * 0.96 - 10} L ${w * 0.04 + 25} ${h * 0.96 - 10}" 
          stroke="url(#gold_foil)" stroke-width="3" fill="none"/>
    <path d="M ${w * 0.96 - 10} ${h * 0.96 - 25} L ${w * 0.96 - 10} ${h * 0.96 - 10} L ${w * 0.96 - 25} ${h * 0.96 - 10}" 
          stroke="url(#gold_foil)" stroke-width="3" fill="none"/>

    <!-- Center Monogram Seal -->
    <circle cx="${w / 2}" cy="${h * 0.38}" r="${Math.min(w, h) * 0.12}" 
            fill="#81252D" fill-opacity="0.6" stroke="url(#gold_foil)" stroke-width="2"/>
    <circle cx="${w / 2}" cy="${h * 0.38}" r="${Math.min(w, h) * 0.10}" 
            fill="none" stroke="rgba(236,210,143,0.3)" stroke-width="1" stroke-dasharray="4 3"/>
    
    <text x="${w / 2}" y="${h * 0.395}" font-family="'Cormorant Garamond', 'Playfair Display', serif" 
          font-size="${Math.min(w, h) * 0.08}" font-style="italic" fill="#FFF4E4" text-anchor="middle" font-weight="600">
      H &amp; M
    </text>

    <!-- Couple Names / Caption -->
    <text x="${w / 2}" y="${h * 0.62}" font-family="'Cormorant SC', 'Cormorant Garamond', serif" 
          font-size="${Math.min(w, h) * 0.055}" letter-spacing="6" fill="#ECD28F" text-anchor="middle" font-weight="600">
      ${title.toUpperCase()}
    </text>

    <line x1="${w / 2 - 80}" y1="${h * 0.66}" x2="${w / 2 + 80}" y2="${h * 0.66}" 
          stroke="url(#gold_foil)" stroke-width="1.5" stroke-opacity="0.8"/>

    <text x="${w / 2}" y="${h * 0.72}" font-family="'Be Vietnam Pro', sans-serif" 
          font-size="${Math.min(w, h) * 0.026}" letter-spacing="2" fill="#FFF4E4" text-anchor="middle" font-weight="400" opacity="0.9">
      ${subtitle}
    </text>

    <text x="${w / 2}" y="${h * 0.88}" font-family="'Cormorant Garamond', serif" 
          font-size="${Math.min(w, h) * 0.024}" letter-spacing="4" fill="#C6A477" text-anchor="middle">
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
        i % 2 === 0 ? '#81252D' : '#691014',
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
