// Dữ liệu landing page cho từng dịch vụ — mỗi object là 1 LP chạy ads.
// Thêm dịch vụ mới = thêm 1 entry; không cần sửa code template.

export interface LandingBenefit {
  title: string;
  description: string;
}

export interface LandingStep {
  title: string;
  description: string;
}

export interface LandingFaq {
  question: string;
  answer: string;
}

export interface LandingPricing {
  name: string;
  price: string;
  note?: string;
  features: string[];
  featured?: boolean;
}

export interface LandingConfig {
  slug: string;
  // Map sang title dịch vụ thật để khớp serviceId khi gửi lead
  serviceTitleMatch: string;
  eyebrow: string;
  heroTitle: string;
  heroHighlight: string; // phần tô vàng trong tiêu đề
  heroSubtitle: string;
  heroPoints: string[]; // gạch đầu dòng cạnh form
  benefitsTitle: string;
  benefits: LandingBenefit[];
  stepsTitle: string;
  steps: LandingStep[];
  pricing?: LandingPricing[];
  pricingTitle?: string;
  faqTitle: string;
  faqs: LandingFaq[];
  finalCtaTitle: string;
  finalCtaSubtitle: string;
}

const commonHeroPoints = [
  'Phản hồi trong vòng 24 giờ làm việc',
  'Báo phí trọn gói, rõ ràng trước khi triển khai',
  'Luật sư phụ trách trực tiếp, không qua trung gian',
];

