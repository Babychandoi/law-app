package org.law_app.crm.config;

import static org.law_app.crm.service.CrmSupport.VN_ZONE;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.law_app.crm.repository.CrmAccountRepository;
import org.law_app.crm.repository.CrmCaseRepository;
import org.law_app.crm.repository.CrmContractRepository;
import org.law_app.crm.service.CrmAccountService;
import org.law_app.crm.service.CrmActivityService;
import org.law_app.crm.service.CrmContractService;
import org.law_app.crm.service.CrmLeadService;
import org.law_app.crm.service.CrmLeadSyncService;
import org.law_app.crm.service.CrmOpportunityService;
import org.law_app.crm.web.EnterpriseCrmDtos.AccountContactCreateRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.AccountUpsertRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.ActivityCreateRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CashflowCreateRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.ContractUpsertRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmAccountDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmContractDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmLeadDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmLineItemDto;
import org.law_app.crm.web.EnterpriseCrmDtos.CrmOpportunityDto;
import org.law_app.crm.web.EnterpriseCrmDtos.LeadUpsertRequest;
import org.law_app.crm.web.EnterpriseCrmDtos.OpportunityUpsertRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Backfills website CrmCase records into CrmLead and optionally seeds realistic Luật Poip Legal
 * enterprise CRM sample data when crm.seed.demo-enabled=true and tables are empty.
 */
@Slf4j
@Component
@Order(20)
@RequiredArgsConstructor
public class CrmEnterpriseSeedRunner implements ApplicationRunner {

  @Value("${crm.seed.demo-enabled:${CRM_SEED_DEMO_ENABLED:false}}")
  private boolean demoSeedEnabled;

  private final CrmCaseRepository caseRepo;
  private final CrmAccountRepository accountRepo;
  private final CrmContractRepository contractRepo;
  private final CrmLeadSyncService leadSyncService;
  private final CrmLeadService leadService;
  private final CrmAccountService accountService;
  private final CrmOpportunityService opportunityService;
  private final CrmContractService contractService;
  private final CrmActivityService activityService;

