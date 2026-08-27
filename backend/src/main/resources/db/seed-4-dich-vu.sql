-- ============================================================================
-- Bổ sung 4 dịch vụ còn thiếu trong DB.
--
-- Bốn dịch vụ này đang được quảng cáo và được giới thiệu trên landing tổng hợp,
-- nhưng KHÔNG có trong DB — nên form thu lead không có mục để khách chọn và
-- trang dịch vụ tương ứng trả 404. Riêng "Sáng chế" còn là một dòng tiêu đề
-- đang chạy quảng cáo có trả tiền.
--
-- LƯU Ý VỀ NỘI DUNG: câu chữ ở đây bám theo quy định chung của pháp luật sở hữu
-- trí tuệ Việt Nam và CỐ Ý không nêu mức phí cụ thể, không cam kết kết quả, các
-- mốc thời gian đều diễn đạt tương đối. Luật sư phụ trách cần rà lại trước khi
-- chạy quảng cáo dẫn vào các trang này.
--
-- Chạy lại nhiều lần được: mọi INSERT đều có điều kiện NOT EXISTS theo id.
-- ============================================================================

SET NAMES utf8mb4;

-- ---------------------------------------------------------------------------
-- 1. SÁNG CHẾ & GIẢI PHÁP HỮU ÍCH
-- ---------------------------------------------------------------------------
INSERT INTO ChildrenServices (id, title, href, description, descriptionHome, icon, parent_service_id)
SELECT '41111111-1111-1111-1111-111111111111',
       'Đăng ký sáng chế, giải pháp hữu ích',
       '/dang-ky-sang-che',
       'Bảo hộ độc quyền giải pháp kỹ thuật của doanh nghiệp.',
       'Tra cứu, soạn bản mô tả và theo đuổi đơn sáng chế đến khi có văn bằng.',
       'lightbulb',
       '11111111-1111-1111-1111-111111111111'
WHERE NOT EXISTS (SELECT 1 FROM ChildrenServices WHERE id = '41111111-1111-1111-1111-111111111111');

INSERT INTO Hero (id, title, subtitle, description, service_id)
SELECT '4111a000-0000-0000-0000-000000000001',
       'Dịch vụ đăng ký sáng chế và giải pháp hữu ích',
       'Poip Legal Law',
       'Sáng chế là tài sản kỹ thuật có giá trị lớn nhất mà doanh nghiệp tạo ra. Poip Legal tra cứu khả năng bảo hộ, soạn bản mô tả và yêu cầu bảo hộ, rồi theo đuổi đơn qua từng giai đoạn thẩm định.',
       '41111111-1111-1111-1111-111111111111'
WHERE NOT EXISTS (SELECT 1 FROM Hero WHERE id = '4111a000-0000-0000-0000-000000000001');

INSERT INTO service_section (id, type, title, subtitle, sortOrder, service_id)
SELECT '4111b000-0000-0000-0000-000000000001', 'comparison',
       'SÁNG CHẾ VÀ GIẢI PHÁP HỮU ÍCH KHÁC NHAU THẾ NÀO?',
       'Chọn đúng hình thức ngay từ đầu quyết định khả năng được cấp văn bằng.',
       0, '41111111-1111-1111-1111-111111111111'
WHERE NOT EXISTS (SELECT 1 FROM service_section WHERE id = '4111b000-0000-0000-0000-000000000001');

INSERT INTO service_section_item (id, title, description, secondary, sortOrder, section_id)
SELECT * FROM (
  SELECT '4111c000-0000-0000-0000-000000000001' AS id, 'Yêu cầu về trình độ sáng tạo' AS title,
         'Sáng chế phải là bước tiến sáng tạo, không hiển nhiên với người có hiểu biết trung bình trong lĩnh vực.' AS description,
         'Giải pháp hữu ích không đặt ra yêu cầu về trình độ sáng tạo.' AS secondary, 0 AS sortOrder,
         '4111b000-0000-0000-0000-000000000001' AS section_id
  UNION ALL SELECT '4111c000-0000-0000-0000-000000000002', 'Thời hạn bảo hộ',
         'Bằng độc quyền sáng chế có hiệu lực 20 năm kể từ ngày nộp đơn.',
         'Bằng độc quyền giải pháp hữu ích có hiệu lực 10 năm kể từ ngày nộp đơn.', 1,
         '4111b000-0000-0000-0000-000000000001'
  UNION ALL SELECT '4111c000-0000-0000-0000-000000000003', 'Thời gian thẩm định',
         'Thường kéo dài vài năm do phải thẩm định nội dung kỹ thuật.',
         'Ngắn hơn sáng chế vì phạm vi thẩm định hẹp hơn.', 2,
         '4111b000-0000-0000-0000-000000000001'
  UNION ALL SELECT '4111c000-0000-0000-0000-000000000004', 'Nên chọn khi nào',
         'Khi giải pháp có tính đột phá rõ rệt và doanh nghiệp muốn rào cản dài hạn.',
         'Khi giải pháp mang tính cải tiến, cần được bảo hộ nhanh và chắc chắn hơn.', 3,
         '4111b000-0000-0000-0000-000000000001'
) t WHERE NOT EXISTS (SELECT 1 FROM service_section_item WHERE id = '4111c000-0000-0000-0000-000000000001');

