export interface Job {
    id: number;
    title: string;
    company?: string;
    jobType: string;
    location: string;
    postedDate: string;
    description: string[];
    requirements: string[];
    benefits: string[];
    category: string;
  }
  
  export const jobs: Job[] = [
    {
      id: 1,
      title: "Tuyển dụng Chuyên viên Kinh doanh",
      company: "Công ty Luật ToTo",
      jobType: "Toàn thời gian",
      location: "Hà Nội",
      postedDate: "Posted 2 năm ago",
      description: [
        "Tìm kiếm Khách hàng có nhu cầu đăng ký bảo hộ nhãn hiệu",
        "Chăm sóc và phát triển khách hàng về SHTT và thương hiệu",
        "Mở rộng mạng lưới quan hệ với các cấp quản lý/giám đốc",
        "Phân tích các vấn đề Khách hàng gặp phải",
        "Trao đổi để đưa ra phương án hợp tác",
        "Phối hợp cùng bộ phận khác",
        "Các công việc khác do cấp trên yêu cầu"
      ],
      requirements: [
        "Tốt nghiệp Cao đẳng trở lên các chuyên ngành Luật",
        "Có ít nhất 1 năm kinh nghiệm làm Sales hoặc Telesale",
        "Chủ động, kiên trì, hoàn thành công việc đúng thời hạn",
        "Làm việc cẩn trọng, nhiệt tình, trung thực",
        "Số lượng: 03",
        "Thời gian làm việc: Giờ hành chính từ thứ 2 – thứ 6",
        "Địa điểm làm việc: Ba Đình, Hà Nội",
        "Thời gian nhận hồ sơ: Từ ngày 12/04– 31/04/2023",
        "Ưu tiên ứng viên nộp hồ sơ sớm"
      ],
      benefits: [
        "Lương cứng: Theo thoả thuận",
        "Thưởng: Theo Chính sách kinh doanh của Công ty",
        "Nghỉ phép theo luật lao động",
        "BHXH và các chế độ theo Bộ Luật lao động",
        "Các chế độ đãi ngộ khác theo đề xuất"
      ],
      category: "Nhân viên Kinh Doanh"
    },
    // Thêm các công việc khác nếu cần
  ];
  
  export const jobListingConfig = {
    title: "Tuyển dụng",
    filterLabels: {
      keywords: "Từ khóa",
      category: "Danh mục",
      jobType: "Loại hình",
      location: "Địa điểm"
    },
    categories: [
      { value: "-1", label: "Tất cả danh mục" },
      { value: "chuyen-vien-tu-van-luat", label: "Chuyên viên tư vấn luật" },
      { value: "luat-su", label: "Luật sư" },
      { value: "nhan-vien-kinh-doanh", label: "Nhân viên Kinh Doanh" }
    ],
    jobTypes: [
      { value: "-1", label: "Tất cả loại hình" },
      { value: "cong-tac-vien", label: "Cộng tác viên" },
      { value: "hoc-viec", label: "Học việc" },
      { value: "thoi-vu", label: "Thời vụ" },
      { value: "toan-thoi-gian", label: "Toàn thời gian" }
    ],
    locations: [
      { value: "-1", label: "Tất cả địa điểm" },
      { value: "ha-noi", label: "Hà Nội" },
      { value: "ho-chi-minh", label: "TP.HCM" }
    ]
  };