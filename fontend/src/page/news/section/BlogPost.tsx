import React, { useState } from 'react';
import { 
    AlertTriangle,
  Award,
  BookOpen,
  FileText,
  Globe,
  Shield
} from 'lucide-react';
import ArticleHeader from '../../../component/legalArticle/ArticleHeader';
import TableOfContents from '../../../component/legalArticle/TableOfContents';
import LegalSection from '../../../component/legalArticle/Section';
import { Section } from '../../../types/types';

const LegalArticle: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['intro']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sections: Section[] = [
    {
      id: 'intro',
      title: 'Giới thiệu',
      icon: <BookOpen className="w-5 h-5" />,
      content: 'Vào ngày 23/8/2023, Chính phủ đã ban hành Nghị định số 65/2023/NĐ-CP, nhằm đưa ra các hướng dẫn cụ thể và biện pháp thực thi của Luật Sở hữu Trí tuệ liên quan đến sở hữu công nghiệp, bảo vệ quyền sở hữu công nghiệp, quyền đối với giống cây trồng và quản lý nhà nước về sở hữu trí tuệ. Nghị định này đồng thời thay thế Nghị định số 103/2006/NĐ-CP và một phần của Nghị định số 105/2006/NĐ-CP (đã được sửa đổi, bổ sung).'
    },
    {
      id: 'forms',
      title: 'Cập nhật các Mẫu đơn',
      icon: <FileText className="w-5 h-5" />,
      content: 'Các mẫu tờ khai cho việc đăng ký nhãn hiệu, sáng chế, kiểu dáng công nghiệp và thiết kế bố trí đã được điều chỉnh để tuân thủ mẫu mới quy định và hướng dẫn tại Phụ lục I, II và IV của Nghị định. Ngoài ra, để đáp ứng nhu cầu, lần đầu tiên, đã có sự xuất hiện của mẫu "Đơn đề nghị xác nhận thủ tục đăng ký lưu hành dược phẩm lần đầu bị chậm" và "Tờ khai yêu cầu đền bù do sự chậm trễ trong việc cấp phép lưu hành lần đầu đối với dược phẩm sản xuất theo bằng độc quyền sáng chế."'
    },
    {
      id: 'security',
      title: 'Kiểm soát an ninh trong Lĩnh Vực Sáng Chế',
      icon: <Shield className="w-5 h-5" />,
      content: 'Tại Việt Nam, quy trình và phạm vi quản lý bảo mật trong lĩnh vực sáng chế, đặc biệt là đối với sáng chế có liên quan đến lĩnh vực kỹ thuật có thể ảnh hưởng đến quốc phòng và an ninh, được định rõ và chi tiết tại Điều 14 và Phụ lục VII của Nghị định. Các thủ tục này thiết lập quy trình nghiêm ngặt để xác định và quản lý các sáng chế có khả năng ảnh hưởng đến quốc phòng và an ninh.'
    },
    {
      id: 'modification',
      title: 'Sửa Đổi và Bổ Sung Đơn Đăng Ký SHCN',
      icon: <FileText className="w-5 h-5" />,
      content: 'Tại Việt Nam, các thủ tục sửa đổi và bổ sung đơn đăng ký quyền sở hữu công nghiệp đã được điều chỉnh thông qua Nghị định để tạo điều kiện linh hoạt cho chủ đơn. Thay vì phải thực hiện các thủ tục độc lập và nộp đơn riêng lẻ, việc sửa đổi một số thông tin cụ thể trên đơn đăng ký có thể được thực hiện một cách đơn giản trước khi đơn đăng ký được xem xét và chấp nhận.'
    },
    {
      id: 'division',
      title: 'Tách Đơn Đăng Ký SHCN',
      icon: <FileText className="w-5 h-5" />,
      content: 'Quy trình tách đơn đăng ký SHCN cho phép chủ đơn phân chia đơn đăng ký ban đầu thành các đơn tách riêng biệt. Cơ chế này mang lại lợi ích cho chủ đơn khi có một hoặc một số khía cạnh (phần) trong đơn không đáp ứng điều kiện bảo hộ hoặc không phù hợp với chiến lược bảo hộ tài sản trí tuệ của họ.'
    },
    {
      id: 'withdrawal',
      title: 'Rút Đơn Đăng Ký SHCN',
      icon: <FileText className="w-5 h-5" />,
      content: 'Điều 17.b2 của Nghị định bổ sung quy định về việc Cục SHTT phải ban hành thông báo dự định từ chối chấp nhận rút đơn trong trường hợp yêu cầu rút đơn không đáp ứng điều kiện để chủ đơn khắc phục. Điều này không chỉ giới hạn ở việc rút đơn mà còn định rõ các nguyên tắc, bước tiến hành và yêu cầu liên quan đến việc rút đơn đăng ký SHCN.'
    },
    {
      id: 'hague',
      title: 'Đơn Đăng Ký KDCN Theo Thỏa Ước La Hay',
      icon: <Globe className="w-5 h-5" />,
      content: 'Hệ thống La Hay, được điều chỉnh bởi Thỏa ước La Hay liên quan đến đăng ký quốc tế cho KDCN, đơn giản hóa quá trình bảo hộ KDCN ở nhiều quốc gia khác nhau. Thỏa ước La Hay cho phép chủ đơn nộp một đơn quốc tế duy nhất và chọn nhiều quốc gia thành viên mà họ muốn bảo hộ KDCN của mình để chỉ định theo đuổi việc đăng ký.'
    },
    {
      id: 'madrid',
      title: 'Đơn Madrid',
      icon: <Globe className="w-5 h-5" />,
      content: 'Đối với Đơn Madrid có nguồn gốc Việt Nam, Nghị định đã bổ sung thêm cơ chế cho phép chủ Đơn Madrid có nguồn gốc Việt Nam, đã được cấp số đăng ký quốc tế, có thể lựa chọn nộp các yêu cầu trực tiếp với Văn phòng quốc tế của WIPO hoặc thông qua Cục SHTT, và quy định về các tài liệu cần nộp nếu chọn nộp qua Cục SHTT.'
    },
    {
      id: 'certificate',
      title: 'Văn bằng bảo hộ điện tử',
      icon: <Award className="w-5 h-5" />,
      content: 'Từ ngày 23/8/2023, VBBH dưới dạng giấy sẽ chỉ được cấp cho chủ đơn khi và chỉ khi họ nêu rõ yêu cầu này trong Đơn đăng ký. Theo quy định tại Điều 29.1, đối với các Đơn đăng ký nộp sau ngày nêu trên, Cục SHTT sẽ chỉ cấp VBBH dưới dạng điện tử, trừ khi chủ đơn từ lúc nộp đơn đã có yêu cầu rõ ràng về việc cấp VBBH ở dạng giấy.'
    },
    {
      id: 'secret',
      title: 'Sáng chế mật',
      icon: <AlertTriangle className="w-5 h-5" />,
      content: 'Là sáng chế được cơ quan nhà nước có thẩm quyền xác định là bí mật nhà nước theo pháp luật về bảo vệ bí mật nhà nước. Nghị định đã thiết lập chi tiết về sáng chế mật trong năm điều từ Điều 48 đến Điều 52. Các quy định liên quan đến sáng chế mật bao gồm yêu cầu về Đơn đăng ký sáng chế mật phải được nộp ở dạng giấy, không phải dạng điện tử.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ArticleHeader />
        
        <TableOfContents 
          sections={sections.map(({ id, title, icon }) => ({ id, title, icon }))}
          onItemClick={toggleSection}
        />

        <div className="space-y-6">
          {sections.map((section) => (
            <LegalSection
              key={section.id}
              id={section.id}
              title={section.title}
              content={section.content}
              icon={section.icon}
              isExpanded={expandedSections.includes(section.id)}
              onToggle={toggleSection}
            />
          ))}
        </div>

      </div>
    </div>
  );
};

export default LegalArticle;