INSERT INTO service_section (id, type, title, subtitle, sortOrder, service_id)
SELECT '4111b000-0000-0000-0000-000000000002', 'conditions',
       'Điều kiện để được cấp văn bằng',
       'Ba điều kiện dưới đây được xét độc lập; thiếu một là đơn bị từ chối.',
       1, '41111111-1111-1111-1111-111111111111'
WHERE NOT EXISTS (SELECT 1 FROM service_section WHERE id = '4111b000-0000-0000-0000-000000000002');

INSERT INTO service_section_item (id, title, description, sortOrder, section_id)
SELECT * FROM (
  SELECT '4111c000-0000-0000-0000-000000000011' AS id, 'Có tính mới' AS title,
         'Giải pháp chưa bị bộc lộ công khai ở bất kỳ đâu trước ngày nộp đơn — kể cả do chính tác giả công bố. Đây là lý do không nên giới thiệu sản phẩm ra thị trường trước khi nộp đơn.' AS description,
         0 AS sortOrder, '4111b000-0000-0000-0000-000000000002' AS section_id
  UNION ALL SELECT '4111c000-0000-0000-0000-000000000012', 'Có khả năng áp dụng công nghiệp',
         'Giải pháp phải chế tạo hoặc sử dụng lặp lại được và cho kết quả ổn định, không dừng ở mức ý tưởng.', 1,
         '4111b000-0000-0000-0000-000000000002'
  UNION ALL SELECT '4111c000-0000-0000-0000-000000000013', 'Có trình độ sáng tạo',
         'Chỉ áp dụng với sáng chế. Giải pháp không được hiển nhiên với người có hiểu biết trung bình trong lĩnh vực kỹ thuật tương ứng.', 2,
         '4111b000-0000-0000-0000-000000000002'
) t WHERE NOT EXISTS (SELECT 1 FROM service_section_item WHERE id = '4111c000-0000-0000-0000-000000000011');

INSERT INTO service_section (id, type, title, subtitle, sortOrder, service_id)
SELECT '4111b000-0000-0000-0000-000000000003', 'benefits',
       'GIÁ TRỊ CỦA MỘT BẰNG ĐỘC QUYỀN',
       NULL, 2, '41111111-1111-1111-1111-111111111111'
WHERE NOT EXISTS (SELECT 1 FROM service_section WHERE id = '4111b000-0000-0000-0000-000000000003');

INSERT INTO service_section_item (id, title, description, sortOrder, section_id)
SELECT * FROM (
  SELECT '4111c000-0000-0000-0000-000000000021' AS id, 'Độc quyền khai thác' AS title,
         'Trong thời hạn bảo hộ, không ai được sản xuất, sử dụng hay kinh doanh giải pháp của bạn nếu chưa được cho phép.' AS description,
         0 AS sortOrder, '4111b000-0000-0000-0000-000000000003' AS section_id
  UNION ALL SELECT '4111c000-0000-0000-0000-000000000022', 'Rào cản kỹ thuật với đối thủ',
         'Đối thủ buộc phải đi đường vòng hoặc đàm phán li-xăng, thay vì sao chép trực tiếp.', 1,
         '4111b000-0000-0000-0000-000000000003'
  UNION ALL SELECT '4111c000-0000-0000-0000-000000000023', 'Tài sản định giá được',
         'Văn bằng có thể chuyển nhượng, góp vốn hoặc cấp phép để tạo nguồn thu.', 2,
         '4111b000-0000-0000-0000-000000000003'
  UNION ALL SELECT '4111c000-0000-0000-0000-000000000024', 'Lợi thế khi gọi vốn',
         'Nhà đầu tư đánh giá cao doanh nghiệp sở hữu tài sản trí tuệ đã được bảo hộ.', 3,
         '4111b000-0000-0000-0000-000000000003'
) t WHERE NOT EXISTS (SELECT 1 FROM service_section_item WHERE id = '4111c000-0000-0000-0000-000000000021');

