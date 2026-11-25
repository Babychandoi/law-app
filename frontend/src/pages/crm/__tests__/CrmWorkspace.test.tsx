import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    listOpportunities: jest.fn(),
    getOpportunityKanban: jest.fn(),
    updateOpportunityStage: jest.fn(),
    listActivities: jest.fn(),
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe('CRM Workspace, Contract KPI Footer, Opportunity Kanban, and Line Items Editor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      },
      meta: { page: 0, pageSize: 20, totalElements: 1, totalPages: 1 },
    });
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

    // Toggle right filter panel
    fireEvent.click(screen.getByRole('button', { name: 'Hiện hoặc ẩn bộ lọc' }));
    expect(screen.getByRole('complementary', { name: 'Bộ lọc dữ liệu' })).toBeInTheDocument();
  });

  test('OpportunityListPage switches between Danh sách and KanBan 7-stage pipeline', async () => {
    render(
      <MemoryRouter initialEntries={['/2025/luatpoip/crm/opportunity']}>
        <OpportunityListPage />
      </MemoryRouter>
    );

    expect(
      await screen.findByText('Tư vấn bảo hộ sáng chế công nghệ sinh học')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'KanBan' }));

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