export const landingConfigs: LandingConfig[] = [
  {
    slug: 'dang-ky-nhan-hieu',
    serviceTitleMatch: 'nhãn hiệu',
    eyebrow: 'Đăng ký nhãn hiệu',
    heroTitle: 'Bảo hộ thương hiệu của bạn',
    heroHighlight: 'trước khi quá muộn',
    heroSubtitle:
      'Đăng ký nhãn hiệu độc quyền để không ai được dùng tên, logo của bạn. Luật Poip tra cứu khả năng bảo hộ, soạn hồ sơ và theo dõi đến khi có văn bằng.',
    heroPoints: commonHeroPoints,
    benefitsTitle: 'Vì sao nên đăng ký nhãn hiệu sớm',
    benefits: [
      {
        title: 'Độc quyền sử dụng',
        description:
          'Khi được cấp văn bằng, chỉ bạn được dùng nhãn hiệu cho nhóm sản phẩm, dịch vụ đã đăng ký trên toàn quốc.',
      },
      {
        title: 'Tránh mất tên thương hiệu',
        description:
          'Ai nộp trước được ưu tiên. Chậm chân, người khác có thể đăng ký mất chính cái tên bạn đang dùng.',
      },
      {
        title: 'Cơ sở xử lý vi phạm',
        description:
          'Văn bằng là căn cứ pháp lý để yêu cầu gỡ hàng nhái, hàng giả và xử lý đối thủ sử dụng trái phép.',
      },
      {
        title: 'Tăng giá trị doanh nghiệp',
        description:
          'Nhãn hiệu đã bảo hộ là tài sản có thể định giá, chuyển nhượng, nhượng quyền hoặc góp vốn.',
      },
    ],
    stepsTitle: 'Quy trình làm việc',
    steps: [
      { title: 'Tra cứu', description: 'Kiểm tra khả năng bảo hộ và rủi ro trùng lặp trước khi nộp.' },
      { title: 'Soạn & nộp hồ sơ', description: 'Chuẩn bị hồ sơ và nộp tại Cục Sở hữu trí tuệ.' },
      { title: 'Theo dõi thẩm định', description: 'Xử lý mọi thông báo, thiếu sót phát sinh trong quá trình thẩm định.' },
      { title: 'Nhận văn bằng', description: 'Bàn giao Giấy chứng nhận đăng ký nhãn hiệu cho bạn.' },
    ],
    faqTitle: 'Câu hỏi thường gặp',
    faqs: [
      {
        question: 'Đăng ký nhãn hiệu mất bao lâu?',
        answer:
          'Trung bình 18–24 tháng theo quy trình của Cục Sở hữu trí tuệ. Luật Poip theo dõi toàn bộ để hồ sơ không bị gián đoạn.',
      },
      {
        question: 'Tôi nên tra cứu trước khi nộp không?',
        answer:
          'Rất nên. Tra cứu giúp đánh giá khả năng được cấp và tránh mất phí nộp cho nhãn hiệu khó bảo hộ.',
      },
      {
        question: 'Chi phí gồm những gì?',
        answer:
          'Gồm phí dịch vụ và lệ phí nhà nước. Luật Poip báo phí trọn gói theo số nhóm sản phẩm trước khi bắt đầu.',
      },
    ],
    finalCtaTitle: 'Nhận tư vấn đăng ký nhãn hiệu miễn phí',
    finalCtaSubtitle: 'Để lại thông tin, luật sư sẽ tra cứu sơ bộ và báo phí trọn gói cho bạn.',
  },

  {
    slug: 'ban-quyen',
    serviceTitleMatch: 'bản quyền',
    eyebrow: 'Đăng ký bản quyền',
    heroTitle: 'Bảo vệ tác phẩm,',
    heroHighlight: 'phần mềm và nội dung của bạn',
    heroSubtitle:
      'Đăng ký quyền tác giả cho phần mềm, thiết kế, bài viết, video, tác phẩm sáng tạo. Có giấy chứng nhận là có căn cứ chứng minh bạn là chủ sở hữu.',
    heroPoints: commonHeroPoints,
    benefitsTitle: 'Vì sao nên đăng ký bản quyền',
    benefits: [
      { title: 'Chứng minh quyền sở hữu', description: 'Giấy chứng nhận là bằng chứng pháp lý bạn là tác giả/chủ sở hữu khi có tranh chấp.' },
      { title: 'Chống sao chép', description: 'Căn cứ để yêu cầu gỡ bỏ nội dung sao chép, vi phạm trên các nền tảng.' },
      { title: 'Khai thác thương mại', description: 'Thuận lợi khi cấp phép, chuyển nhượng hoặc hợp tác khai thác tác phẩm.' },
      { title: 'Thủ tục nhanh gọn', description: 'Hồ sơ đơn giản hơn sở hữu công nghiệp, thời gian cấp ngắn.' },
    ],
    stepsTitle: 'Quy trình làm việc',
    steps: [
      { title: 'Tư vấn loại hình', description: 'Xác định tác phẩm thuộc loại hình nào và hồ sơ cần thiết.' },
      { title: 'Soạn hồ sơ', description: 'Chuẩn bị tờ khai, bản sao tác phẩm và giấy tờ liên quan.' },
      { title: 'Nộp & theo dõi', description: 'Nộp tại Cục Bản quyền tác giả và theo dõi kết quả.' },
      { title: 'Nhận giấy chứng nhận', description: 'Bàn giao Giấy chứng nhận đăng ký quyền tác giả.' },
    ],
    faqTitle: 'Câu hỏi thường gặp',
    faqs: [
      { question: 'Đăng ký bản quyền mất bao lâu?', answer: 'Thường khoảng 15–30 ngày làm việc kể từ khi hồ sơ hợp lệ.' },
      { question: 'Phần mềm có đăng ký bản quyền được không?', answer: 'Có. Phần mềm máy tính được bảo hộ dưới dạng quyền tác giả.' },
      { question: 'Cần chuẩn bị gì?', answer: 'Bản sao tác phẩm, thông tin tác giả/chủ sở hữu. Luật Poip hướng dẫn chi tiết theo từng loại.' },
    ],
    finalCtaTitle: 'Nhận tư vấn đăng ký bản quyền miễn phí',
    finalCtaSubtitle: 'Để lại thông tin, luật sư sẽ tư vấn loại hình phù hợp và báo phí trọn gói.',
  },

  {
    slug: 'kieu-dang-cong-nghiep',
    serviceTitleMatch: 'kiểu dáng',
    eyebrow: 'Kiểu dáng công nghiệp',
    heroTitle: 'Bảo hộ kiểu dáng sản phẩm',
    heroHighlight: 'độc quyền',
    heroSubtitle:
      'Đăng ký kiểu dáng công nghiệp để độc quyền hình dáng, mẫu mã sản phẩm. Ngăn đối thủ sao chép thiết kế mà bạn đã đầu tư công sức.',
    heroPoints: commonHeroPoints,
    benefitsTitle: 'Vì sao nên bảo hộ kiểu dáng',
    benefits: [
      { title: 'Độc quyền mẫu mã', description: 'Không ai được sản xuất, kinh doanh sản phẩm có kiểu dáng trùng hoặc tương tự.' },
      { title: 'Chống sao chép thiết kế', description: 'Căn cứ pháp lý để xử lý đối thủ nhái kiểu dáng sản phẩm của bạn.' },
      { title: 'Lợi thế cạnh tranh', description: 'Kiểu dáng riêng được bảo hộ giúp sản phẩm nổi bật và khó bị thay thế.' },
      { title: 'Tài sản chuyển nhượng được', description: 'Có thể chuyển nhượng, cấp phép kiểu dáng cho đối tác.' },
    ],
    stepsTitle: 'Quy trình làm việc',
    steps: [
      { title: 'Đánh giá khả năng bảo hộ', description: 'Xem xét tính mới của kiểu dáng trước khi nộp.' },
      { title: 'Soạn & nộp hồ sơ', description: 'Chuẩn bị bộ ảnh/bản vẽ và nộp tại Cục Sở hữu trí tuệ.' },
      { title: 'Theo dõi thẩm định', description: 'Xử lý thông báo phát sinh trong quá trình thẩm định.' },
      { title: 'Nhận văn bằng', description: 'Bàn giao Bằng độc quyền kiểu dáng công nghiệp.' },
    ],
    faqTitle: 'Câu hỏi thường gặp',
    faqs: [
      { question: 'Kiểu dáng công nghiệp là gì?', answer: 'Là hình dáng bên ngoài của sản phẩm thể hiện bằng đường nét, hình khối, màu sắc.' },
      { question: 'Mất bao lâu để được cấp?', answer: 'Thông thường 12–18 tháng tùy tiến độ thẩm định.' },
      { question: 'Đã công bố sản phẩm có đăng ký được không?', answer: 'Nên đăng ký trước khi công bố. Hãy liên hệ để được tư vấn theo tình huống cụ thể.' },
    ],
    finalCtaTitle: 'Nhận tư vấn bảo hộ kiểu dáng miễn phí',
    finalCtaSubtitle: 'Để lại thông tin, luật sư sẽ đánh giá khả năng bảo hộ và báo phí trọn gói.',
  },

  {
    slug: 'sang-che',
    serviceTitleMatch: 'sáng chế',
    eyebrow: 'Sáng chế & giải pháp hữu ích',
    heroTitle: 'Bảo hộ sáng chế,',
    heroHighlight: 'giải pháp kỹ thuật của bạn',
    heroSubtitle:
      'Đăng ký sáng chế / giải pháp hữu ích để độc quyền giải pháp kỹ thuật. Luật Poip tra cứu, soạn bản mô tả và theo đuổi hồ sơ đến cùng.',
    heroPoints: commonHeroPoints,
    benefitsTitle: 'Vì sao nên bảo hộ sáng chế',
    benefits: [
      { title: 'Độc quyền giải pháp', description: 'Không ai được sản xuất, sử dụng giải pháp kỹ thuật của bạn nếu chưa được phép.' },
      { title: 'Rào cản đối thủ', description: 'Bảo hộ sáng chế tạo lợi thế kỹ thuật khó vượt qua trên thị trường.' },
      { title: 'Tăng giá trị gọi vốn', description: 'Sáng chế được bảo hộ là tài sản trí tuệ hấp dẫn nhà đầu tư.' },
      { title: 'Khai thác bản quyền sáng chế', description: 'Có thể cấp phép, chuyển nhượng để tạo nguồn thu.' },
    ],
    stepsTitle: 'Quy trình làm việc',
    steps: [
      { title: 'Tra cứu sáng chế', description: 'Đánh giá tính mới và trình độ sáng tạo của giải pháp.' },
      { title: 'Soạn bản mô tả', description: 'Viết bản mô tả sáng chế và yêu cầu bảo hộ chuẩn xác.' },
      { title: 'Nộp & theo dõi', description: 'Nộp hồ sơ và xử lý mọi giai đoạn thẩm định.' },
      { title: 'Nhận văn bằng', description: 'Bàn giao Bằng độc quyền sáng chế / giải pháp hữu ích.' },
    ],
    faqTitle: 'Câu hỏi thường gặp',
    faqs: [
      { question: 'Sáng chế và giải pháp hữu ích khác gì?', answer: 'Giải pháp hữu ích có yêu cầu thấp hơn về trình độ sáng tạo và thời hạn bảo hộ ngắn hơn sáng chế.' },
      { question: 'Quy trình mất bao lâu?', answer: 'Sáng chế thường kéo dài vài năm do phải thẩm định nội dung kỹ thuật. Luật Poip theo dõi toàn bộ.' },
      { question: 'Cần chuẩn bị gì?', answer: 'Mô tả giải pháp kỹ thuật, bản vẽ (nếu có). Luật Poip hỗ trợ hoàn thiện bản mô tả.' },
    ],
    finalCtaTitle: 'Nhận tư vấn bảo hộ sáng chế miễn phí',
    finalCtaSubtitle: 'Để lại thông tin, luật sư sẽ tra cứu sơ bộ và tư vấn hướng bảo hộ.',
  },

  {
    slug: 'xu-ly-xam-pham',
    serviceTitleMatch: 'xâm phạm',
    eyebrow: 'Xử lý xâm phạm sở hữu trí tuệ',
    heroTitle: 'Bị làm nhái, làm giả?',
    heroHighlight: 'Xử lý dứt điểm',
    heroSubtitle:
      'Đối thủ dùng trái phép nhãn hiệu, sao chép sản phẩm của bạn? Luật Poip thu thập chứng cứ, gửi cảnh báo và phối hợp cơ quan chức năng xử lý.',
    heroPoints: commonHeroPoints,
    benefitsTitle: 'Luật Poip giúp bạn',
    benefits: [
      { title: 'Đánh giá hành vi vi phạm', description: 'Xác định rõ hành vi có cấu thành xâm phạm quyền hay không.' },
      { title: 'Thu thập chứng cứ', description: 'Lập vi bằng, giám định và hoàn thiện hồ sơ chứng cứ vững chắc.' },
      { title: 'Gửi cảnh báo vi phạm', description: 'Soạn và gửi văn bản yêu cầu chấm dứt hành vi xâm phạm.' },
      { title: 'Phối hợp xử lý', description: 'Làm việc với cơ quan chức năng để xử lý hành chính hoặc khởi kiện.' },
    ],
    stepsTitle: 'Quy trình xử lý',
    steps: [
      { title: 'Tiếp nhận & đánh giá', description: 'Xem xét tình huống và xác định hướng xử lý.' },
      { title: 'Thu thập chứng cứ', description: 'Lập vi bằng, giám định sở hữu trí tuệ nếu cần.' },
      { title: 'Yêu cầu chấm dứt', description: 'Gửi văn bản cảnh báo, đàm phán với bên vi phạm.' },
      { title: 'Xử lý chính thức', description: 'Đề nghị xử phạt hành chính hoặc khởi kiện khi cần.' },
    ],
    faqTitle: 'Câu hỏi thường gặp',
    faqs: [
      { question: 'Tôi chưa có văn bằng có xử lý được không?', answer: 'Tùy trường hợp. Hãy liên hệ để luật sư đánh giá cơ sở pháp lý cụ thể của bạn.' },
      { question: 'Chi phí xử lý vi phạm tính thế nào?', answer: 'Phụ thuộc tính chất vụ việc. Luật Poip báo phí sau khi đánh giá hồ sơ.' },
      { question: 'Mất bao lâu để xử lý?', answer: 'Tùy mức độ hợp tác của bên vi phạm và phương án lựa chọn. Luật sư sẽ tư vấn lộ trình.' },
    ],
    finalCtaTitle: 'Nhận tư vấn xử lý vi phạm miễn phí',
    finalCtaSubtitle: 'Mô tả ngắn tình huống, luật sư sẽ đánh giá và đề xuất hướng xử lý.',
  },

  {
    slug: 'ma-so-ma-vach',
    serviceTitleMatch: 'mã số mã vạch',
    eyebrow: 'Mã số mã vạch',
    heroTitle: 'Đăng ký mã số mã vạch',
    heroHighlight: 'cho sản phẩm',
    heroSubtitle:
      'Có mã vạch để sản phẩm lên kệ siêu thị, sàn thương mại điện tử và quản lý hàng hóa chuyên nghiệp. Luật Poip làm trọn gói, nhanh gọn.',
    heroPoints: commonHeroPoints,
    benefitsTitle: 'Vì sao cần mã số mã vạch',
    benefits: [
      { title: 'Lên kệ siêu thị, sàn TMĐT', description: 'Nhiều siêu thị và sàn yêu cầu sản phẩm phải có mã vạch hợp lệ.' },
      { title: 'Quản lý hàng hóa', description: 'Mã vạch giúp kiểm kho, bán hàng và truy xuất nhanh chóng.' },
      { title: 'Tăng uy tín sản phẩm', description: 'Mã vạch chuẩn tạo sự chuyên nghiệp và tin tưởng với khách hàng.' },
      { title: 'Thủ tục nhanh', description: 'Luật Poip xử lý hồ sơ và bàn giao mã trong thời gian ngắn.' },
    ],
    stepsTitle: 'Quy trình làm việc',
    steps: [
      { title: 'Tư vấn loại mã', description: 'Xác định số lượng mã và loại đăng ký phù hợp.' },
      { title: 'Soạn hồ sơ', description: 'Chuẩn bị hồ sơ đăng ký theo quy định.' },
      { title: 'Nộp & theo dõi', description: 'Nộp tại cơ quan có thẩm quyền và theo dõi kết quả.' },
      { title: 'Bàn giao mã', description: 'Bàn giao mã số mã vạch và hướng dẫn sử dụng.' },
    ],
    faqTitle: 'Câu hỏi thường gặp',
    faqs: [
      { question: 'Đăng ký mã vạch mất bao lâu?', answer: 'Thường nhanh, trong vài ngày đến vài tuần tùy hồ sơ.' },
      { question: 'Một mã dùng cho bao nhiêu sản phẩm?', answer: 'Tùy loại đăng ký. Luật Poip tư vấn gói phù hợp số lượng sản phẩm của bạn.' },
      { question: 'Cần giấy tờ gì?', answer: 'Giấy phép kinh doanh và thông tin sản phẩm. Luật Poip hướng dẫn chi tiết.' },
    ],
    finalCtaTitle: 'Nhận tư vấn đăng ký mã vạch miễn phí',
    finalCtaSubtitle: 'Để lại thông tin, Luật Poip sẽ tư vấn gói phù hợp và báo phí trọn gói.',
  },

  {
    slug: 'giay-phep-mang-xa-hoi',
    serviceTitleMatch: 'mạng xã hội',
    eyebrow: 'Giấy phép mạng xã hội',
    heroTitle: 'Xin giấy phép',
    heroHighlight: 'thiết lập mạng xã hội',
    heroSubtitle:
      'Vận hành website, ứng dụng có tính năng mạng xã hội cần giấy phép theo quy định. Luật Poip tư vấn điều kiện và xin giấy phép trọn gói.',
    heroPoints: commonHeroPoints,
    benefitsTitle: 'Luật Poip giúp bạn',
    benefits: [
      { title: 'Hoạt động hợp pháp', description: 'Có giấy phép giúp nền tảng vận hành đúng quy định, tránh bị xử phạt.' },
      { title: 'Tư vấn điều kiện', description: 'Đánh giá điều kiện về tên miền, nhân sự, kỹ thuật trước khi nộp.' },
      { title: 'Soạn hồ sơ chuẩn', description: 'Chuẩn bị đề án và hồ sơ kỹ thuật theo yêu cầu cơ quan quản lý.' },
      { title: 'Theo dõi đến khi có phép', description: 'Xử lý mọi yêu cầu bổ sung trong quá trình thẩm định.' },
    ],
    stepsTitle: 'Quy trình làm việc',
    steps: [
      { title: 'Tư vấn điều kiện', description: 'Đánh giá khả năng đáp ứng điều kiện cấp phép.' },
      { title: 'Soạn hồ sơ & đề án', description: 'Chuẩn bị hồ sơ pháp lý và đề án hoạt động.' },
      { title: 'Nộp & theo dõi', description: 'Nộp tại cơ quan quản lý và xử lý phản hồi.' },
      { title: 'Nhận giấy phép', description: 'Bàn giao giấy phép thiết lập mạng xã hội.' },
    ],
    faqTitle: 'Câu hỏi thường gặp',
    faqs: [
      { question: 'Loại nền tảng nào cần giấy phép?', answer: 'Các nền tảng cho phép người dùng tạo, chia sẻ nội dung và tương tác. Hãy liên hệ để được tư vấn cụ thể.' },
      { question: 'Điều kiện chính là gì?', answer: 'Liên quan tên miền, nhân sự, biện pháp kỹ thuật quản lý nội dung. Luật Poip đánh giá chi tiết theo dự án.' },
      { question: 'Mất bao lâu?', answer: 'Tùy mức độ hoàn thiện hồ sơ. Luật sư sẽ tư vấn lộ trình rõ ràng.' },
    ],
    finalCtaTitle: 'Nhận tư vấn xin giấy phép mạng xã hội',
    finalCtaSubtitle: 'Để lại thông tin, luật sư sẽ đánh giá điều kiện và báo phí trọn gói.',
  },

  {
    slug: 'doanh-nghiep-khoa-hoc-cong-nghe',
    serviceTitleMatch: 'khoa học công nghệ',
    eyebrow: 'Doanh nghiệp KH&CN',
    heroTitle: 'Chứng nhận',
    heroHighlight: 'doanh nghiệp khoa học công nghệ',
    heroSubtitle:
      'Đạt chứng nhận doanh nghiệp KH&CN để hưởng ưu đãi thuế và chính sách hỗ trợ. Luật Poip tư vấn điều kiện và hoàn thiện hồ sơ.',
    heroPoints: commonHeroPoints,
    benefitsTitle: 'Lợi ích khi được chứng nhận',
    benefits: [
      { title: 'Ưu đãi thuế', description: 'Doanh nghiệp KH&CN được hưởng ưu đãi thuế thu nhập doanh nghiệp theo quy định.' },
      { title: 'Chính sách hỗ trợ', description: 'Tiếp cận các chính sách ưu đãi về đất đai, tín dụng, hỗ trợ nghiên cứu.' },
      { title: 'Nâng tầm thương hiệu', description: 'Chứng nhận khẳng định năng lực công nghệ của doanh nghiệp.' },
      { title: 'Hồ sơ bài bản', description: 'Luật Poip giúp chứng minh kết quả KH&CN một cách thuyết phục.' },
    ],
    stepsTitle: 'Quy trình làm việc',
    steps: [
      { title: 'Đánh giá điều kiện', description: 'Rà soát kết quả KH&CN và khả năng đáp ứng tiêu chí.' },
      { title: 'Soạn hồ sơ', description: 'Hoàn thiện hồ sơ chứng minh kết quả KH&CN.' },
      { title: 'Nộp & theo dõi', description: 'Nộp tại cơ quan có thẩm quyền và xử lý phản hồi.' },
      { title: 'Nhận chứng nhận', description: 'Bàn giao Giấy chứng nhận doanh nghiệp KH&CN.' },
    ],
    faqTitle: 'Câu hỏi thường gặp',
    faqs: [
      { question: 'Điều kiện cơ bản là gì?', answer: 'Doanh nghiệp cần có kết quả KH&CN và đáp ứng tỷ lệ doanh thu theo quy định. Luật Poip đánh giá cụ thể.' },
      { question: 'Ưu đãi thuế thế nào?', answer: 'Được miễn, giảm thuế thu nhập doanh nghiệp theo lộ trình quy định.' },
      { question: 'Mất bao lâu?', answer: 'Tùy độ hoàn thiện hồ sơ. Luật sư sẽ tư vấn lộ trình.' },
    ],
    finalCtaTitle: 'Nhận tư vấn chứng nhận DN KH&CN',
    finalCtaSubtitle: 'Để lại thông tin, luật sư sẽ đánh giá điều kiện và báo phí trọn gói.',
  },

  {
    slug: 'soan-thao-hop-dong',
    serviceTitleMatch: 'hợp đồng',
    eyebrow: 'Soạn thảo hợp đồng',
    heroTitle: 'Hợp đồng chặt chẽ,',
    heroHighlight: 'tránh rủi ro pháp lý',
    heroSubtitle:
      'Soạn thảo, rà soát hợp đồng để bảo vệ quyền lợi của bạn. Tránh điều khoản bất lợi, lỗ hổng dễ bị lợi dụng khi tranh chấp.',
    heroPoints: commonHeroPoints,
    benefitsTitle: 'Vì sao cần luật sư soạn hợp đồng',
    benefits: [
      { title: 'Bảo vệ quyền lợi', description: 'Điều khoản chặt chẽ giúp bạn không chịu thiệt khi có tranh chấp.' },
      { title: 'Phát hiện rủi ro', description: 'Rà soát phát hiện điều khoản bất lợi, mơ hồ trước khi ký.' },
      { title: 'Phù hợp pháp luật', description: 'Đảm bảo hợp đồng đúng quy định, có hiệu lực thi hành.' },
      { title: 'Tiết kiệm về sau', description: 'Một hợp đồng tốt giúp tránh chi phí kiện tụng lớn sau này.' },
    ],
    stepsTitle: 'Quy trình làm việc',
    steps: [
      { title: 'Trao đổi nhu cầu', description: 'Hiểu giao dịch và mục tiêu của bạn.' },
      { title: 'Soạn / rà soát', description: 'Soạn mới hoặc rà soát hợp đồng hiện có.' },
      { title: 'Hiệu chỉnh', description: 'Điều chỉnh theo phản hồi và đàm phán với đối tác.' },
      { title: 'Bàn giao', description: 'Bàn giao bản hợp đồng hoàn chỉnh kèm lưu ý.' },
    ],
    faqTitle: 'Câu hỏi thường gặp',
    faqs: [
      { question: 'Soạn loại hợp đồng nào?', answer: 'Hợp đồng mua bán, dịch vụ, hợp tác, lao động, chuyển nhượng... Hãy liên hệ để tư vấn theo nhu cầu.' },
      { question: 'Có rà soát hợp đồng có sẵn không?', answer: 'Có. Luật Poip rà soát và chỉ ra rủi ro, đề xuất chỉnh sửa.' },
      { question: 'Phí tính thế nào?', answer: 'Tùy độ phức tạp của hợp đồng. Luật Poip báo phí trước khi làm.' },
    ],
    finalCtaTitle: 'Nhận tư vấn soạn thảo hợp đồng',
    finalCtaSubtitle: 'Mô tả ngắn nhu cầu, luật sư sẽ tư vấn và báo phí trọn gói.',
  },
];

export const getLandingConfig = (slug?: string): LandingConfig | undefined =>
  landingConfigs.find((c) => c.slug === slug);
