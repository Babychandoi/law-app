/**
 * Migrate nội dung 9 trang dịch vụ hardcode vào DB qua API admin.
 *
 * Cách chạy:
 *   node scripts/migrate-services/run.mjs <admin_username> <admin_password> [apiBase]
 *
 * Mặc định apiBase = https://api.luatpoip.com
 * Script idempotent: chạy lại sẽ GHI ĐÈ (replace-all) nội dung từng phần.
 */
import { services } from './data.mjs';

const [, , username, password, apiBase = 'https://api.luatpoip.com'] = process.argv;

if (!username || !password) {
  console.error('Cách dùng: node run.mjs <admin_username> <admin_password> [apiBase]');
  process.exit(1);
}

const api = async (path, options = {}, token) => {
  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || (body.code && body.code !== 200 && body.code !== 1000)) {
    throw new Error(`${path} -> HTTP ${res.status} ${JSON.stringify(body).slice(0, 200)}`);
  }
  return body;
};

const main = async () => {
  console.log(`API: ${apiBase}`);
  console.log('Đăng nhập admin...');
  const login = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  const token = login.data?.token;
  if (!token) throw new Error('Không lấy được token: ' + JSON.stringify(login).slice(0, 200));
  console.log('Đăng nhập OK.\n');

  const children = (await api('/service/children')).data || [];
  const byHref = new Map(children.map((c) => [c.href, c]));

  let ok = 0;
  for (const svc of services) {
    const child = byHref.get(svc.href);
    if (!child) {
      console.warn(`!! Bỏ qua ${svc.href} — không tìm thấy dịch vụ trong DB`);
      continue;
    }
    process.stdout.write(`Migrate ${svc.href} (${child.title}) ... `);
    if (svc.hero) {
      await api(`/service/children/${child.id}/hero`, {
        method: 'PUT',
        body: JSON.stringify(svc.hero),
      }, token);
    }
    await api(`/service/children/${child.id}/sections`, {
      method: 'PUT',
      body: JSON.stringify(svc.sections || []),
    }, token);
    await api(`/service/children/${child.id}/process`, {
      method: 'PUT',
      body: JSON.stringify(svc.process || []),
    }, token);
    await api(`/service/children/${child.id}/pricing`, {
      method: 'PUT',
      body: JSON.stringify(svc.pricing || []),
    }, token);
    console.log(
      `OK (hero=${svc.hero ? 1 : 0}, sections=${(svc.sections || []).length}, process=${(svc.process || []).length}, pricing=${(svc.pricing || []).length})`
    );
    ok++;
  }
  console.log(`\nHoàn tất: ${ok}/${services.length} dịch vụ.`);
};

main().catch((e) => {
  console.error('\nLỖI:', e.message);
  process.exit(1);
});