INSERT INTO Process (id, step, title, description, sortOrder, service_id)
SELECT * FROM (
  SELECT '4111d000-0000-0000-0000-000000000001' AS id, 'BƯỚC 1' AS step, 'Tra cứu và đánh giá khả năng bảo hộ' AS title,
         'Đối chiếu giải pháp với các đơn và văn bằng đã công bố để đánh giá tính mới và trình độ sáng tạo trước khi đầu tư vào hồ sơ.' AS description,
         0 AS sortOrder, '41111111-1111-1111-1111-111111111111' AS service_id
  UNION ALL SELECT '4111d000-0000-0000-0000-000000000002', 'BƯỚC 2', 'Soạn bản mô tả và yêu cầu bảo hộ',
         'Đây là bước quyết định phạm vi độc quyền. Viết quá hẹp thì dễ bị đi vòng, quá rộng thì bị từ chối.', 1,
         '41111111-1111-1111-1111-111111111111'
  UNION ALL SELECT '4111d000-0000-0000-0000-000000000003', 'BƯỚC 3', 'Nộp đơn và theo dõi thẩm định',
         'Xử lý thông báo thiếu sót, ý kiến phản đối và các yêu cầu bổ sung phát sinh trong quá trình thẩm định hình thức và nội dung.', 2,
         '41111111-1111-1111-1111-111111111111'
  UNION ALL SELECT '4111d000-0000-0000-0000-000000000004', 'BƯỚC 4', 'Nhận văn bằng và duy trì hiệu lực',
         'Bàn giao văn bằng và nhắc lịch nộp phí duy trì hằng năm — bỏ lỡ kỳ hạn là văn bằng chấm dứt hiệu lực.', 3,
         '41111111-1111-1111-1111-111111111111'
) t WHERE NOT EXISTS (SELECT 1 FROM Process WHERE id = '4111d000-0000-0000-0000-000000000001');

-- ---------------------------------------------------------------------------
-- 2. GIA HẠN & CHUYỂN NHƯỢNG VĂN BẰNG
-- ---------------------------------------------------------------------------
INSERT INTO ChildrenServices (id, title, href, description, descriptionHome, icon, parent_service_id)
SELECT '42222222-2222-2222-2222-222222222222',
       'Gia hạn, chuyển nhượng văn bằng',
       '/gia-han-chuyen-nhuong-van-bang',
       'Duy trì hiệu lực và sang tên văn bằng sở hữu công nghiệp.',
       'Rà soát hiệu lực, gia hạn đúng hạn và ghi nhận chuyển nhượng, thay đổi chủ văn bằng.',
       'award',
       '11111111-1111-1111-1111-111111111111'
WHERE NOT EXISTS (SELECT 1 FROM ChildrenServices WHERE id = '42222222-2222-2222-2222-222222222222');

INSERT INTO Hero (id, title, subtitle, description, service_id)
SELECT '4222a000-0000-0000-0000-000000000001',
       'Gia hạn và chuyển nhượng văn bằng sở hữu công nghiệp',
       'Poip Legal Law',
       'Văn bằng hết hiệu lực là mất quyền độc quyền đã dày công gây dựng, và thường không lấy lại được. Poip Legal rà soát hiệu lực, nhắc hạn và thực hiện thủ tục gia hạn, chuyển nhượng, thay đổi thông tin chủ văn bằng.',
       '42222222-2222-2222-2222-222222222222'
WHERE NOT EXISTS (SELECT 1 FROM Hero WHERE id = '4222a000-0000-0000-0000-000000000001');

INSERT INTO service_section (id, type, title, subtitle, sortOrder, service_id)
SELECT '4222b000-0000-0000-0000-000000000001', 'cards',
       'CÁC THỦ TỤC THƯỜNG GẶP',
       'Mỗi thủ tục có hồ sơ và thời hạn riêng.',
       0, '42222222-2222-2222-2222-222222222222'
WHERE NOT EXISTS (SELECT 1 FROM service_section WHERE id = '4222b000-0000-0000-0000-000000000001');

