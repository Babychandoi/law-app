import { useEffect, useState } from 'react';
import { getServices } from '../../service/service';
import { ServiceResponse } from '../../types/service';
import { menuItems as staticMenuItems } from '../config/site';

/**
 * Menu điều hướng: khung tĩnh (Trang chủ, Về chúng tôi, Bản tin, Tuyển dụng, Liên hệ)
 * + các nhóm dịch vụ dựng HOÀN TOÀN từ DB. Thêm nhóm cha / dịch vụ con trong admin
 * là navbar tự cập nhật. API lỗi thì giữ nguyên menu tĩnh.
 */
export function useMenuItems(): ServiceResponse[] {
  const [items, setItems] = useState<ServiceResponse[]>(staticMenuItems);

  useEffect(() => {
    getServices()
      .then((res) => {
        const groups = (res.data || []).filter((g) => g.children && g.children.length > 0);
        if (!groups.length) return;

        // Mỗi nhóm cha thành 1 mục dropdown trên navbar
        const serviceMenus: ServiceResponse[] = groups.map((g) => ({
          id: g.id,
          title: g.title,
          href: g.href || '/dich-vu',
          icon: g.icon,
          children: g.children,
        }));

        // Chèn các nhóm dịch vụ sau "Về chúng tôi", trước "Bản tin/Tuyển dụng/Liên hệ"
        const head = staticMenuItems.filter((m) => ['home', 'about'].includes(m.id));
        const tail = staticMenuItems.filter((m) => ['news', 'qa', 'contact'].includes(m.id));
        setItems([...head, ...serviceMenus, ...tail]);
      })
      .catch(() => undefined);
  }, []);

  return items;
}
