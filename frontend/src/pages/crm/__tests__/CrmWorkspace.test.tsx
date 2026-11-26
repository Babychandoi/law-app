import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import crmEnterpriseApi from '../../../features/crm/api';
import CrmLineItemsEditor, { createEmptyLineItem } from '../../../features/crm/CrmLineItemsEditor';
import type { CrmLineItemDto } from '../../../features/crm/types';
import { getMe } from '../../../service/auth';
import ContractListPage from '../ContractListPage';
import CrmWorkspaceLayout from '../CrmWorkspaceLayout';
import OpportunityListPage from '../OpportunityListPage';

jest.mock('../../../service/auth', () => ({
  getMe: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('../../../service/axiosClient', () => ({
  tryRefreshToken: jest.fn(),
}));

jest.mock('../../../features/crm/api', () => ({
  __esModule: true,
  default: {
    listStaff: jest.fn(),
    listServiceCatalog: jest.fn(),
    listContracts: jest.fn(),
    updateContract: jest.fn(),
    updateContractRevenueStatus: jest.fn(),
    listOpportunities: jest.fn(),
    getOpportunityKanban: jest.fn(),
    updateOpportunity: jest.fn(),
    updateOpportunityStage: jest.fn(),
    listActivities: jest.fn(),
    bulkAction: jest.fn(),
    restoreRecord: jest.fn(),
    permanentDeleteRecord: jest.fn(),
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('CRM Workspace, 3 View Modes, Full MISA Filter Panel, View Designer, and More Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();

    (getMe as jest.Mock).mockResolvedValue({
      id: 'staff-1',
      username: 'luatsu.poip',
      fullName: 'Luật sư Minh Châu',
      role: 'ADMIN',
    });
    (crmEnterpriseApi.listStaff as jest.Mock).mockResolvedValue([
      {
        id: 'staff-1',
        username: 'luatsu.poip',
        fullName: 'Luật sư Minh Châu',
        role: 'ADMIN',
        position: 'Luật sư',
        email: 'chau@luatpoip.com',
      },
    ]);
    (crmEnterpriseApi.listServiceCatalog as jest.Mock).mockResolvedValue([
      {
        code: 'SHTT-NH',
        name: 'Đăng ký nhãn hiệu độc quyền',
        serviceGroup: 'Sở hữu trí tuệ',
        unit: 'Nhóm',
        unitPrice: 3000000,
        vatRate: '8%',
      },
    ]);
    (crmEnterpriseApi.listContracts as jest.Mock).mockResolvedValue({
      rows: [
        {
          id: 'ct-1',
          contractNumber: 'PD2026-0088',
          accountId: 'acc-1',
          accountName: 'Công ty Cổ phần Công nghệ Poip',
          goodsSummary: 'Đăng ký nhãn hiệu độc quyền 2 nhóm',
          bookingDate: '2026-11-25',
          paymentDate: '2026-11-25',
          revenueStatus: 'Đã ghi',
          executionStatus: 'Đang chuẩn bị hồ sơ',
          assignedUserId: 'staff-1',
          assignedUserName: 'Luật sư Minh Châu',
          department: 'Phòng Sở hữu trí tuệ',
          liquidationValue: 0,
          orderValue: 12000000,
          collectedAmount: 8000000,
          actualExpense: 2000000,
          plannedExpense: 2500000,
          receivableAmount: 4000000,
          payableAmount: 500000,
          estimatedProfit: 9500000,
          serviceExpense: 1000000,
          stateFeeExpense: 1000000,
          supportExpense: 0,
          uninvoicedAmount: 0,
          items: [],
        },
      ],
      summary: {
        totalRecords: 1,
        totalOrderValue: 12000000,
        totalCollected: 8000000,
        totalReceivable: 4000000,
        totalEstimatedProfit: 9500000,
        totalServiceExpense: 1000000,
      },
      meta: { page: 0, pageSize: 20, totalElements: 1, totalPages: 1 },
    });
    (crmEnterpriseApi.updateContract as jest.Mock).mockResolvedValue({ id: 'ct-1' });
    (crmEnterpriseApi.bulkAction as jest.Mock).mockResolvedValue({ affected: 1 });
    (crmEnterpriseApi.listOpportunities as jest.Mock).mockResolvedValue({
      rows: [
        {
          id: 'opp-1',
          code: 'CH0001',
          tags: ['VIP'],
          opportunityName: 'Tư vấn bảo hộ sáng chế công nghệ sinh học',
          accountId: 'acc-1',
          accountName: 'Công ty Cổ phần Công nghệ Poip',
          contactName: 'Nguyễn Hoàng Nam',
          contactPhone: '0909888777',
          expectedRevenue: 25000000,
          stage: '1/ Liên hệ tư vấn & báo phí',
          expectedCloseDate: '2026-12-20',
          opportunityTypes: ['KH sử dụng dịch vụ lần đầu'],
          serviceGroups: ['Sở hữu trí tuệ'],
          assignedUserName: 'Luật sư Minh Châu',
          items: [],
        },
      ],
      meta: { page: 0, pageSize: 20, totalElements: 1, totalPages: 1 },
    });
    (crmEnterpriseApi.getOpportunityKanban as jest.Mock).mockResolvedValue([
      {
        stage: '1/ Liên hệ tư vấn & báo phí',
        count: 1,
        totalExpectedRevenue: 25000000,
        items: [
          {
            id: 'opp-1',
            code: 'CH0001',
            tags: [],
            opportunityName: 'Tư vấn bảo hộ sáng chế công nghệ sinh học',
            accountName: 'Công ty Cổ phần Công nghệ Poip',
            expectedRevenue: 25000000,
            stage: '1/ Liên hệ tư vấn & báo phí',
            opportunityTypes: [],
            serviceGroups: ['Sở hữu trí tuệ'],
            items: [],
          },
        ],
      },
    ]);
  });

  test('renders CrmWorkspaceLayout with 4 core CRM modules and ContractListPage KPI footer', async () => {
    render(
      <MemoryRouter initialEntries={['/2025/luatpoip/crm/sale-order']}>
        <Routes>
          <Route path="/2025/luatpoip/crm" element={<CrmWorkspaceLayout />}>
            <Route path="sale-order" element={<ContractListPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { name: 'Tất cả Hợp đồng' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'KH Liên hệ' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Khách hàng' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Cơ hội HĐ' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Hợp đồng' })).toBeInTheDocument();

    expect(await screen.findByText('PD2026-0088')).toBeInTheDocument();
    expect(screen.getAllByText('12.000.000').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('8.000.000').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('4.000.000').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('9.500.000').length).toBeGreaterThanOrEqual(1);
  });

  test('ContractListPage switches between Danh sách, KanBan, and Sửa nhanh via CrmViewModeDropdown', async () => {
    render(
      <MemoryRouter initialEntries={['/2025/luatpoip/crm/sale-order']}>
        <Routes>
          <Route path="/2025/luatpoip/crm" element={<CrmWorkspaceLayout />}>
            <Route path="sale-order" element={<ContractListPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('PD2026-0088')).toBeInTheDocument();

    // Switch to KanBan
    fireEvent.click(screen.getByRole('button', { name: 'Chuyển chế độ xem Hợp đồng' }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'KanBan' }));

    expect(await screen.findByRole('heading', { name: 'Đang chuẩn bị hồ sơ' })).toBeInTheDocument();
    expect(screen.getByLabelText('Nhóm KanBan Hợp đồng theo')).toBeInTheDocument();

    // Switch to Sửa nhanh
    fireEvent.click(screen.getByRole('button', { name: 'Chuyển chế độ xem Hợp đồng' }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Sửa nhanh' }));

    expect(await screen.findByText('Chế độ Sửa nhanh')).toBeInTheDocument();
    const orderInput = screen.getByLabelText('Giá trị đơn hàng PD2026-0088');
    fireEvent.change(orderInput, { target: { value: '15000000' } });

    expect(screen.getByText('Đã sửa 1 dòng')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi (1)' }));

    await waitFor(() => {
      expect(crmEnterpriseApi.updateContract).toHaveBeenCalledWith(
        'ct-1',
        expect.objectContaining({
          orderValue: 15000000,
          receivableAmount: 7000000,
        })
      );
    });
  });

  test('CrmFilterPanel shows 16 primary columns, reveals extended fields on Xem thêm, and applies filter rules', async () => {
    render(
      <MemoryRouter initialEntries={['/2025/luatpoip/crm/sale-order']}>
        <Routes>
          <Route path="/2025/luatpoip/crm" element={<CrmWorkspaceLayout />}>
            <Route path="sale-order" element={<ContractListPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('PD2026-0088')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Hiện hoặc ẩn bộ lọc' }));
    const filterAside = screen.getByRole('complementary', { name: 'Bộ lọc dữ liệu' });

    // Exactly 16 primary columns visible before clicking Xem thêm
    const primaryCheckboxes = within(filterAside).getAllByRole('checkbox');
    expect(primaryCheckboxes).toHaveLength(16);
    expect(within(filterAside).queryByLabelText('Lọc theo Chi dịch vụ')).not.toBeInTheDocument();

    // Click Xem thêm to reveal extended fields
    fireEvent.click(within(filterAside).getByRole('button', { name: 'Xem thêm' }));
    expect(within(filterAside).getByLabelText('Lọc theo Chi dịch vụ')).toBeInTheDocument();
    expect(within(filterAside).getByLabelText('Lọc theo Mã số thuế')).toBeInTheDocument();

    // Check numeric filter + text filter and apply
    fireEvent.click(within(filterAside).getByLabelText('Lọc theo Giá trị đơn hàng'));
    fireEvent.change(within(filterAside).getByLabelText('Giá trị lọc Giá trị đơn hàng'), {
      target: { value: '10000000' },
    });

    fireEvent.click(within(filterAside).getByLabelText('Lọc theo Khách hàng'));
    fireEvent.change(within(filterAside).getByLabelText('Giá trị lọc Khách hàng'), {
      target: { value: 'Poip' },
    });

    fireEvent.click(within(filterAside).getByRole('button', { name: 'Áp dụng' }));

    await waitFor(() => {
      expect(crmEnterpriseApi.listContracts).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: [
            { field: 'orderValue', op: 'GTE', value: '10000000' },
            { field: 'accountName', op: 'CONTAINS', value: 'Poip' },
          ],
        })
      );
    });
  });

  test('CrmViewSelector, CrmViewDesignerModal, and CrmMoreActionsMenu operate interactively', async () => {
    render(
      <MemoryRouter initialEntries={['/2025/luatpoip/crm/sale-order']}>
        <Routes>
          <Route path="/2025/luatpoip/crm" element={<CrmWorkspaceLayout />}>
            <Route path="sale-order" element={<ContractListPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('PD2026-0088')).toBeInTheDocument();

    // Open View Selector popover
    fireEvent.click(
      screen.getByRole('button', { name: 'Chọn giao diện danh sách (Tất cả Hợp đồng)' })
    );
    expect(screen.getByText('YÊU THÍCH')).toBeInTheDocument();
    expect(screen.getByText('HĐ - ĐANG THỰC HIỆN')).toBeInTheDocument();

    // Open View Designer Modal via Sửa button
    fireEvent.click(screen.getByRole('button', { name: 'Sửa giao diện' }));
    const designerDialog = screen.getByRole('dialog', { name: 'Sửa giao diện' });
    expect(within(designerDialog).getByText('Sắp xếp dữ liệu theo')).toBeInTheDocument();

    // Add extended column Chi dịch vụ from Có sẵn to Được chọn and save
    fireEvent.click(within(designerDialog).getAllByRole('button', { name: 'Chi dịch vụ' })[0]);
    fireEvent.click(within(designerDialog).getByRole('button', { name: 'Lưu' }));

    expect(await screen.findByRole('columnheader', { name: 'Chi dịch vụ' })).toBeInTheDocument();

    // Open More Actions (...) menu and Quick Stats modal
    fireEvent.click(screen.getByRole('button', { name: 'Thao tác mở rộng' }));
    expect(screen.getByRole('menuitem', { name: 'Bàn giao công việc' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Thùng rác' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Thống kê nhanh' }));

    expect(
      await screen.findByRole('dialog', { name: 'Thống kê nhanh Hợp đồng' })
    ).toBeInTheDocument();
  });

  test('OpportunityListPage switches between Danh sách and KanBan 7-stage pipeline via CrmViewModeDropdown', async () => {
    render(
      <MemoryRouter initialEntries={['/2025/luatpoip/crm/opportunity']}>
        <OpportunityListPage />
      </MemoryRouter>
    );

    expect(
      await screen.findByText('Tư vấn bảo hộ sáng chế công nghệ sinh học')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Chuyển chế độ xem Cơ hội HĐ' }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'KanBan' }));

    await waitFor(() => {
      expect(crmEnterpriseApi.getOpportunityKanban).toHaveBeenCalled();
    });
    expect(
      await screen.findByRole('heading', { name: '7/ KH thanh toán lần 1' })
    ).toBeInTheDocument();
  });

  test('CrmLineItemsEditor recalculates row total and grand total interactively', async () => {
    function Harness() {
      const [items, setItems] = React.useState<CrmLineItemDto[]>([createEmptyLineItem()]);
      return <CrmLineItemsEditor items={items} onChange={setItems} />;
    }

    render(<Harness />);

    const qtyInput = screen.getByLabelText('Số lượng dòng 1');
    const priceInput = screen.getByLabelText('Đơn giá dòng 1');

    fireEvent.change(qtyInput, { target: { value: '2' } });
    fireEvent.change(priceInput, { target: { value: '5000000' } });

    // 2 * 5,000,000 = 10,000,000 + 8% VAT (800,000) = 10,800,000
    await waitFor(() => {
      expect(screen.getAllByText('10.800.000').length).toBeGreaterThanOrEqual(1);
    });
  });
});