INSERT INTO service_section_item (id, title, description, sortOrder, section_id)
SELECT * FROM (
  SELECT '4222c000-0000-0000-0000-000000000001' AS id, 'Gia hạn hiệu lực nhãn hiệu' AS title,
         'Giấy chứng nhận đăng ký nhãn hiệu có hiệu lực 10 năm và được gia hạn nhiều lần, mỗi lần 10 năm. Nộp đúng cửa sổ thời gian trước khi hết hạn là điều kiện bắt buộc.' AS description,
         0 AS sortOrder, '4222b000-0000-0000-0000-000000000001' AS section_id
  UNION ALL SELECT '4222c000-0000-0000-0000-000000000002', 'Gia hạn kiểu dáng công nghiệp',
         'Bằng độc quyền kiểu dáng công nghiệp có hiệu lực 5 năm và được gia hạn tối đa hai lần liên tiếp, mỗi lần 5 năm.', 1,
         '4222b000-0000-0000-0000-000000000001'
  UNION ALL SELECT '4222c000-0000-0000-0000-000000000003', 'Duy trì hiệu lực sáng chế',
         'Khác với gia hạn, văn bằng sáng chế phải nộp phí duy trì theo từng năm. Bỏ lỡ một kỳ là hiệu lực chấm dứt.', 2,
         '4222b000-0000-0000-0000-000000000001'
  UNION ALL SELECT '4222c000-0000-0000-0000-000000000004', 'Chuyển nhượng quyền sở hữu',
         'Sang tên văn bằng cho cá nhân hoặc pháp nhân khác. Hợp đồng chuyển nhượng phải được đăng ký mới có hiệu lực pháp lý với bên thứ ba.', 3,
         '4222b000-0000-0000-0000-000000000001'
  UNION ALL SELECT '4222c000-0000-0000-0000-000000000005', 'Chuyển quyền sử dụng (li-xăng)',
         'Cho phép bên khác khai thác trong phạm vi và thời hạn thỏa thuận mà vẫn giữ quyền sở hữu.', 4,
         '4222b000-0000-0000-0000-000000000001'
  UNION ALL SELECT '4222c000-0000-0000-0000-000000000006', 'Sửa đổi thông tin chủ văn bằng',
         'Cập nhật khi doanh nghiệp đổi tên, đổi địa chỉ hoặc tái cơ cấu. Thông tin sai lệch gây rắc rối khi cần thực thi quyền.', 5,
         '4222b000-0000-0000-0000-000000000001'
) t WHERE NOT EXISTS (SELECT 1 FROM service_section_item WHERE id = '4222c000-0000-0000-0000-000000000001');

INSERT INTO service_section (id, type, title, subtitle, sortOrder, service_id)
SELECT '4222b000-0000-0000-0000-000000000002', 'benefits',
       'VÌ SAO NÊN GIAO CHO ĐƠN VỊ CHUYÊN TRÁCH',
       NULL, 1, '42222222-2222-2222-2222-222222222222'
WHERE NOT EXISTS (SELECT 1 FROM service_section WHERE id = '4222b000-0000-0000-0000-000000000002');

INSERT INTO service_section_item (id, title, description, sortOrder, section_id)
SELECT * FROM (
  SELECT '4222c000-0000-0000-0000-000000000011' AS id, 'Không bỏ lỡ kỳ hạn' AS title,
         'Poip Legal theo dõi và nhắc trước kỳ hạn của từng văn bằng, thay vì phụ thuộc vào trí nhớ nội bộ.' AS description,
         0 AS sortOrder, '4222b000-0000-0000-0000-000000000002' AS section_id
  UNION ALL SELECT '4222c000-0000-0000-0000-000000000012', 'Hồ sơ đúng ngay lần đầu',
         'Hồ sơ thiếu sót làm kéo dài thủ tục và có thể vượt qua thời hạn cho phép.', 1,
         '4222b000-0000-0000-0000-000000000002'
  UNION ALL SELECT '4222c000-0000-0000-0000-000000000013', 'Rà soát toàn bộ danh mục',
         'Doanh nghiệp có nhiều văn bằng thường không nắm hết tình trạng hiệu lực. Chúng tôi lập bảng theo dõi tập trung.', 2,
         '4222b000-0000-0000-0000-000000000002'
  UNION ALL SELECT '4222c000-0000-0000-0000-000000000014', 'Hợp đồng chặt chẽ',
         'Với chuyển nhượng và li-xăng, điều khoản phạm vi và thanh toán được soạn kỹ để tránh tranh chấp về sau.', 3,
         '4222b000-0000-0000-0000-000000000002'
) t WHERE NOT EXISTS (SELECT 1 FROM service_section_item WHERE id = '4222c000-0000-0000-0000-000000000011');

