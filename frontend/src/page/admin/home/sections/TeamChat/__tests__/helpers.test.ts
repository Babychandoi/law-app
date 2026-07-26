import { initial, fmtListTime, groupMessages } from '../helpers';

describe('initial', () => {
  it('lấy chữ cái đầu viết hoa', () => {
    expect(initial('phong')).toBe('P');
    expect(initial('  an')).toBe('A');
  });
  it('trả về ? khi rỗng', () => {
    expect(initial('')).toBe('?');
    expect(initial('   ')).toBe('?');
  });
});

describe('fmtListTime', () => {
  const NOW = new Date('2026-07-26T12:00:00.000Z').getTime();
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });
  afterEach(() => jest.useRealTimers());

  it('rỗng khi không có giá trị', () => {
    expect(fmtListTime(null)).toBe('');
    expect(fmtListTime(undefined)).toBe('');
  });
  it('"Vừa xong" khi dưới 1 phút', () => {
    expect(fmtListTime(new Date(NOW - 30 * 1000).toISOString())).toBe('Vừa xong');
  });
  it('theo phút khi dưới 1 giờ', () => {
    expect(fmtListTime(new Date(NOW - 5 * 60 * 1000).toISOString())).toBe('5 phút');
  });
  it('theo giờ khi dưới 1 ngày', () => {
    expect(fmtListTime(new Date(NOW - 3 * 3600 * 1000).toISOString())).toBe('3 giờ');
  });
  it('"Hôm qua" khi trong khoảng 1-2 ngày', () => {
    expect(fmtListTime(new Date(NOW - 25 * 3600 * 1000).toISOString())).toBe('Hôm qua');
  });
});

describe('groupMessages', () => {
  const iso = (min: number) => new Date(2026, 0, 1, 10, min).toISOString();
  const msg = (id: string, senderId: string, min: number) => ({
    id,
    senderId,
    createdAt: iso(min),
  });

  it('gộp tin liên tiếp cùng người trong 5 phút', () => {
    const rows = groupMessages([msg('1', 'a', 0), msg('2', 'a', 2)], 'a');
    // Tin 1: đầu cụm, không cuối cụm. Tin 2: cuối cụm, không đầu cụm.
    expect(rows[0].firstOfGroup).toBe(true);
    expect(rows[0].lastOfGroup).toBe(false);
    expect(rows[1].firstOfGroup).toBe(false);
    expect(rows[1].lastOfGroup).toBe(true);
  });

  it('tách cụm khi cách nhau quá 5 phút', () => {
    const rows = groupMessages([msg('1', 'a', 0), msg('2', 'a', 10)], 'a');
    expect(rows[0].lastOfGroup).toBe(true);
    expect(rows[1].firstOfGroup).toBe(true);
  });

  it('tách cụm khi khác người gửi', () => {
    const rows = groupMessages([msg('1', 'a', 0), msg('2', 'b', 1)], 'a');
    expect(rows[0].lastOfGroup).toBe(true);
    expect(rows[1].firstOfGroup).toBe(true);
  });

  it('đánh dấu mine đúng theo meId', () => {
    const rows = groupMessages([msg('1', 'a', 0), msg('2', 'b', 1)], 'a');
    expect(rows[0].mine).toBe(true);
    expect(rows[1].mine).toBe(false);
  });

  it('showTime: tin đầu luôn hiện, và khi cách > 10 phút', () => {
    const rows = groupMessages([msg('1', 'a', 0), msg('2', 'a', 2), msg('3', 'a', 20)], 'a');
    expect(rows[0].showTime).toBe(true); // tin đầu
    expect(rows[1].showTime).toBe(false); // cách 2 phút
    expect(rows[2].showTime).toBe(true); // cách 18 phút
  });
});
