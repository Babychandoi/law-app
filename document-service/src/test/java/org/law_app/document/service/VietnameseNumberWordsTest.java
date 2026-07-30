package org.law_app.document.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigInteger;
import org.junit.jupiter.api.Test;

class VietnameseNumberWordsTest {

  @Test
  void readsBasicIntegers() {
    assertThat(VietnameseNumberWords.toWords(BigInteger.ZERO)).isEqualTo("không");
    assertThat(VietnameseNumberWords.toWords(BigInteger.valueOf(1))).isEqualTo("một");
    assertThat(VietnameseNumberWords.toWords(BigInteger.valueOf(10))).isEqualTo("mười");
    assertThat(VietnameseNumberWords.toWords(BigInteger.valueOf(11))).isEqualTo("mười một");
    assertThat(VietnameseNumberWords.toWords(BigInteger.valueOf(15))).isEqualTo("mười lăm");
    assertThat(VietnameseNumberWords.toWords(BigInteger.valueOf(21))).isEqualTo("hai mươi mốt");
    assertThat(VietnameseNumberWords.toWords(BigInteger.valueOf(25))).isEqualTo("hai mươi lăm");
    assertThat(VietnameseNumberWords.toWords(BigInteger.valueOf(100))).isEqualTo("một trăm");
    assertThat(VietnameseNumberWords.toWords(BigInteger.valueOf(105)))
        .isEqualTo("một trăm linh năm");
    assertThat(VietnameseNumberWords.toWords(BigInteger.valueOf(111)))
        .isEqualTo("một trăm mười một");
  }

  @Test
  void readsThousandsAndAbove() {
    assertThat(VietnameseNumberWords.toWords(BigInteger.valueOf(1000))).isEqualTo("một nghìn");
    assertThat(VietnameseNumberWords.toWords(BigInteger.valueOf(1_200_000)))
        .isEqualTo("một triệu hai trăm nghìn");
    assertThat(VietnameseNumberWords.toWords(BigInteger.valueOf(21_000_000)))
        .isEqualTo("hai mươi mốt triệu");
    assertThat(VietnameseNumberWords.toWords(BigInteger.valueOf(1_000_000_000L)))
        .isEqualTo("một tỷ");
  }

  @Test
  void parsesFormattedStrings() {
    assertThat(VietnameseNumberWords.toWords("1.200.000")).isEqualTo("một triệu hai trăm nghìn");
    assertThat(VietnameseNumberWords.toWords("1,200,000")).isEqualTo("một triệu hai trăm nghìn");
    assertThat(VietnameseNumberWords.toWords("1200000.50"))
        .isEqualTo("một triệu hai trăm nghìn"); // phần thập phân bỏ qua
    assertThat(VietnameseNumberWords.toWords("")).isEmpty();
    assertThat(VietnameseNumberWords.toWords("abc")).isEmpty();
  }

  @Test
  void derivedKeyAppendsSuffix() {
    assertThat(VietnameseNumberWords.derivedKey("totalAmount")).isEqualTo("totalAmount_bangchu");
  }
}
