import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom';
import { toast } from 'react-toastify';
import documentTemplateService from '../../../service/documentTemplates';
import { DocumentTemplate } from '../../../types/documentTemplate';
import TemplateFieldEditor from '../TemplateFieldEditor';

jest.mock('../../../service/documentTemplates', () => ({
  __esModule: true,
  default: {
    getTemplate: jest.fn(),
    updateFields: jest.fn(),
    publish: jest.fn(),
    preview: jest.fn(),
    listTemplateVersions: jest.fn(),
  },
}));

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

const service = documentTemplateService as jest.Mocked<typeof documentTemplateService>;

const createTemplate = (revision?: number): DocumentTemplate => ({
  id: 'template-1',
  name: 'Hợp đồng dịch vụ',
  status: 'DRAFT',
  version: 1,
  fileSize: 1024,
  revision,
  fields: [
    {
      fieldKey: 'customerName',
      label: 'Tên khách hàng',
      inputType: 'TEXT',
      required: true,
      sortOrder: 1,
    },
  ],
});

function TestOutlet() {
  return <Outlet context={{ isAdmin: true }} />;
}

function renderEditor() {
  return render(
    <MemoryRouter initialEntries={['/2025/luatpoip/tai-lieu/templates/template-1/edit']}>
      <Routes>
        <Route element={<TestOutlet />}>
          <Route
            path="/2025/luatpoip/tai-lieu/templates/:id/edit"
            element={<TemplateFieldEditor />}
          />
          <Route path="/2025/luatpoip/tai-lieu" element={<div>Danh sách</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe('TemplateFieldEditor save and publish', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('gửi toàn bộ field trong publish nguyên tử khi server có revision', async () => {
    const initial = createTemplate(7);
    service.getTemplate.mockResolvedValue(initial);
    service.publish.mockResolvedValue({
      ...initial,
      status: 'ACTIVE',
      revision: 8,
      fields: [{ ...initial.fields[0], label: 'Tên pháp lý' }],
    });
    renderEditor();

    const label = await screen.findByLabelText('Nhãn hiển thị');
    await userEvent.clear(label);
    await userEvent.type(label, 'Tên pháp lý');
    await userEvent.click(screen.getByRole('button', { name: /Lưu & xuất bản/i }));

    await waitFor(() =>
      expect(service.publish).toHaveBeenCalledWith(
        'template-1',
        expect.objectContaining({
          expectedRevision: 7,
          fields: [expect.objectContaining({ label: 'Tên pháp lý' })],
        })
      )
    );
    expect(service.updateFields).not.toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Đã lưu và xuất bản biểu mẫu');
  });

  it('lưu field trước rồi mới publish khi kết nối server cũ', async () => {
    const initial = createTemplate();
    const saved = {
      ...initial,
      fields: [{ ...initial.fields[0], label: 'Tên mới' }],
    };
    service.getTemplate.mockResolvedValue(initial);
    service.updateFields.mockResolvedValue(saved);
    service.publish.mockResolvedValue({ ...saved, status: 'ACTIVE' });
    renderEditor();

    const label = await screen.findByLabelText('Nhãn hiển thị');
    await userEvent.clear(label);
    await userEvent.type(label, 'Tên mới');
    await userEvent.click(screen.getByRole('button', { name: /Lưu & xuất bản/i }));

    await waitFor(() => expect(service.publish).toHaveBeenCalledWith('template-1'));
    expect(service.updateFields).toHaveBeenCalledWith('template-1', [
      expect.objectContaining({ label: 'Tên mới' }),
    ]);
    expect(service.updateFields.mock.invocationCallOrder[0]).toBeLessThan(
      service.publish.mock.invocationCallOrder[0]
    );
  });
});
