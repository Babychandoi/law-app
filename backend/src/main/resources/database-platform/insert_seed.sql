-- Seed data for services, children services, hero, and company information
-- Run after schema creation.

USE law_app;

INSERT INTO services (id, title, href, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Dịch vụ chính', '/dich-vu', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'Dịch vụ khác', '/dich-vu-khac', NOW(), NOW());

INSERT INTO children_services (id, title, href, parent_service_id, description, icon, image, description_home)
VALUES
  ('31111111-1111-1111-1111-111111111111', 'Đăng ký bảo hộ nhãn hiệu', '/dang-ky-bao-ho-nhan-hieu', '11111111-1111-1111-1111-111111111111', 'Tư vấn và thực hiện thủ tục đăng ký nhãn hiệu.', 'shield', '/assets/images/dangkynhanhieu.webp', 'Hỗ trợ đăng ký nhãn hiệu nhanh chóng, đúng quy trình.'),
  ('32222222-2222-2222-2222-222222222222', 'Đăng ký bảo hộ bản quyền', '/dang-ky-bao-ho-ban-quyen', '11111111-1111-1111-1111-111111111111', 'Bảo hộ quyền tác giả cho tác phẩm sáng tạo.', 'copyright', '/assets/images/dangkybanquyentacgia.webp', 'Đăng ký bản quyền cho nội dung, phần mềm, tác phẩm sáng tạo.'),
  ('33333333-3333-3333-3333-333333333333', 'Bảo hộ kiểu dáng công nghiệp', '/bao-ho-kieu-dang-cong-nghiep', '11111111-1111-1111-1111-111111111111', 'Đăng ký kiểu dáng công nghiệp cho sản phẩm.', 'palette', '/assets/images/doanh-nghiep-khoa-hoc-va-cong-nghe.jpg', 'Bảo vệ hình dáng sản phẩm trước sao chép.'),
  ('34444444-4444-4444-4444-444444444444', 'Bảo hộ sáng chế / giải pháp hữu ích', '/bao-ho-sang-che-giai-phap-huu-ich', '11111111-1111-1111-1111-111111111111', 'Tư vấn hồ sơ sáng chế và giải pháp hữu ích.', 'lightbulb', '/assets/images/human.webp', 'Tăng khả năng bảo hộ ý tưởng và giải pháp kỹ thuật.'),
  ('35555555-5555-5555-5555-555555555555', 'Xử lý xâm phạm', '/xu-ly-xam-pham', '11111111-1111-1111-1111-111111111111', 'Xử lý tranh chấp và xâm phạm quyền sở hữu trí tuệ.', 'gavel', '/assets/images/about-law.webp', 'Bảo vệ quyền lợi khi phát sinh hành vi xâm phạm.'),
  ('36666666-6666-6666-6666-666666666666', 'Mã số mã vạch', '/ma-so-ma-vach', '22222222-2222-2222-2222-222222222222', 'Dịch vụ tư vấn và đăng ký mã số mã vạch.', 'barcode', '/assets/images/masomavach.webp', 'Hỗ trợ đăng ký mã số mã vạch cho doanh nghiệp.'),
  ('37777777-7777-7777-7777-777777777777', 'Giấy phép doanh nghiệp khoa học công nghệ', '/giay-phep-doanh-nghiep-khoa-hoc-cong-nghe', '22222222-2222-2222-2222-222222222222', 'Hồ sơ và thủ tục cấp phép doanh nghiệp KH&CN.', 'flask', '/assets/images/doanh-nghiep-khoa-hoc-va-cong-nghe.jpg', 'Hoàn thiện điều kiện pháp lý cho doanh nghiệp KH&CN.'),
  ('38888888-8888-8888-8888-888888888888', 'Đăng ký giấy phép mạng xã hội', '/dang-ky-giay-phep-mang-xa-hoi', '22222222-2222-2222-2222-222222222222', 'Tư vấn hồ sơ xin giấy phép mạng xã hội.', 'network', '/assets/images/law-team.webp', 'Đảm bảo tuân thủ quy định vận hành nền tảng.'),
  ('39999999-9999-9999-9999-999999999999', 'Tư vấn soạn thảo hợp đồng', '/tu-van-soan-thao-hop-dong', '22222222-2222-2222-2222-222222222222', 'Soạn thảo và rà soát hợp đồng theo nhu cầu.', 'file-contract', '/assets/images/legal-services.webp', 'Chuẩn hóa điều khoản, giảm thiểu rủi ro pháp lý.');

INSERT INTO hero (id, title, subtitle, description, service_id)
VALUES
  ('41111111-1111-1111-1111-111111111111', 'Đăng ký bảo hộ nhãn hiệu', 'Bảo vệ thương hiệu của bạn ngay hôm nay', 'Tư vấn trọn gói từ tra cứu, nộp đơn đến theo dõi quá trình xử lý hồ sơ.', '31111111-1111-1111-1111-111111111111'),
  ('42222222-2222-2222-2222-222222222222', 'Đăng ký bản quyền', 'Bảo hộ quyền tác giả cho tác phẩm sáng tạo', 'Hỗ trợ hồ sơ bản quyền cho tác phẩm, phần mềm, nội dung số và tài liệu.', '32222222-2222-2222-2222-222222222222');

INSERT INTO company (id, name, representative, tax_code, website_name, email)
VALUES
  ('51111111-1111-1111-1111-111111111111', 'Công ty Luật Poip', 'Đại diện công ty', '0100100001', 'luatpoip.com', 'contact@luatpoip.com');

INSERT INTO location (id, type, address, color, company_id)
VALUES
  ('52111111-1111-1111-1111-111111111111', 'headquarter', 'Số 1, Hà Nội, Việt Nam', 0, '51111111-1111-1111-1111-111111111111'),
  ('52222222-2222-2222-2222-222222222222', 'branch', 'Số 2, TP. Hồ Chí Minh, Việt Nam', 1, '51111111-1111-1111-1111-111111111111');

INSERT INTO important (id, text, href, icon, color, company_id)
VALUES
  ('53111111-1111-1111-1111-111111111111', 'Tra cứu nhãn hiệu', '/dang-ky-bao-ho-nhan-hieu', 0, 6, '51111111-1111-1111-1111-111111111111'),
  ('53222222-2222-2222-2222-222222222222', 'Liên hệ tư vấn', '/lien-he', 3, 1, '51111111-1111-1111-1111-111111111111');

INSERT INTO social (id, icon, href, label, color, company_id)
VALUES
  ('54111111-1111-1111-1111-111111111111', 6, 'https://facebook.com/luatpoip', 'Facebook', 0, '51111111-1111-1111-1111-111111111111'),
  ('54222222-2222-2222-2222-222222222222', 8, 'https://zalo.me/luatpoip', 'Zalo', 7, '51111111-1111-1111-1111-111111111111');