INSERT INTO Process (id, step, title, description, sortOrder, service_id)
SELECT * FROM (
  SELECT '4222d000-0000-0000-0000-000000000001' AS id, 'BƯỚC 1' AS step, 'Rà soát hiệu lực văn bằng' AS title,
         'Kiểm tra tình trạng, thời hạn còn lại và các nghĩa vụ chưa hoàn thành của từng văn bằng.' AS description,
         0 AS sortOrder, '42222222-2222-2222-2222-222222222222' AS service_id
  UNION ALL SELECT '4222d000-0000-0000-0000-000000000002', 'BƯỚC 2', 'Xác định thủ tục phù hợp',
         'Gia hạn, duy trì, chuyển nhượng, li-xăng hay sửa đổi thông tin — mỗi hướng có hồ sơ và thời hạn khác nhau.', 1,
         '42222222-2222-2222-2222-222222222222'
  UNION ALL SELECT '4222d000-0000-0000-0000-000000000003', 'BƯỚC 3', 'Soạn và nộp hồ sơ',
         'Chuẩn bị tài liệu, hợp đồng nếu có, và nộp tại cơ quan có thẩm quyền trong thời hạn cho phép.', 2,
         '42222222-2222-2222-2222-222222222222'
  UNION ALL SELECT '4222d000-0000-0000-0000-000000000004', 'BƯỚC 4', 'Nhận kết quả và lập lịch theo dõi',
         'Bàn giao kết quả và thiết lập lịch nhắc cho kỳ hạn tiếp theo.', 3,
         '42222222-2222-2222-2222-222222222222'
) t WHERE NOT EXISTS (SELECT 1 FROM Process WHERE id = '4222d000-0000-0000-0000-000000000001');

-- ---------------------------------------------------------------------------
-- 3. DOANH NGHIỆP KHOA HỌC VÀ CÔNG NGHỆ
-- ---------------------------------------------------------------------------
INSERT INTO ChildrenServices (id, title, href, description, descriptionHome, icon, parent_service_id)
SELECT '43333333-3333-3333-3333-333333333333',
       'Chứng nhận doanh nghiệp khoa học công nghệ',
       '/doanh-nghiep-khoa-hoc-cong-nghe',
       'Đạt chứng nhận để hưởng chính sách ưu đãi dành cho doanh nghiệp KH&CN.',
       'Đánh giá điều kiện, chứng minh kết quả KH&CN và hoàn thiện hồ sơ đề nghị cấp chứng nhận.',
       'sparkles',
       'a728fa1e-d807-40ef-8b43-b06dfdf0f67c'
WHERE NOT EXISTS (SELECT 1 FROM ChildrenServices WHERE id = '43333333-3333-3333-3333-333333333333');

INSERT INTO Hero (id, title, subtitle, description, service_id)
SELECT '4333a000-0000-0000-0000-000000000001',
       'Chứng nhận doanh nghiệp khoa học và công nghệ',
       'Poip Legal Law',
       'Doanh nghiệp đã có kết quả nghiên cứu và đang thương mại hóa thường đủ điều kiện nhưng không biết mình đủ. Poip Legal đánh giá điều kiện, giúp chứng minh kết quả KH&CN và hoàn thiện hồ sơ đề nghị cấp chứng nhận.',
       '43333333-3333-3333-3333-333333333333'
WHERE NOT EXISTS (SELECT 1 FROM Hero WHERE id = '4333a000-0000-0000-0000-000000000001');

INSERT INTO service_section (id, type, title, subtitle, sortOrder, service_id)
SELECT '4333b000-0000-0000-0000-000000000001', 'conditions',
       'Điều kiện cơ bản để được chứng nhận',
       'Poip Legal đánh giá cụ thể theo hồ sơ thực tế của từng doanh nghiệp.',
       0, '43333333-3333-3333-3333-333333333333'
WHERE NOT EXISTS (SELECT 1 FROM service_section WHERE id = '4333b000-0000-0000-0000-000000000001');

INSERT INTO service_section_item (id, title, description, sortOrder, section_id)
SELECT * FROM (
  SELECT '4333c000-0000-0000-0000-000000000001' AS id, 'Có kết quả khoa học và công nghệ' AS title,
         'Doanh nghiệp sở hữu hoặc có quyền sử dụng hợp pháp kết quả KH&CN — có thể là sáng chế, giải pháp hữu ích, giống cây trồng, phần mềm đã đăng ký quyền tác giả hoặc kết quả nghiên cứu đã được công nhận.' AS description,
         0 AS sortOrder, '4333b000-0000-0000-0000-000000000001' AS section_id
  UNION ALL SELECT '4333c000-0000-0000-0000-000000000002', 'Trực tiếp thương mại hóa kết quả đó',
         'Sản phẩm hình thành từ kết quả KH&CN phải đang được doanh nghiệp sản xuất hoặc kinh doanh, không dừng ở giai đoạn nghiên cứu.', 1,
         '4333b000-0000-0000-0000-000000000001'
  UNION ALL SELECT '4333c000-0000-0000-0000-000000000003', 'Đạt tỷ lệ doanh thu theo quy định',
         'Doanh thu từ sản phẩm hình thành từ kết quả KH&CN phải đạt tỷ lệ tối thiểu trên tổng doanh thu theo quy định hiện hành.', 2,
         '4333b000-0000-0000-0000-000000000001'
) t WHERE NOT EXISTS (SELECT 1 FROM service_section_item WHERE id = '4333c000-0000-0000-0000-000000000001');

