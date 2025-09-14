const fs = require("fs");
const path = require("path");

// SVG 아이콘을 PNG로 변환하는 간단한 스크립트
// 실제 프로덕션에서는 sharp나 다른 이미지 라이브러리를 사용하는 것이 좋습니다.

const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];

const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- 배경 원 -->
  <circle cx="256" cy="256" r="256" fill="#FEF7ED"/>
  
  <!-- 가계부 아이콘 - 돈과 차트 -->
  <g transform="translate(128, 128)">
    <!-- 동전들 -->
    <circle cx="80" cy="80" r="30" fill="#F3E8FF" stroke="#8B5CF6" stroke-width="4"/>
    <circle cx="80" cy="80" r="20" fill="#8B5CF6"/>
    <text x="80" y="88" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" font-weight="bold">₩</text>
    
    <!-- 차트 바 -->
    <rect x="40" y="140" width="20" height="60" fill="#10B981" rx="4"/>
    <rect x="70" y="120" width="20" height="80" fill="#3B82F6" rx="4"/>
    <rect x="100" y="100" width="20" height="100" fill="#F59E0B" rx="4"/>
    
    <!-- 차트 라인 -->
    <path d="M30 180 L50 160 L80 140 L110 120 L140 100" stroke="#6B7280" stroke-width="3" fill="none"/>
    
    <!-- 작은 동전들 -->
    <circle cx="40" cy="200" r="15" fill="#F3E8FF" stroke="#8B5CF6" stroke-width="2"/>
    <circle cx="40" cy="200" r="10" fill="#8B5CF6"/>
    <text x="40" y="205" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold">₩</text>
    
    <circle cx="120" cy="200" r="15" fill="#F3E8FF" stroke="#8B5CF6" stroke-width="2"/>
    <circle cx="120" cy="200" r="10" fill="#8B5CF6"/>
    <text x="120" y="205" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="10" font-weight="bold">₩</text>
  </g>
</svg>`;

// 아이콘 디렉토리 생성
const iconsDir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 각 크기별로 SVG 파일 생성 (실제로는 PNG로 변환해야 하지만, 여기서는 SVG로 대체)
iconSizes.forEach((size) => {
  const svgWithSize = svgContent.replace(
    'width="512" height="512"',
    `width="${size}" height="${size}"`
  );
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(iconsDir, filename);

  fs.writeFileSync(filepath, svgWithSize);
  console.log(`Created ${filename}`);
});

// PNG 파일들을 위한 플레이스홀더 생성
iconSizes.forEach((size) => {
  const filename = `icon-${size}x${size}.png`;
  const filepath = path.join(iconsDir, filename);

  // 간단한 PNG 플레이스홀더 (실제로는 SVG를 PNG로 변환해야 함)
  const placeholderContent = `# PNG 아이콘 플레이스홀더
# 실제 사용을 위해서는 SVG를 PNG로 변환해야 합니다.
# 온라인 도구나 sharp 라이브러리를 사용하여 변환하세요.
# 크기: ${size}x${size}px`;

  fs.writeFileSync(filepath, placeholderContent);
  console.log(`Created placeholder for ${filename}`);
});

console.log("\n아이콘 생성 완료!");
console.log(
  "실제 PNG 파일을 생성하려면 온라인 SVG to PNG 변환 도구를 사용하거나 sharp 라이브러리를 설치하세요."
);
