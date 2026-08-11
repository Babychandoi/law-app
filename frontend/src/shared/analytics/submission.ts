/**
 * Mã một lần cho mỗi lần gửi form, đi kèm khi điều hướng sang trang cảm ơn.
 *
 * Trang cảm ơn dùng mã này làm cờ trong sessionStorage để chỉ bắn chuyển đổi đúng một lần.
 * Không có nó thì khách F5 trang cảm ơn bao nhiêu lần là bấy nhiêu chuyển đổi ảo, vì React Router
 * khôi phục lại state điều hướng sau khi tải lại trang.
 */
export function newSubmissionId(): string {
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : undefined;
  if (cryptoObj?.randomUUID) return cryptoObj.randomUUID();
  // Trình duyệt cũ không có randomUUID: chỉ cần đủ duy nhất trong một phiên.
  return `sub-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