INSERT INTO service_section (id, type, title, subtitle, sortOrder, service_id)
SELECT '4333b000-0000-0000-0000-000000000002', 'benefits',
       'CHÍNH SÁCH ƯU ĐÃI KHI ĐƯỢC CHỨNG NHẬN',
       'Mức và thời gian hưởng ưu đãi áp dụng theo quy định hiện hành tại thời điểm được cấp chứng nhận.',
       1, '43333333-3333-3333-3333-333333333333'
WHERE NOT EXISTS (SELECT 1 FROM service_section WHERE id = '4333b000-0000-0000-0000-000000000002');

INSERT INTO service_section_item (id, title, description, sortOrder, section_id)
SELECT * FROM (
  SELECT '4333c000-0000-0000-0000-000000000011' AS id, 'Ưu đãi thuế thu nhập doanh nghiệp' AS title,
         'Doanh nghiệp KH&CN được miễn, giảm thuế thu nhập doanh nghiệp đối với phần thu nhập từ hoạt động KH&CN theo lộ trình quy định.' AS description,
         0 AS sortOrder, '4333b000-0000-0000-0000-000000000002' AS section_id
  UNION ALL SELECT '4333c000-0000-0000-0000-000000000012', 'Ưu đãi về đất đai và tín dụng',
         'Được xem xét miễn giảm tiền thuê đất và tiếp cận các chương trình tín dụng ưu đãi dành cho hoạt động KH&CN.', 1,
         '4333b000-0000-0000-0000-000000000002'
  UNION ALL SELECT '4333c000-0000-0000-0000-000000000013', 'Hỗ trợ hoạt động nghiên cứu',
         'Đủ điều kiện tham gia các chương trình hỗ trợ nghiên cứu, đổi mới công nghệ và thương mại hóa kết quả.', 2,
         '4333b000-0000-0000-0000-000000000002'
  UNION ALL SELECT '4333c000-0000-0000-0000-000000000014', 'Nâng vị thế khi đấu thầu và gọi vốn',
         'Chứng nhận là bằng chứng khách quan về năng lực công nghệ khi làm việc với đối tác và nhà đầu tư.', 3,
         '4333b000-0000-0000-0000-000000000002'
) t WHERE NOT EXISTS (SELECT 1 FROM service_section_item WHERE id = '4333c000-0000-0000-0000-000000000011');

INSERT INTO Process (id, step, title, description, sortOrder, service_id)
SELECT * FROM (
  SELECT '4333d000-0000-0000-0000-000000000001' AS id, 'BƯỚC 1' AS step, 'Đánh giá điều kiện' AS title,
         'Rà soát kết quả KH&CN đang có, cơ cấu doanh thu và khả năng đáp ứng từng tiêu chí trước khi bắt đầu.' AS description,
         0 AS sortOrder, '43333333-3333-3333-3333-333333333333' AS service_id
  UNION ALL SELECT '4333d000-0000-0000-0000-000000000002', 'BƯỚC 2', 'Củng cố cơ sở pháp lý cho kết quả KH&CN',
         'Nếu kết quả chưa được bảo hộ hoặc chưa có căn cứ sở hữu rõ ràng, cần xử lý trước — đây là điểm vướng phổ biến nhất.', 1,
         '43333333-3333-3333-3333-333333333333'
  UNION ALL SELECT '4333d000-0000-0000-0000-000000000003', 'BƯỚC 3', 'Soạn hồ sơ và thuyết minh',
         'Lập hồ sơ chứng minh kết quả KH&CN và phương án thương mại hóa theo yêu cầu của cơ quan cấp chứng nhận.', 2,
         '43333333-3333-3333-3333-333333333333'
  UNION ALL SELECT '4333d000-0000-0000-0000-000000000004', 'BƯỚC 4', 'Nộp hồ sơ và theo dõi thẩm định',
         'Giải trình, bổ sung theo yêu cầu và nhận Giấy chứng nhận doanh nghiệp khoa học và công nghệ.', 3,
         '43333333-3333-3333-3333-333333333333'
) t WHERE NOT EXISTS (SELECT 1 FROM Process WHERE id = '4333d000-0000-0000-0000-000000000001');

-- ---------------------------------------------------------------------------
-- 4. TƯ VẤN PHÁP LÝ DOANH NGHIỆP
-- ---------------------------------------------------------------------------
INSERT INTO ChildrenServices (id, title, href, description, descriptionHome, icon, parent_service_id)
SELECT '44444444-4444-4444-4444-444444444444',
       'Tư vấn pháp lý doanh nghiệp',
       '/tu-van-phap-ly-doanh-nghiep',
       'Đồng hành pháp lý thường xuyên cho hoạt động của doanh nghiệp.',
       'Rà soát rủi ro, chuẩn hóa hồ sơ nội bộ và tư vấn theo từng tình huống phát sinh.',
       'briefcase',
       'a728fa1e-d807-40ef-8b43-b06dfdf0f67c'