  @Override
  public void run(ApplicationArguments args) {
    int backfilled = leadSyncService.backfillFromCases(caseRepo.findAll());
    if (backfilled > 0) {
      log.info("Backfilled {} website cases into crm_lead", backfilled);
    }

    if (!demoSeedEnabled) {
      return;
    }

    if (contractRepo.count() > 0 || accountRepo.count() > 0) {
      return;
    }

    LocalDate today = LocalDate.now(VN_ZONE);

    // 1. Seed 5 Leads
    CrmLeadDto lead1 =
        leadService.create(
            new LeadUpsertRequest(
                null,
                null,
                List.of("VIP", "Nhãn hiệu"),
                "Nguyễn Thị Minh Anh",
                "Nguyễn Thị Minh Anh",
                "0909123456",
                "0317891234",
                "minhanh.nguyen@gmail.com",
                "anh.ntm@greentea-vn.com",
                List.of("Sở hữu trí tuệ"),
                "Giám đốc điều hành",
                null,
                "Trần Thị Thu Hà",
                null,
                "Trần Thị Thu Hà",
                "6/ Website",
                "3/ Tiềm năng",
                "Tư vấn tra cứu và đăng ký bảo hộ nhãn hiệu trà hữu cơ nhóm 30, 35.",
                "Công ty TNHH Trà Hữu Cơ Việt",
                "Nữ",
                "0909123456",
                "https://greentea-vn.com",
                LocalDate.of(1991, 5, 14),
                "10 - 50 nhân sự",
                "Việt Nam",
                "TP. Hồ Chí Minh",
                "Quận 1",
                "72 Lê Thánh Tôn, Phường Bến Nghé, Quận 1",
                true,
                "Phòng Tư vấn SHTT",
                Instant.now().minus(1, ChronoUnit.DAYS)));

    CrmLeadDto lead2 =
        leadService.create(
            new LeadUpsertRequest(
                null,
                null,
                List.of("Bản quyền", " Gấp"),
                "Lê Hoàng Nam",
                "Lê Hoàng Nam",
                "0918234567",
                "0109456123",
                "hoangnam.le@gmail.com",
                "nam.lh@edutech.vn",
                List.of("Sở hữu trí tuệ", "Website"),
                "Trưởng phòng Pháp chế",
                null,
                "Nguyễn Văn Minh",
                null,
                "Nguyễn Văn Minh",
                "1/ Quảng cáo",
                "2/ Nhu cầu cao",
                "Đăng ký bản quyền phần mềm LMS và thông báo website thương mại điện tử với Bộ Công Thương.",
                "Công ty CP EduTech Á Châu",
                "Nam",
                "0918234567",
                "https://edutech.vn",
                LocalDate.of(1988, 11, 20),
                "50 - 100 nhân sự",
                "Việt Nam",
                "Hà Nội",
                "Quận Cầu Giấy",
                "Tầng 8, Tòa nhà Duy Tân Plaza, Cầu Giấy",
                true,
                "Phòng Tư vấn SHTT",
                Instant.now().minus(4, ChronoUnit.HOURS)));

    leadService.create(
        new LeadUpsertRequest(
            null,
            null,
            List.of("ĐKKD"),
            "Phạm Thu Trang",
            "Phạm Thu Trang",
            "0938556677",
            null,
            "thutrang.pham@gmail.com",
            null,
            List.of("Doanh nghiệp"),
            "Nhà sáng lập",
            null,
            "Trần Thị Thu Hà",
            null,
            "Trần Thị Thu Hà",
            "2/ Zalo OA",
            "3/ Tiềm năng",
            "Thành lập công ty TNHH 2 thành viên lĩnh vực thiết kế nội thất tại Bình Dương.",
            "Nội Thất Mộc Gia",
            "Nữ",
            "0938556677",
            null,
            LocalDate.of(1994, 3, 8),
            "Dưới 10 nhân sự",
            "Việt Nam",
            "Bình Dương",
            "TP. Thuận An",
            "KDC Việt Sing, Phường An Phú, Thuận An",
            true,
            "Phòng Doanh nghiệp",
            Instant.now().minus(2, ChronoUnit.DAYS)));

    leadService.create(
        new LeadUpsertRequest(
            null,
            null,
            List.of("Giấy phép", "TPCN"),
            "Võ Quốc Bảo",
            "Võ Quốc Bảo",
            "0977889900",
            "0401998877",
            "quocbao.vo@gmail.com",
            "bao.vq@biopharma.vn",
            List.of("Giấy phép", "Sở hữu trí tuệ"),
            "Giám đốc sản xuất",
            null,
            "Lê Thanh Tùng",
            null,
            "Lê Thanh Tùng",
            "4/ Khách cũ giới thiệu",
            "1/ Chốt hợp đồng",
            "Công bố 3 sản phẩm thực phẩm bảo vệ sức khỏe và đăng ký nhãn hiệu độc quyền.",
            "Công ty CP Dược Sinh Học Miền Trung",
            "Nam",
            "0977889900",
            "https://biopharma.vn",
            LocalDate.of(1985, 8, 19),
            "100 - 200 nhân sự",
            "Việt Nam",
            "Đà Nẵng",
            "Quận Hải Châu",
            "156 Nguyễn Văn Linh, Quận Hải Châu",
            true,
            "Phòng Giấy phép",
            Instant.now().minus(6, ChronoUnit.HOURS)));

    leadService.create(
        new LeadUpsertRequest(
            null,
            null,
            List.of("Chăm sóc lại"),
            "Đặng Ngọc Hân",
            "Đặng Ngọc Hân",
            "0983112233",
            "0316549870",
            "ngochan.dang@gmail.com",
            "han.dn@luxspa.vn",
            List.of("Giấy phép"),
            "Chủ thương hiệu",
            null,
            "Trần Thị Thu Hà",
            null,
            "Trần Thị Thu Hà",
            "5/ Google Search",
            "4/ Chăm sóc lại",
            "Xin giấy phép công bố 5 dòng mỹ phẩm nhập khẩu Hàn Quốc.",
            "Công ty TNHH LuxSpa Beauty",
            "Nữ",
            "0983112233",
            "https://luxspa.vn",
            LocalDate.of(1992, 12, 2),
            "10 - 50 nhân sự",
            "Việt Nam",
            "TP. Hồ Chí Minh",
            "Quận 3",
            "214 Nam Kỳ Khởi Nghĩa, Quận 3",
            true,
            "Phòng Giấy phép",
            Instant.now().minus(3, ChronoUnit.DAYS)));

    // 2. Seed 4 Accounts + Contacts
    CrmAccountDto accGokids =
        accountService.create(
            new AccountUpsertRequest(
                "KH260001",
                null,
                List.of("Khách hàng thân thiết", "SHTT"),
                "Công ty TNHH Gokids Việt Nam",
                "0903888999",
                List.of("Đang thực hiện hợp đồng", "Chăm sóc định kỳ"),
                "Đã chốt hợp đồng",
                null,
                "6/ Website",
                null,
                "Trần Thị Thu Hà",
                null,
                "Trần Thị Thu Hà",
                "Nguyễn Văn Minh",
                List.of("Sở hữu trí tuệ", "Doanh nghiệp"),
                "Đăng ký nhãn hiệu, Bản quyền tác giả, Thay đổi ĐKKD",
                "0316894512",
                List.of("Giáo dục", "Thương mại"),
                "legal@gokids.vn",
                "VIP",
                "Trần Quốc Tuấn",
                "Tổng Giám đốc",
                "0903888999",
                "tuan.tq@gokids.vn",
                LocalDate.of(1986, 4, 12),
                "Bảo hộ chuỗi nhãn hiệu Gokids và quyền tác giả bộ giáo trình STEAM.",
                "TP. Hồ Chí Minh",
                "Quận 7",
                "Số 45 Nguyễn Lương Bằng, Khu đô thị Phú Mỹ Hưng, Quận 7",
                "50 - 100 nhân sự",
                LocalDate.of(2020, 6, 15),
                "Thanh toán 2 đợt (50/50)",
                "https://gokids.vn",
                new BigDecimal("18500000000"),
                true,
                false,
                false,
                null));
    accountService.addContact(
        accGokids.id(),
        new AccountContactCreateRequest(
            "Nguyễn Mai Phương",
            "Kế toán trưởng",
            "0903777888",
            "ketoan@gokids.vn",
            LocalDate.of(1990, 9, 22),
            false));

    CrmAccountDto accDmc =
        accountService.create(
            new AccountUpsertRequest(
                "KH260002",
                null,
                List.of("VIP", "Thời trang"),
                "Công ty TNHH Đỗ Mạnh Cường Studios",
                "0908666888",
                List.of("Đang thực hiện hợp đồng"),
                "Đã chốt hợp đồng",
                null,
                "4/ Khách cũ giới thiệu",
                null,
                "Nguyễn Văn Minh",
                null,
                "Nguyễn Văn Minh",
                "Trần Thị Thu Hà",
                List.of("Sở hữu trí tuệ", "Tư vấn pháp lý"),
                "Đăng ký nhãn hiệu, Kiểu dáng công nghiệp, Tư vấn pháp lý thường xuyên",
                "0315428976",
                List.of("Thời trang & Thiết kế"),
                "ip@domanhcuong.vn",
                "Kim Cương",
                "Phạm Huy Cận",
                "Giám đốc điều hành",
                "0908666888",
                "can.ph@domanhcuong.vn",
                LocalDate.of(1983, 7, 10),
                "Đăng ký bảo hộ nhãn hiệu SIXDO mở rộng và bản quyền bộ sưu tập mới.",
                "TP. Hồ Chí Minh",
                "Quận 1",
                "128 Pasteur, Phường Bến Nghé, Quận 1",
                "100 - 200 nhân sự",
                LocalDate.of(2018, 3, 20),
                "Thanh toán 100% khi ký HĐ",
                "https://sixdo.vn",
                new BigDecimal("65000000000"),
                true,
                false,
                true,
                "Hiệp hội Thiết kế TP.HCM"));

    CrmAccountDto accSaoKhue =
        accountService.create(
            new AccountUpsertRequest(
                "KH260003",
                null,
                List.of("Công nghệ", "Bản quyền PM"),
                "Công ty CP Công nghệ Sao Khuê",
                "0912345999",
                List.of("Đang tư vấn gia hạn"),
                "Đã chốt hợp đồng",
                null,
                "5/ Google Search",
                null,
                "Lê Thanh Tùng",
                null,
                "Lê Thanh Tùng",
                null,
                List.of("Sở hữu trí tuệ", "Website"),
                "Bản quyền tác giả, Đăng ký sáng chế, Thông báo website",
                "0109845632",
                List.of("Công nghệ thông tin"),
                "contact@saokhuetech.vn",
                "Vàng",
                "Hoàng Minh Đức",
                "CTO",
                "0912345999",
                "duc.hm@saokhuetech.vn",
                LocalDate.of(1989, 1, 25),
                "Đăng ký bản quyền tác giả nền tảng AI OCR và thông báo website TMĐT.",
                "Hà Nội",
                "Quận Nam Từ Liêm",
                "Tầng 12, Keangnam Landmark 72, Phạm Hùng",
                "50 - 100 nhân sự",
                LocalDate.of(2021, 10, 5),
                "Thanh toán 2 đợt (70/30)",
                "https://saokhuetech.vn",
                new BigDecimal("28000000000"),
                true,
                false,
                false,
                null));

    CrmAccountDto accAnNhien =
        accountService.create(
            new AccountUpsertRequest(
                "KH260004",
                null,
                List.of("Mỹ phẩm", "Giấy phép"),
                "Công ty TNHH Mỹ Phẩm An Nhiên Việt Nam",
                "0935678123",
                List.of("Chờ bổ sung hồ sơ"),
                "Tiềm năng",
                null,
                "1/ Facebook Ads",
                null,
                "Trần Thị Thu Hà",
                null,
                "Trần Thị Thu Hà",
                null,
                List.of("Giấy phép", "Doanh nghiệp"),
                "Công bố mỹ phẩm nhập khẩu, Tạm ngừng DN, Thay đổi ĐKKD",
                "0402158749",
                List.of("Mỹ phẩm & Làm đẹp"),
                "annhien.cosmetics@gmail.com",
                "Bạc",
                "Lê Thị Bảo Ngọc",
                "Giám đốc",
                "0935678123",
                "ngoc.ltb@annhienbeauty.vn",
                LocalDate.of(1993, 6, 18),
                "Công bố lưu hành mỹ phẩm thiên nhiên và điều chỉnh ngành nghề ĐKKD.",
                "Đà Nẵng",
                "Quận Sơn Trà",
                "88 Phạm Văn Đồng, Quận Sơn Trà",
                "10 - 50 nhân sự",
                LocalDate.of(2022, 2, 14),
                "Thanh toán ngay",
                "https://annhienbeauty.vn",
                new BigDecimal("9200000000"),
                true,
                false,
                false,
                null));

    // 3. Seed 5 Opportunities across the 7-stage pipeline
    CrmOpportunityDto opp1 =
        opportunityService.create(
            new OpportunityUpsertRequest(
                "CH260001",
                List.of("Nhãn hiệu", "Ưu tiên"),
                "Đăng ký 03 nhóm nhãn hiệu Gokids KidsClub",
                accGokids.id(),
                accGokids.customerName(),
                accGokids.contactName(),
                accGokids.phone(),
                null,
                "7/ KH thanh toán lần 1",
                today.plusDays(3),
                List.of("Bán thêm (Upsell)"),
                List.of("Sở hữu trí tuệ"),
                "6/ Website",
                null,
                "Trần Thị Thu Hà",
                true,
                null,
                "Khách đã duyệt mẫu tờ khai 3 nhóm 16, 28, 41.",
                null,
                List.of(
                    line("SHTT-NH", "Đăng ký nhãn hiệu", "Nhãn/nhóm", "3", "2400000", "0", "5%"),
                    line("PL-PNN", "Phụ lục_Phí NN", "Hồ sơ", "3", "100000", "0", "KCT"))));

    CrmOpportunityDto opp2 =
        opportunityService.create(
            new OpportunityUpsertRequest(
                "CH260002",
                List.of("Kiểu dáng", "BST Thu Đông"),
                "Bảo hộ kiểu dáng công nghiệp & bản quyền BST Đỗ Mạnh Cường",
                accDmc.id(),
                accDmc.customerName(),
                accDmc.contactName(),
                accDmc.phone(),
                null,
                "6/ Gửi HĐ dự thảo cho KH",
                today.plusDays(7),
                List.of("Khách hàng hiện hữu"),
                List.of("Sở hữu trí tuệ"),
                "4/ Khách cũ giới thiệu",
                null,
                "Nguyễn Văn Minh",
                true,
                null,
                "Đã gửi dự thảo hợp đồng qua email pháp chế.",
                null,
                List.of(
                    line("SHTT-KD", "Kiểu dáng công nghiệp", "Đơn", "2", "3500000", "0", "5%"),
                    line("SHTT-BQ", "Bản quyền tác giả", "Tác phẩm", "2", "2400000", "0", "5%"))));

    opportunityService.create(
        new OpportunityUpsertRequest(
            "CH260003",
            List.of("Sáng chế AI"),
            "Đăng ký sáng chế thuật toán AI OCR Sao Khuê",
            accSaoKhue.id(),
            accSaoKhue.customerName(),
            accSaoKhue.contactName(),
            accSaoKhue.phone(),
            null,
            "4/ Rà soát, đánh giá hồ sơ",
            today.plusDays(15),
            List.of("Dịch vụ chuyên sâu"),
            List.of("Sở hữu trí tuệ"),
            "5/ Google Search",
            null,
            "Lê Thanh Tùng",
            true,
            null,
            "Luật sư sáng chế đang thẩm định bản mô tả kỹ thuật.",
            null,
            List.of(
                line("SHTT-SC", "Đăng ký sáng chế", "Đơn", "1", "6500000", "0", "5%"),
                line("PL-PNN", "Phụ lục_Phí NN", "Hồ sơ", "1", "100000", "0", "KCT"))));

    opportunityService.create(
        new OpportunityUpsertRequest(
            "CH260004",
            List.of("Công bố mỹ phẩm"),
            "Công bố 04 sản phẩm serum nhập khẩu An Nhiên",
            accAnNhien.id(),
            accAnNhien.customerName(),
            accAnNhien.contactName(),
            accAnNhien.phone(),
            null,
            "2/ Gửi yêu cầu về hồ sơ",
            today.plusDays(12),
            List.of("Khách hàng mới"),
            List.of("Giấy phép"),
            "1/ Facebook Ads",
            null,
            "Trần Thị Thu Hà",
            true,
            null,
            "Đang chờ khách gửi CFS và thư ủy quyền hợp pháp hóa lãnh sự.",
            null,
            List.of(
                line(
                    "GP-CBMP",
                    "Công bố mỹ phẩm nhập khẩu",
                    "Sản phẩm",
                    "4",
                    "3000000",
                    "5",
                    "8%"))));

    opportunityService.create(
        new OpportunityUpsertRequest(
            "CH260005",
            List.of("Pháp chế thuê ngoài"),
            "Gói tư vấn pháp lý thường xuyên 6 tháng - Sao Khuê",
            accSaoKhue.id(),
            accSaoKhue.customerName(),
            accSaoKhue.contactName(),
            accSaoKhue.phone(),
            null,
            "1/ Liên hệ tư vấn & báo phí",
            today.plusDays(20),
            List.of("Tư vấn định kỳ"),
            List.of("Tư vấn pháp lý"),
            "5/ Google Search",
            null,
            "Nguyễn Văn Minh",
            true,
            null,
            " Đề xuất gói 6 tháng review hợp đồng phần mềm B2B.",
            null,
            List.of(
                line(
                    "PL-TVTX",
                    "Tư vấn pháp lý thường xuyên",
                    "Tháng",
                    "6",
                    "5000000",
                    "10",
                    "8%"))));

    // 4. Seed 6 Contracts PD261071 .. PD261076 + Cashflows
    CrmContractDto c1 =
        contractService.create(
            contractReq(
                "PD261071",
                accGokids,
                opp1.id(),
                today.minusDays(18),
                today.minusDays(17),
                "Đã ghi",
                "Đã hoàn thành",
                "Đã lưu bản cứng",
                "Trần Thị Thu Hà",
                "Phòng Tư vấn SHTT",
                List.of(
                    line("SHTT-NH", "Đăng ký nhãn hiệu", "Nhãn/nhóm", "2", "2400000", "0", "5%"),
                    line("PL-PNN", "Phụ lục_Phí NN", "Hồ sơ", "2", "100000", "0", "KCT"))));
    contractService.addCashflow(
        c1.id(),
        new CashflowCreateRequest(
            "THUC_THU",
            "Thanh toán 100%",
            "Thu đủ phí đăng ký nhãn hiệu Gokids (2 nhóm) + phí NN",
            null,
            new BigDecimal("5240000"),
            today.minusDays(17),
            "Chuyển khoản",
            "VCB-261071",
            "Đã xác nhận"));
    contractService.addCashflow(
        c1.id(),
        new CashflowCreateRequest(
            "DU_KIEN_CHI",
            "Phí nhà nước Cục SHTT",
            "Dự kiến lệ phí nộp đơn Cục SHTT 2 nhóm",
            null,
            new BigDecimal("2000000"),
            today.minusDays(17),
            "Chuyển khoản",
            "DKC-261071",
            "Đã duyệt"));
    contractService.addCashflow(
        c1.id(),
        new CashflowCreateRequest(
            "THUC_CHI",
            "Phí nhà nước Cục SHTT",
            "Đã nộp lệ phí nhà nước Cục SHTT theo biên lai",
            null,
            new BigDecimal("2000000"),
            today.minusDays(15),
            "Chuyển khoản",
            "BL-SHTT-8821",
            "Đã xác nhận"));

    CrmContractDto c2 =
        contractService.create(
            contractReq(
                "PD261072",
                accDmc,
                opp2.id(),
                today.minusDays(10),
                today.minusDays(9),
                "Đã ghi",
                "Đang chuẩn bị hồ sơ",
                "Đã lưu bản scan",
                "Nguyễn Văn Minh",
                "Phòng Tư vấn SHTT",
                List.of(
                    line("SHTT-BQ", "Bản quyền tác giả", "Tác phẩm", "3", "2400000", "0", "5%"),
                    line("PL-PNN", "Phụ lục_Phí NN", "Hồ sơ", "3", "100000", "0", "KCT"))));
    contractService.addCashflow(
        c2.id(),
        new CashflowCreateRequest(
            "THUC_THU",
            "Thanh toán đợt 1 (50%)",
            "Tạm ứng 50% hợp đồng đăng ký bản quyền tác giả BST SIXDO",
            null,
            new BigDecimal("3930000"),
            today.minusDays(9),
            "Chuyển khoản",
            "ACB-261072",
            "Đã xác nhận"));
    contractService.addCashflow(
        c2.id(),
        new CashflowCreateRequest(
            "DU_KIEN_CHI",
            "Lệ phí Cục Bản quyền",
            "Dự kiến phí nhà nước 3 giấy chứng nhận bản quyền",
            null,
            new BigDecimal("1800000"),
            today.minusDays(9),
            "Chuyển khoản",
            "DKC-261072",
            "Đã duyệt"));

    CrmContractDto c3 =
        contractService.create(
            contractReq(
                "PD261073",
                accSaoKhue,
                null,
                today.minusDays(5),
                today.minusDays(4),
                "Đề nghị ghi",
                "Đã nộp hồ sơ lên",
                "Chưa có",
                "Lê Thanh Tùng",
                "Phòng Pháp chế số",
                List.of(
                    line("GP-WEB", "Thông báo website", "Website", "1", "2000000", "0", "8%"),
                    line("SHTT-BQ", "Bản quyền tác giả", "Tác phẩm", "1", "2400000", "0", "5%"),
                    line("PL-PNN", "Phụ lục_Phí NN", "Hồ sơ", "1", "100000", "0", "KCT"))));
    contractService.addCashflow(
        c3.id(),
        new CashflowCreateRequest(
            "THUC_THU",
            "Thanh toán đợt 1",
            "Thu đợt 1 phí thông báo website Bộ Công Thương & bản quyền phần mềm",
            null,
            new BigDecimal("3000000"),
            today.minusDays(4),
            "Chuyển khoản",
            "TCB-261073",
            "Đã xác nhận"));
    contractService.addCashflow(
        c3.id(),
        new CashflowCreateRequest(
            "DU_KIEN_CHI",
            "Chi phí thẩm định & phí NN",
            "Dự kiến chi lệ phí đăng ký quyền tác giả phần mềm",
            null,
            new BigDecimal("900000"),
            today.minusDays(4),
            "Chuyển khoản",
            "DKC-261073",
            "Đã duyệt"));

    CrmContractDto c4 =
        contractService.create(
            contractReq(
                "PD261074",
                accGokids,
                null,
                today.minusDays(2),
                today.minusDays(2),
                "Đề nghị ghi",
                "Đã nộp hồ sơ lên",
                "Chưa có",
                "Trần Thị Thu Hà",
                "Phòng Doanh nghiệp",
                List.of(
                    line("DN-DKKD", "Thay đổi ĐKKD", "Hồ sơ", "1", "1500000", "0", "8%"),
                    line("PL-PNN", "Phụ lục_Phí NN", "Hồ sơ", "1", "100000", "0", "KCT"))));
    contractService.addCashflow(
        c4.id(),
        new CashflowCreateRequest(
            "THUC_THU",
            "Thanh toán 100%",
            "Thu phí thay đổi địa chỉ trụ sở & bổ sung ngành nghề ĐKKD",
            null,
            new BigDecimal("1720000"),
            today.minusDays(1),
            "Chuyển khoản",
            "MB-261074",
            "Đã xác nhận"));
    contractService.addCashflow(
        c4.id(),
        new CashflowCreateRequest(
            "DU_KIEN_CHI",
            "Lệ phí Sở KH&ĐT",
            "Lệ phí công bố thông tin ĐKKD và khắc dấu",
            null,
            new BigDecimal("450000"),
            today.minusDays(1),
            "Chuyển khoản",
            "DKC-261074",
            "Đã duyệt"));
    contractService.addCashflow(
        c4.id(),
        new CashflowCreateRequest(
            "THUC_CHI",
            "Lệ phí Sở KH&ĐT",
            "Đã nộp phí công bố thay đổi ĐKKD cổng quốc gia",
            null,
            new BigDecimal("300000"),
            today.minusDays(1),
            "Chuyển khoản",
            "SKHDT-9910",
            "Đã xác nhận"));

    CrmContractDto c5 =
        contractService.create(
            contractReq(
                "PD261075",
                accAnNhien,
                null,
                today.minusDays(1),
                today.minusDays(1),
                "Bản nháp",
                "Chưa thực hiện",
                "Chưa có",
                "Trần Thị Thu Hà",
                "Phòng Doanh nghiệp",
                List.of(line("DN-TNDN", "Tạm ngừng DN", "Hồ sơ", "1", "1200000", "0", "8%"))));
    contractService.addCashflow(
        c5.id(),
        new CashflowCreateRequest(
            "DU_KIEN_CHI",
            "Chi phí ủy quyền nộp hồ sơ",
            "Dự kiến chi phí xử lý hồ sơ tạm ngừng chi nhánh",
            null,
            new BigDecimal("250000"),
            today,
            "Chuyển khoản",
            "DKC-261075",
            "Dự kiến"));

    CrmContractDto c6 =
        contractService.create(
            contractReq(
                "PD261076",
                accDmc,
                null,
                today,
                today,
                "Đề nghị ghi",
                "Đã nộp hồ sơ lên",
                "Chưa có",
                "Nguyễn Văn Minh",
                "Phòng Tư vấn SHTT",
                List.of(
                    line("SHTT-NH", "Đăng ký nhãn hiệu", "Nhãn/nhóm", "3", "2400000", "0", "5%"),
                    line("SHTT-BQ", "Bản quyền tác giả", "Tác phẩm", "1", "2400000", "0", "5%"),
                    line("PL-PNN", "Phụ lục_Phí NN", "Hồ sơ", "4", "100000", "0", "KCT"))));
    contractService.addCashflow(
        c6.id(),
        new CashflowCreateRequest(
            "THUC_THU",
            "Tạm ứng đợt 1",
            "Thu tạm ứng đợt 1 hợp đồng nhãn hiệu & bản quyền PD261076",
            null,
            new BigDecimal("6000000"),
            today,
            "Chuyển khoản",
            "VCB-261076",
            "Đã xác nhận"));
    contractService.addCashflow(
        c6.id(),
        new CashflowCreateRequest(
            "DU_KIEN_CHI",
            "Phí nhà nước SHTT & Bản quyền",
            "Dự kiến lệ phí nộp 3 nhóm nhãn hiệu + 1 tác phẩm",
            null,
            new BigDecimal("3400000"),
            today,
            "Chuyển khoản",
            "DKC-261076",
            "Đã duyệt"));

    // 5. Seed Activities across all 4 modules
    activityService.create(
        new ActivityCreateRequest(
            "LEAD",
            lead1.id(),
            "CALL",
            "Gọi tư vấn kết quả tra cứu sơ bộ nhãn hiệu",
            "Nhãn hiệu GreenTea khả năng bảo hộ 85% ở nhóm 30, hẹn gửi báo giá chi tiết trong chiều nay.",
            Instant.now().plus(3, ChronoUnit.HOURS),
            false,
            "Trần Thị Thu Hà"));
    activityService.create(
        new ActivityCreateRequest(
            "LEAD",
            lead2.id(),
            "EMAIL",
            "Gửi danh mục hồ sơ bản quyền phần mềm LMS",
            "Đã gửi checklist mã nguồn, bản mô tả chức năng và giấy cam đoan tác giả.",
            Instant.now().minus(2, ChronoUnit.HOURS),
            true,
            "Nguyễn Văn Minh"));
    activityService.create(
        new ActivityCreateRequest(
            "ACCOUNT",
            accGokids.id(),
            "APPOINTMENT",
            "Họp rà soát danh mục tài sản SHTT năm 2026",
            "Làm việc trực tiếp cùng TGĐ Trần Quốc Tuấn về lộ trình đăng ký nhãn hiệu quốc tế Madrid.",
            Instant.now().plus(2, ChronoUnit.DAYS),
            false,
            "Trần Thị Thu Hà"));
    activityService.create(
        new ActivityCreateRequest(
            "OPPORTUNITY",
            opp2.id(),
            "TASK",
            "Hoàn thiện phụ lục báo phí kiểu dáng công nghiệp",
            "Cập nhật bộ ảnh chụp 6 góc nhìn mẫu thiết kế đính kèm dự thảo hợp đồng.",
            Instant.now().plus(1, ChronoUnit.DAYS),
            false,
            "Nguyễn Văn Minh"));
    activityService.create(
        new ActivityCreateRequest(
            "CONTRACT",
            c6.id(),
            "NOTE",
            "Đã nhận ủy quyền ký đóng dấu từ khách hàng",
            "Chuyển bộ phận chuyên môn nộp đơn trực tuyến trên cổng dịch vụ công Cục SHTT.",
            null,
            true,
            "Nguyễn Văn Minh"));

    log.info(
        "Seeded Luật Poip Legal enterprise CRM dataset (leads, accounts, opportunities, contracts)");
  }

