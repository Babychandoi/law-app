package org.law_app.crm.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.law_app.crm.service.CrmLeadDescriptionNormalizer.NormalizedLeadIntake;

class CrmLeadDescriptionNormalizerTest {

  @Test
  void normalizesLandingPageFacebookAdsStringWithCustomerMessageAndUtmParams() {
    String raw =
        "[Nguồn: LP-tong-dich-vu-ads] [Đối tượng: Cá nhân] "
            + "[Dịch vụ: Bảo hộ kiểu dáng công nghiệp] Kiếm tiền "
            + "[Chiến dịch: utm_source=facebook; utm_medium=paid_social; "
            + "utm_campaign=poip_nhan_hieu_toan_quoc; utm_content=nh01_tracuu; "
            + "utm_term=120252505886800047]";

    NormalizedLeadIntake res =
        CrmLeadDescriptionNormalizer.normalize(raw, "Bảo hộ kiểu dáng công nghiệp");

    assertThat(res.structured()).isTrue();
    assertThat(res.customerNote()).isEqualTo("Kiếm tiền");
    assertThat(res.customerType()).isEqualTo("Cá nhân");
    assertThat(res.serviceName()).isEqualTo("Bảo hộ kiểu dáng công nghiệp");
    assertThat(res.landingSource()).isEqualTo("LP-tong-dich-vu-ads");
    assertThat(res.channelLabel()).isEqualTo("Facebook Ads (Paid Social)");
    assertThat(res.campaignName()).isEqualTo("poip_nhan_hieu_toan_quoc");
    assertThat(res.adContent()).isEqualTo("nh01_tracuu");
    assertThat(res.adTerm()).isEqualTo("120252505886800047");
    assertThat(res.suggestedLeadSource()).isEqualTo("1/ Quảng cáo");
    assertThat(res.suggestedServiceGroups())
        .containsExactly("Sở hữu trí tuệ", "Bảo hộ kiểu dáng công nghiệp");
    assertThat(res.suggestedTags()).containsExactly("Facebook Ads", "Cá nhân");
    assertThat(res.normalizedDemandDetail())
        .isEqualTo(
            String.join(
                "\n",
                "Nội dung KH: Kiếm tiền",
                "Dịch vụ quan tâm: Bảo hộ kiểu dáng công nghiệp",
                "Đối tượng: Cá nhân",
                "Kênh: Facebook Ads (Paid Social) · Trang đích: LP-tong-dich-vu-ads",
                "Chiến dịch: poip_nhan_hieu_toan_quoc · Mẫu QC: nh01_tracuu · Mã nhóm QC: 120252505886800047"));
  }

  @Test
  void normalizesLandingFormWithoutCustomerMessageOrUtmCampaign() {
    String raw = "[Nguồn: LP dang-ky-nhan-hieu] ";

    NormalizedLeadIntake res =
        CrmLeadDescriptionNormalizer.normalize(raw, "Đăng ký bảo hộ nhãn hiệu");

    assertThat(res.structured()).isTrue();
    assertThat(res.customerNote()).isNull();
    assertThat(res.landingSource()).isEqualTo("LP-dang-ky-nhan-hieu");
    assertThat(res.suggestedLeadSource()).isEqualTo("6/ Website");
    assertThat(res.suggestedServiceGroups())
        .containsExactly("Sở hữu trí tuệ", "Đăng ký bảo hộ nhãn hiệu");
    assertThat(res.suggestedTags()).containsExactly("Landing Page");
    assertThat(res.normalizedDemandDetail())
        .contains("Tư vấn: Đăng ký bảo hộ nhãn hiệu")
        .contains("Trang đích: LP-dang-ky-nhan-hieu");
  }

  @Test
  void leavesPlainHumanWrittenNoteUntouched() {
    String plain = "Khách cần tra cứu gấp 2 nhóm nhãn hiệu 35 và 42 trong tuần này.";

    NormalizedLeadIntake res = CrmLeadDescriptionNormalizer.normalize(plain, null);

    assertThat(res.structured()).isFalse();
    assertThat(res.normalizedDemandDetail()).isEqualTo(plain);
    assertThat(res.suggestedLeadSource()).isEqualTo("6/ Website");
  }
}