WHERE NOT EXISTS (SELECT 1 FROM ChildrenServices WHERE id = '44444444-4444-4444-4444-444444444444');

INSERT INTO Hero (id, title, subtitle, description, service_id)
SELECT '4444a000-0000-0000-0000-000000000001',
       'Tư vấn pháp lý doanh nghiệp',
       'Poip Legal Law',
       'Phần lớn rủi ro pháp lý của doanh nghiệp không đến từ vụ kiện, mà từ những việc làm sai nhỏ lặp lại hằng ngày. Poip Legal rà soát và chuẩn hóa để chúng không tích tụ thành tranh chấp.',
       '44444444-4444-4444-4444-444444444444'
WHERE NOT EXISTS (SELECT 1 FROM Hero WHERE id = '4444a000-0000-0000-0000-000000000001');

INSERT INTO service_section (id, type, title, subtitle, sortOrder, service_id)
SELECT '4444b000-0000-0000-0000-000000000001', 'cards',
       'PHẠM VI TƯ VẤN',
       'Chọn theo nhu cầu thực tế, không nhất thiết dùng trọn gói.',
       0, '44444444-4444-4444-4444-444444444444'
WHERE NOT EXISTS (SELECT 1 FROM service_section WHERE id = '4444b000-0000-0000-0000-000000000001');

INSERT INTO service_section_item (id, title, description, sortOrder, section_id)
SELECT * FROM (
  SELECT '4444c000-0000-0000-0000-000000000001' AS id, 'Quản trị nội bộ' AS title,
         'Điều lệ, nghị quyết, biên bản họp và thẩm quyền ký kết. Hồ sơ nội bộ thiếu chuẩn là nguyên nhân phổ biến khiến giao dịch bị vô hiệu.' AS description,
         0 AS sortOrder, '4444b000-0000-0000-0000-000000000001' AS section_id
  UNION ALL SELECT '4444c000-0000-0000-0000-000000000002', 'Hợp đồng và giao dịch',
         'Soạn thảo, rà soát và đàm phán hợp đồng với khách hàng, nhà cung cấp và đối tác.', 1,
         '4444b000-0000-0000-0000-000000000001'
  UNION ALL SELECT '4444c000-0000-0000-0000-000000000003', 'Lao động và nhân sự',
         'Hợp đồng lao động, nội quy, quy chế lương thưởng và xử lý kỷ luật đúng trình tự.', 2,
         '4444b000-0000-0000-0000-000000000001'
  UNION ALL SELECT '4444c000-0000-0000-0000-000000000004', 'Tài sản trí tuệ',
         'Xác lập quyền với nhãn hiệu, bản quyền, kiểu dáng và sáng chế; xử lý khi bị xâm phạm.', 3,
         '4444b000-0000-0000-0000-000000000001'
  UNION ALL SELECT '4444c000-0000-0000-0000-000000000005', 'Tuân thủ theo ngành',
         'Giấy phép con, điều kiện kinh doanh và nghĩa vụ báo cáo theo lĩnh vực hoạt động.', 4,
         '4444b000-0000-0000-0000-000000000001'
  UNION ALL SELECT '4444c000-0000-0000-0000-000000000006', 'Thay đổi cơ cấu',
         'Tăng vốn, thêm thành viên, chuyển nhượng phần vốn góp, tách hoặc sáp nhập.', 5,
         '4444b000-0000-0000-0000-000000000001'
) t WHERE NOT EXISTS (SELECT 1 FROM service_section_item WHERE id = '4444c000-0000-0000-0000-000000000001');

INSERT INTO service_section (id, type, title, subtitle, sortOrder, service_id)
SELECT '4444b000-0000-0000-0000-000000000002', 'benefits',
       'CÁCH POIP LEGAL LÀM VIỆC',
       NULL, 1, '44444444-4444-4444-4444-444444444444'
WHERE NOT EXISTS (SELECT 1 FROM service_section WHERE id = '4444b000-0000-0000-0000-000000000002');

