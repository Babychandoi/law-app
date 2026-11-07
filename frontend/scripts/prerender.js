/**
 * Chụp sẵn HTML cho các trang có nội dung viết cứng trong JSX.
 *
 * Vì sao cần: trình quét không chạy JavaScript chỉ thấy vỏ SPA rỗng — không H1, khoảng 150 từ.
 * Các trang khác lấy nội dung từ DB nên backend dựng lại được (xem các controller /og/**), riêng
 * /ve-chung-toi, /lien-he, /chinh-sach-bao-mat thì câu chữ nằm trong component.
 *
 * Vì sao KHÔNG chép câu chữ sang backend: sẽ có hai bản dễ lệch nhau, mà bản cho bot khác bản cho
 * người chính là cloaking. Chụp lại chính trang thật thì không bao giờ lệch được.
 *
 * Chạy tự động sau `npm run build` (npm tự gọi postbuild). Không có Chrome thì bỏ qua và cảnh báo,
 * không làm hỏng build.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

const BUILD = path.join(__dirname, '..', 'build');
const OUT = path.join(BUILD, '__prerender');
const PROFILE = path.join(__dirname, '..', '.prerender-profile');
const PORT = 4173;
const CHROME_TIMEOUT_MS = 90000;

const ROUTES = [
  { route: '/ve-chung-toi', file: 've-chung-toi.html' },
  { route: '/lien-he', file: 'lien-he.html' },
  { route: '/chinh-sach-bao-mat', file: 'chinh-sach-bao-mat.html' },
];

// Ngưỡng để không bao giờ ghi ra một bản chụp hỏng. Trang chụp lỗi mà vẫn đem phục vụ Google thì
// còn tệ hơn vỏ SPA, vì nó trông như nội dung thật.
const MIN_WORDS = 250;

function findChrome() {
  if (process.env.PRERENDER_CHROME) return process.env.PRERENDER_CHROME;
  // Dùng gạch chéo xuôi: Node trên Windows chấp nhận, còn gạch ngược thì dễ bị nuốt khi file được
  // sinh qua shell.
  const dirs = [
    process.env.PROGRAMFILES,
    process.env['PROGRAMFILES(X86)'],
    process.env.LOCALAPPDATA,
    'C:/Program Files',
    'C:/Program Files (x86)',
  ].filter(Boolean);
  const candidates = [];
  for (const d of dirs) {
    const base = d.split(String.fromCharCode(92)).join('/');
    candidates.push(base + '/Google/Chrome/Application/chrome.exe');
    candidates.push(base + '/Microsoft/Edge/Application/msedge.exe');
  }
  candidates.push('/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser');
  return candidates.find((p) => fs.existsSync(p));
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function serve() {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let file = path.join(BUILD, urlPath);
    // SPA fallback: mọi đường dẫn không phải file tĩnh đều trả index.html, giống nginx.
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(BUILD, 'index.html');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
}

/**
 * Chạy Chrome KHÔNG chặn vòng lặp sự kiện.
 *
 * Hai cái bẫy đã gặp, đừng đổi lại:
 *  - spawnSync sẽ chặn tiến trình này, mà máy chủ tĩnh cũng chạy ở đây — Chrome xin file thì không
 *    ai trả lời, và nó treo tới hết timeout.
 *  - Bắt stdout bằng pipe thì trên Windows Chrome không xả dữ liệu, kết quả rỗng. Cho nó ghi thẳng
 *    ra file.
 */