  private static CrmLineItemDto line(
      String code,
      String description,
      String unit,
      String qty,
      String unitPrice,
      String discountRate,
      String vatRate) {
    return new CrmLineItemDto(
        null,
        0,
        code,
        description,
        "Kho Dịch vụ Pháp lý",
        unit,
        new BigDecimal(qty),
        BigDecimal.ZERO,
        new BigDecimal(unitPrice),
        null,
        BigDecimal.ZERO,
        new BigDecimal(discountRate),
        null,
        vatRate,
        null,
        null,
        null,
        null,
        false);
  }

  private static ContractUpsertRequest contractReq(
      String contractNumber,
      CrmAccountDto acc,
      String oppId,
      LocalDate bookingDate,
      LocalDate orderDate,
      String revenueStatus,
      String executionStatus,
      String archivedStatus,
      String assignedUserName,
      String department,
      List<CrmLineItemDto> items) {
    return new ContractUpsertRequest(
        contractNumber,
        acc.id(),
        acc.code(),
        acc.customerName(),
        acc.contactName(),
        oppId,
        null,
        null,
        bookingDate,
        null,
        bookingDate.plusDays(2),
        bookingDate.plusDays(30),
        orderDate,
        orderDate.plusDays(25),
        revenueStatus,
        executionStatus,
        archivedStatus,
        acc.leadSource(),
        "Ký mới",
        acc.paymentTermType(),
        null,
        assignedUserName,
        department,
        "Khối Dịch vụ Pháp lý Poip Legal",
        BigDecimal.ZERO,
        null,
        BigDecimal.ZERO,
        BigDecimal.ZERO,
        BigDecimal.ZERO,
        BigDecimal.ZERO,
        BigDecimal.ZERO,
        BigDecimal.ZERO,
        BigDecimal.ZERO,
        null,
        null,
        null,
        acc.customerName(),
        acc.contactName(),
        "Việt Nam",
        acc.billingProvince(),
        acc.billingDistrict(),
        acc.billingAddress(),
        acc.taxCode(),
        true,
        acc.referrer(),
        false,
        true,
        "Hợp đồng dịch vụ pháp lý sở hữu trí tuệ & doanh nghiệp Luật Poip Legal.",
        items);
  }
}
