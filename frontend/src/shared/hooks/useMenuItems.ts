import { useEffect, useState } from 'react';
import { getServices } from '../../service/service';
import { ServiceResponse } from '../../types/service';
import { menuItems as staticMenuItems } from '../config/site';

/**
 * Menu điều hướng: khung tĩnh (Trang chủ, Về chúng tôi, Bản tin...) nhưng
 * danh sách dịch vụ trong 2 dropdown được nạp từ DB — thêm dịch vụ trong
 * admin là menu tự cập nhật. API lỗi thì giữ nguyên menu tĩnh.
 */
export function useMenuItems(): ServiceResponse[] {
  const [items, setItems] = useState<ServiceResponse[]>(staticMenuItems);

  useEffect(() => {
    getServices()
      .then((res) => {
        const groups = res.data || [];
        if (!groups.length) return;
        const findChildren = (match: string) =>
          groups.find((g) => g.title?.toLowerCase().includes(match))?.children;

        setItems(
          staticMenuItems.map((item) => {
            if (item.id === 'services') {
              const children = findChildren('sở hữu trí tuệ');
              return children?.length ? { ...item, children } : item;
            }
            if (item.id === 'other-services') {
              const children = findChildren('khác');
              return children?.length ? { ...item, children } : item;
            }
            return item;
          })
        );
      })
      .catch(() => undefined);
  }, []);

  return items;
}
