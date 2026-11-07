const fs=require('fs'), path=require('path');
const OUT=path.join(process.env.HOME,'svc-img');

// Bang mau lay dung tu tailwind.config.js cua du an
const INK='#171717', GOLD='#c7942c', PALE='#ead5a8';

// Icon ve bang net (stroke), toa do tren luoi 48x48, se duoc phong to va can giua.
const ICONS = {
  'dang-ky-sang-che': {
    rot: 13,
    paths: [
      'M24 6 C15 6 9 12.5 9 20.5 C9 26 12 29.5 14.5 32.5 C16 34.3 16.5 35.5 16.7 38 L31.3 38 C31.5 35.5 32 34.3 33.5 32.5 C36 29.5 39 26 39 20.5 C39 12.5 33 6 24 6 Z',
      'M18.5 42 L29.5 42',
      'M20 45.5 L28 45.5',
      'M24 20 L24 33',
      'M19 25 L24 20 L29 25',
    ],
  },
  'gia-han-chuyen-nhuong-van-bang': {
    rot: -9,
    paths: [
      'M10 4 L26 4 L32 10 L32 32 L10 32 Z',
      'M26 4 L26 10 L32 10',
      'M15 16 L27 16',
      'M15 21 L27 21',
      'M15 26 L22 26',
      'M34 32 A6 6 0 1 1 33.9 32',
      'M34 35 A3 3 0 1 1 33.9 35',
      'M30.5 43 L30.5 47.5 L34 45.5 L37.5 47.5 L37.5 43',
    ],
  },
  'doanh-nghiep-khoa-hoc-cong-nghe': {
    rot: 21,
    paths: [
      'M24 8 L27.5 18.5 L38 22 L27.5 25.5 L24 36 L20.5 25.5 L10 22 L20.5 18.5 Z',
      'M37 33 L38.6 37.4 L43 39 L38.6 40.6 L37 45 L35.4 40.6 L31 39 L35.4 37.4 Z',
      'M12 32 L13 35 L16 36 L13 37 L12 40 L11 37 L8 36 L11 35 Z',
    ],
  },
  'tu-van-phap-ly-doanh-nghiep': {
    rot: -15,
    paths: [
      'M7 16 L41 16 L41 41 L7 41 Z',
      'M18 16 L18 11 A2 2 0 0 1 20 9 L28 9 A2 2 0 0 1 30 11 L30 16',
      'M7 26 L41 26',
      'M21 26 L21 30 L27 30 L27 26',
    ],
  },
};

const W=1200, H=821;

function svg(slug, cfg){
  const cx=W/2, cy=H/2;
  const S=9.2;               // he so phong icon tu luoi 48 -> ~440px
  const ox=cx-24*S, oy=cy-24*S-18;

  // Cac khung vuong xoay, nhac lai hoa tiet o hero cua landing tong hop
  const frames=[0,1,2].map(i=>{
    const size=520-i*110;
    return `<rect x="${cx-size/2}" y="${cy-size/2}" width="${size}" height="${size}" `+
           `transform="rotate(${cfg.rot} ${cx} ${cy})" fill="none" `+
           `stroke="${GOLD}" stroke-opacity="${0.16-i*0.04}" stroke-width="1.5"/>`;
  }).join('\n    ');

  const icon=cfg.paths.map(d=>
    `<path d="${d}" fill="none" stroke="${GOLD}" stroke-width="1.7" `+
    `stroke-linecap="round" stroke-linejoin="round"/>`).join('\n      ');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img">
  <defs>
    <radialGradient id="g" cx="50%" cy="42%" r="62%">
      <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${INK}"/>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <g>
    ${frames}
  </g>
  <g transform="translate(${ox} ${oy}) scale(${S})">
      ${icon}
  </g>
  <rect x="${cx-70}" y="${H-150}" width="140" height="2" fill="${PALE}" fill-opacity="0.55"/>
</svg>
`;
}

let n=0;
for(const [slug,cfg] of Object.entries(ICONS)){
  fs.writeFileSync(path.join(OUT, slug+'.svg'), svg(slug,cfg));
  n++;
}
console.log('da tao', n, 'anh SVG tai', OUT);
