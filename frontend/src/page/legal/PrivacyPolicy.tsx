import { Seo } from '../../component/Seo';
import { contactInfo } from '../../shared/config/site';

/**
 * Trang Chính sách bảo mật thông tin — bố cục & nội dung chuẩn (tham khảo mẫu ngành),
 * điều chỉnh cho Luật Poip Legal + công khai đúng thực tế hệ thống: form tư vấn, chat có
 * trợ lý AI (xử lý bởi nhà cung cấp bên thứ ba), cookie đo lường (Google Analytics/Ads).
 */
export default function PrivacyPolicy() {
  const updated = '01/07/2026';

  return (
    <div className="min-h-screen bg-brand-surface">
      <Seo
        title="Chính sách bảo mật thông tin - Luật Poip Legal"
        description="Chính sách bảo mật thông tin của Luật Poip Legal: thông tin thu thập, mục đích sử dụng, cookie, trợ lý AI, chia sẻ, lưu trữ, quyền của bạn và cách liên hệ."
        keywords="chính sách bảo mật, bảo mật thông tin, quyền riêng tư, Luật Poip Legal"
        type="article"
      />

      {/* Header */}
      <div className="bg-brand-ink py-14 text-center text-white">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-gold">
            Luật Poip Legal
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Chính sách bảo mật thông tin</h1>
          <p className="mt-3 text-sm text-white/70">Cập nhật lần cuối: {updated}</p>
        </div>
      </div>

      {/* Nội dung */}
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div
          className="prose prose-lg max-w-none
            prose-headings:font-semibold prose-headings:text-brand-ink
            prose-h2:mt-10 prose-h2:text-xl
            prose-p:leading-8 prose-p:text-brand-muted
            prose-li:text-brand-muted
            prose-a:text-brand-goldDark prose-a:underline-offset-4
            prose-strong:text-brand-ink"
        >
          <p>
            Luật Poip Legal (“chúng tôi”) tôn trọng và cam kết bảo vệ quyền riêng tư của bạn khi
            truy cập website <strong>luatpoip.com</strong> và sử dụng các dịch vụ của chúng tôi.
            Chính sách này giải thích chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin của
            bạn như thế nào. Khi sử dụng website và dịch vụ, bạn đồng ý với các nội dung dưới đây.
          </p>

          <h2>1. Thông tin chúng tôi thu thập</h2>
          <p>Chúng tôi có thể thu thập các loại thông tin sau:</p>
          <ul>
            <li>
              <strong>Thông tin bạn cung cấp trực tiếp</strong>: họ tên, số điện thoại, email, nhu
              cầu/dịch vụ quan tâm và nội dung bạn gửi qua form tư vấn, form ứng tuyển hoặc khung
              trò chuyện (chat) trên website.
            </li>
            <li>
              <strong>Dữ liệu kỹ thuật</strong>: địa chỉ IP, loại trình duyệt, thiết bị, trang đã
              xem và thời gian truy cập — thu thập tự động qua cookie và công cụ đo lường.
            </li>
          </ul>

          <h2>2. Mục đích sử dụng thông tin</h2>
          <ul>
            <li>Tiếp nhận và phản hồi yêu cầu tư vấn, cung cấp dịch vụ pháp lý bạn quan tâm;</li>
            <li>Liên hệ, chăm sóc khách hàng và hỗ trợ trong quá trình sử dụng dịch vụ;</li>
            <li>Cải thiện chất lượng website, dịch vụ và trải nghiệm người dùng;</li>
            <li>Gửi thông tin, cập nhật khi bạn đã đồng ý nhận;</li>
            <li>Tuân thủ nghĩa vụ theo quy định pháp luật.</li>
          </ul>

          <h2>3. Cookie và công cụ đo lường</h2>
          <p>
            Website sử dụng cookie và các công cụ đo lường của bên thứ ba như{' '}
            <strong>Google Analytics</strong> và <strong>Google Ads</strong> nhằm thống kê lượng
            truy cập, phân tích hành vi ẩn danh và tối ưu quảng cáo. Bạn có thể quản lý hoặc từ chối
            cookie thông qua cài đặt trình duyệt; việc tắt cookie có thể ảnh hưởng tới một số tính
            năng của website.
          </p>

          <h2>4. Trợ lý AI trong khung trò chuyện</h2>
          <p>
            Khung trò chuyện trên website có thể sử dụng <strong>trợ lý AI</strong> để hỗ trợ trả
            lời nhanh; tư vấn viên sẽ tiếp nhận khi cần. Nội dung bạn nhập trong cuộc trò chuyện có
            thể được gửi tới nhà cung cấp dịch vụ AI (bên thứ ba) để tạo phản hồi. Vui lòng{' '}
            <strong>không cung cấp thông tin nhạy cảm</strong> (số CMND/CCCD, tài khoản ngân hàng,
            mật khẩu…) trong khung chat.
          </p>

          <h2>5. Chia sẻ thông tin</h2>
          <p>
            Chúng tôi <strong>không mua bán, cho thuê</strong> thông tin cá nhân của bạn. Thông tin
            chỉ được chia sẻ trong các trường hợp:
          </p>
          <ul>
            <li>Theo yêu cầu hợp pháp của cơ quan nhà nước có thẩm quyền;</li>
            <li>
              Với đối tác/nhà cung cấp dịch vụ hỗ trợ vận hành (lưu trữ, đo lường, dịch vụ AI) trong
              phạm vi cần thiết và có ràng buộc bảo mật;
            </li>
            <li>Khi cần thiết để bảo vệ quyền, lợi ích hợp pháp của bạn và của chúng tôi.</li>
          </ul>

          <h2>6. Lưu trữ và bảo mật</h2>
          <p>
            Thông tin được lưu trữ trong thời gian cần thiết cho mục đích đã nêu hoặc theo quy định
            pháp luật. Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức hợp lý (mã hóa kết nối,
            phân quyền truy cập, kiểm soát nội bộ) để bảo vệ thông tin khỏi truy cập, sử dụng hoặc
            tiết lộ trái phép.
          </p>

          <h2>7. Quyền của bạn</h2>
          <ul>
            <li>Yêu cầu truy cập, chỉnh sửa hoặc cập nhật thông tin cá nhân;</li>
            <li>Yêu cầu xóa thông tin hoặc rút lại sự đồng ý đã cung cấp;</li>
            <li>Từ chối nhận thông tin tiếp thị bất kỳ lúc nào;</li>
            <li>Khiếu nại nếu cho rằng quyền riêng tư của bạn bị ảnh hưởng.</li>
          </ul>
          <p>Để thực hiện các quyền trên, vui lòng liên hệ chúng tôi theo thông tin ở mục 9.</p>

          <h2>8. Thay đổi chính sách</h2>
          <p>
            Chính sách có thể được cập nhật theo thời gian. Phiên bản mới sẽ được đăng tại trang này
            kèm ngày cập nhật. Việc bạn tiếp tục sử dụng website sau khi thay đổi đồng nghĩa với
            việc chấp nhận chính sách đã cập nhật.
          </p>

          <h2>9. Liên hệ</h2>
          <p>Mọi thắc mắc về chính sách bảo mật, vui lòng liên hệ:</p>
          <ul>
            <li>
              <strong>Luật Poip Legal</strong>
            </li>
            <li>
              Hotline: <a href={contactInfo.phoneHref}>{contactInfo.hotline}</a>
            </li>
            <li>
              Email: <a href={contactInfo.emailHref}>{contactInfo.email}</a>
            </li>
            <li>
              Website: <a href="https://luatpoip.com">luatpoip.com</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
