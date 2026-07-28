import { CASE_STATUS_VI, CASE_STATUS_OPTIONS, caseStatusLabel } from '../caseStatus';

describe('caseStatus', () => {
  it('CASE_STATUS_OPTIONS khớp các khóa của bảng nhãn', () => {
    expect(CASE_STATUS_OPTIONS).toEqual(Object.keys(CASE_STATUS_VI));
    expect(CASE_STATUS_OPTIONS).toEqual(
      expect.arrayContaining(['NEW', 'RECEIVED', 'PROCESSING', 'COMPLETED', 'CANCELED'])
    );
  });

  it('caseStatusLabel trả nhãn tiếng Việt', () => {
    expect(caseStatusLabel('NEW')).toBe('Mới');
    expect(caseStatusLabel('COMPLETED')).toBe('Hoàn thành');
    expect(caseStatusLabel('CANCELED')).toBe('Đã hủy');
  });

  it('caseStatusLabel trả — khi null', () => {
    expect(caseStatusLabel(null)).toBe('—');
  });

  it('caseStatusLabel trả nguyên chuỗi khi không biết', () => {
    expect(caseStatusLabel('UNKNOWN_X')).toBe('UNKNOWN_X');
  });

  it('mỗi trạng thái có label và class', () => {
    Object.values(CASE_STATUS_VI).forEach((v) => {
      expect(v.label).toBeTruthy();
      expect(v.cls).toBeTruthy();
    });
  });
});