INSERT INTO service_section_item (id, title, description, sortOrder, section_id)
SELECT * FROM (
  SELECT '4444c000-0000-0000-0000-000000000011' AS id, 'Luật sư phụ trách trực tiếp' AS title,
         'Một đầu mối nắm hồ sơ xuyên suốt, không chuyển qua nhiều người khiến bạn phải kể lại từ đầu.' AS description,
         0 AS sortOrder, '4444b000-0000-0000-0000-000000000002' AS section_id
  UNION ALL SELECT '4444c000-0000-0000-0000-000000000012', 'Trả lời được việc, không trả lời chung chung',
         'Mỗi vấn đề đi kèm phương án cụ thể và bước tiếp theo, thay vì trích dẫn điều luật rồi để bạn tự xoay.', 1,
         '4444b000-0000-0000-0000-000000000002'
  UNION ALL SELECT '4444c000-0000-0000-0000-000000000013', 'Phạm vi và chi phí rõ trước',
         'Thống nhất công việc và mức phí trước khi bắt đầu, không phát sinh giữa chừng.', 2,
         '4444b000-0000-0000-0000-000000000002'
  UNION ALL SELECT '4444c000-0000-0000-0000-000000000014', 'Bảo mật thông tin',
         'Thông tin doanh nghiệp và tài liệu được giữ kín theo nguyên tắc hành nghề luật sư.', 3,
         '4444b000-0000-0000-0000-000000000002'
) t WHERE NOT EXISTS (SELECT 1 FROM service_section_item WHERE id = '4444c000-0000-0000-0000-000000000011');

INSERT INTO Process (id, step, title, description, sortOrder, service_id)
SELECT * FROM (
  SELECT '4444d000-0000-0000-0000-000000000001' AS id, 'BƯỚC 1' AS step, 'Trao đổi nhu cầu' AS title,
         'Hiểu mô hình kinh doanh, giai đoạn phát triển và những việc doanh nghiệp đang vướng.' AS description,
         0 AS sortOrder, '44444444-4444-4444-4444-444444444444' AS service_id
  UNION ALL SELECT '4444d000-0000-0000-0000-000000000002', 'BƯỚC 2', 'Rà soát hiện trạng',
         'Xem hồ sơ nội bộ, hợp đồng mẫu và giấy phép đang có để chỉ ra rủi ro cụ thể.', 1,
         '44444444-4444-4444-4444-444444444444'
  UNION ALL SELECT '4444d000-0000-0000-0000-000000000003', 'BƯỚC 3', 'Đề xuất phương án và phạm vi',
         'Xếp thứ tự việc cần làm theo mức độ rủi ro, kèm phạm vi công việc và mức phí rõ ràng.', 2,
         '44444444-4444-4444-4444-444444444444'
  UNION ALL SELECT '4444d000-0000-0000-0000-000000000004', 'BƯỚC 4', 'Triển khai và đồng hành',
         'Thực hiện theo kế hoạch và tiếp tục hỗ trợ khi có tình huống mới phát sinh.', 3,
         '44444444-4444-4444-4444-444444444444'
) t WHERE NOT EXISTS (SELECT 1 FROM Process WHERE id = '4444d000-0000-0000-0000-000000000001');

-- ---------------------------------------------------------------------------
-- Ảnh minh hoạ.
--
-- Cột image chỉ lưu TÊN FILE, không lưu URL — backend tự ghép tiền tố
-- https://minio.luatpoip.com/images/ khi trả về. Lưu cả URL vào đây sẽ ra
-- đường dẫn lặp và ảnh 404.
--
-- File nguồn (SVG) và script sinh ảnh nằm ở docs/assets/service-images/.
-- Đây là đồ hoạ theo nhận diện, dùng tạm cho tới khi có ảnh chụp thật; thay
-- ảnh thì chỉ cần tải file mới lên bucket images rồi UPDATE lại cột này.
-- ---------------------------------------------------------------------------
UPDATE ChildrenServices SET image = '18575041-9fd5-413c-a777-2fb5d7376dbe_dang-ky-sang-che.webp'
 WHERE href = '/dang-ky-sang-che' AND (image IS NULL OR image = '');
UPDATE ChildrenServices SET image = '49355308-d8b6-49f7-8bb7-4ddf139703ed_gia-han-chuyen-nhuong-van-bang.webp'
 WHERE href = '/gia-han-chuyen-nhuong-van-bang' AND (image IS NULL OR image = '');
UPDATE ChildrenServices SET image = '735a137e-3460-4e57-acde-7b8875e8b14c_doanh-nghiep-khoa-hoc-cong-nghe.webp'
 WHERE href = '/doanh-nghiep-khoa-hoc-cong-nghe' AND (image IS NULL OR image = '');
UPDATE ChildrenServices SET image = '30116ed2-e490-4d00-aef8-f191aaa59b28_tu-van-phap-ly-doanh-nghiep.webp'
 WHERE href = '/tu-van-phap-ly-doanh-nghiep' AND (image IS NULL OR image = '');
