package org.law_app.crm.web;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.time.LocalDate;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.law_app.crm.domain.MatterPartyRole;
import org.law_app.crm.domain.MatterPartyType;
import org.law_app.crm.web.MatterPartyDtos.Address;
import org.law_app.crm.web.MatterPartyDtos.CreatePartyRequest;
import org.law_app.crm.web.MatterPartyDtos.PartyPii;

class MatterPartyDtosValidationTest {

  private static jakarta.validation.ValidatorFactory validatorFactory;
  private static Validator validator;

  @BeforeAll
  static void setUpValidator() {
    validatorFactory = Validation.buildDefaultValidatorFactory();
    validator = validatorFactory.getValidator();
  }

  @AfterAll
  static void closeValidator() {
    validatorFactory.close();
  }

  @Test
  void acceptsInternationalStructuredPartyData() {
    CreatePartyRequest request =
        new CreatePartyRequest(
            MatterPartyRole.APPLICANT,
            MatterPartyType.PERSON,
            new PartyPii(
                "Nguyễn Văn An",
                "An",
                null,
                "Nguyễn",
                null,
                null,
                "an@example.com",
                "+84 912 345 678",
                LocalDate.of(1990, 1, 1),
                "VN",
                "PASSPORT",
                "P1234567",
                "VN",
                LocalDate.of(2030, 1, 1),
                null,
                null,
                new Address("12 Nguyễn Huệ", null, "Hồ Chí Minh", null, "700000", "VN"),
                null));

    assertThat(validator.validate(request)).isEmpty();
  }

  @Test
  void rejectsInvalidNestedPiiFields() {
    CreatePartyRequest request =
        new CreatePartyRequest(
            MatterPartyRole.CLIENT,
            MatterPartyType.PERSON,
            new PartyPii(
                " ",
                null,
                null,
                null,
                null,
                null,
                "not-an-email",
                "123",
                LocalDate.now().plusDays(1),
                "vietnam",
                null,
                null,
                null,
                null,
                null,
                null,
                new Address("", null, "", null, null, "vn"),
                null));

    assertThat(validator.validate(request))
        .extracting(violation -> violation.getPropertyPath().toString())
        .contains(
            "pii.displayName",
            "pii.email",
            "pii.phone",
            "pii.dateOfBirth",
            "pii.nationalityCountryCode",
            "pii.address.line1",
            "pii.address.locality",
            "pii.address.countryCode");
  }
}
