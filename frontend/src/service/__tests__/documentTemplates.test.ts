import { normalizePage } from '../documentTemplates';

describe('documentTemplateService compatibility', () => {
  it('chuẩn hóa API danh sách cũ thành PageResponse', () => {
    const result = normalizePage([{ id: 'one' }, { id: 'two' }], 0, 10);
    expect(result.content).toHaveLength(2);
    expect(result.totalElements).toBe(2);
    expect(result.first).toBe(true);
    expect(result.last).toBe(true);
  });

  it('giữ nguyên metadata từ PageResponse mới', () => {
    const result = normalizePage(
      {
        content: [{ id: 'one' }],
        page: 2,
        size: 1,
        totalElements: 4,
        totalPages: 4,
        first: false,
        last: false,
      },
      0,
      20
    );
    expect(result.page).toBe(2);
    expect(result.totalPages).toBe(4);
  });
});