function dumpDom(chrome, url, outFile) {
  return new Promise((resolve) => {
    const fd = fs.openSync(outFile, 'w');
    const child = spawn(
      chrome,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-background-networking',
        '--disable-extensions',
        '--mute-audio',
        '--virtual-time-budget=15000',
        '--user-data-dir=' + PROFILE,
        '--dump-dom',
        url,
      ],
      { stdio: ['ignore', fd, 'ignore'] }
    );
    // Trang có video hoặc iframe bên ngoài có thể giữ Chrome chạy mãi; bước chụp sẵn không được
    // phép treo cả bản build.
    const timer = setTimeout(() => child.kill('SIGKILL'), CHROME_TIMEOUT_MS);
    const done = (err) => {
      clearTimeout(timer);
      try {
        fs.closeSync(fd);
      } catch (e) {
        /* đã đóng */
      }
      resolve(err || null);
    };
    child.on('error', done);
    child.on('exit', () => done(null));
  });
}

/**
 * react-head CHÈN THÊM thẻ chứ không thay thẻ có sẵn, nên DOM chụp được có hai <title> và hai meta
 * description. Trình quét lấy thẻ ĐẦU TIÊN — tức là bản mặc định, không phải bản của trang. Bỏ các
 * thẻ trùng phía trước, giữ lại thẻ cuối.
 */
function keepLastHeadTag(html, pattern) {
  const matches = [...html.matchAll(pattern)];
  if (matches.length < 2) return html;
  let out = html;
  for (let i = matches.length - 2; i >= 0; i -= 1) {
    const m = matches[i];
    out = out.slice(0, m.index) + out.slice(m.index + m[0].length);
  }
  return out;
}

function wordCount(html) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

async function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.warn(
      '[prerender] Khong tim thay Chrome/Edge — BO QUA buoc chup san.\n' +
        '            Ba trang /ve-chung-toi, /lien-he, /chinh-sach-bao-mat se lai phuc vu vo SPA\n' +
        '            rong cho trinh quet. Dat bien PRERENDER_CHROME neu Chrome nam cho khac.'
    );
    return 0;
  }
  if (!fs.existsSync(path.join(BUILD, 'index.html'))) {
    console.error('[prerender] Chua co build/index.html — chay `npm run build` truoc.');
    return 1;
  }

  const server = serve();
  await new Promise((resolve) => {
    // Cổng bận thì lấy cổng ngẫu nhiên: bước chụp sẵn không được hỏng build chỉ vì máy đang chạy
    // một tiến trình khác giữ cổng 4173.
    server.on('error', (e) => {
      if (e.code === 'EADDRINUSE') server.listen(0, '127.0.0.1');
      else throw e;
    });
    server.on('listening', resolve);
    server.listen(PORT, '127.0.0.1');
  });

  fs.mkdirSync(OUT, { recursive: true });
  fs.rmSync(PROFILE, { recursive: true, force: true });
  const base = 'http://127.0.0.1:' + server.address().port;
  let failed = 0;

  for (const { route, file } of ROUTES) {
    const tmp = path.join(OUT, file + '.tmp');
    const err = await dumpDom(chrome, base + route, tmp);
    if (err) console.error('[prerender] ' + route + ': Chrome loi — ' + err.message);

    let html = fs.existsSync(tmp) ? fs.readFileSync(tmp, 'utf8') : '';
    fs.rmSync(tmp, { force: true });
    html = keepLastHeadTag(html, /<title>[\s\S]*?<\/title>/g);
    html = keepLastHeadTag(html, /<meta\s+name="description"[^>]*>/g);

    const words = wordCount(html);
    const hasH1 = /<h1[\s>]/i.test(html);
    if (!hasH1 || words < MIN_WORDS) {
      console.error(
        '[prerender] ' + route + ': ban chup KHONG dat (h1=' + hasH1 + ', so tu=' + words + ')' +
          ' — khong ghi file.'
      );
      failed += 1;
      continue;
    }
    fs.writeFileSync(path.join(OUT, file), html);
    console.log('[prerender] ' + route + ' -> __prerender/' + file + ' (' + words + ' tu)');
  }

  fs.rmSync(PROFILE, { recursive: true, force: true });
  server.close();
  return failed ? 1 : 0;
}

main().then((code) => process.exit(code));
