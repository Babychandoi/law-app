import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import DataTable, { type Column } from '../DataTable';

// DataTable dùng useSearchParams -> cần Router context khi test.
const renderR = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

interface Row {
  id: string;
  name: string;
  age: number;
}

const DATA: Row[] = [
  { id: '1', name: 'Charlie', age: 30 },
  { id: '2', name: 'Alice', age: 25 },
  { id: '3', name: 'Bob', age: 40 },
];

const columns: Column<Row>[] = [
  { key: 'name', header: 'Tên', sortable: true },
  { key: 'age', header: 'Tuổi', sortable: true, sortValue: (r) => r.age },
];

const setup = (props: Partial<React.ComponentProps<typeof DataTable<Row>>> = {}) =>
  renderR(<DataTable columns={columns} data={DATA} rowKey={(r) => r.id} {...props} />);

// DataTable render cả bảng desktop lẫn thẻ mobile trong DOM (chỉ ẩn bằng CSS),
// nên các assertion về nội dung được giới hạn trong <table> để tránh trùng khớp.
const rowsOf = () => within(screen.getByRole('table')).getAllByRole('row').slice(1);

describe('DataTable', () => {
  it('hiển thị tất cả hàng', () => {
    setup();
    const table = screen.getByRole('table');
    expect(within(table).getByText('Charlie')).toBeInTheDocument();
    expect(within(table).getByText('Alice')).toBeInTheDocument();
    expect(within(table).getByText('Bob')).toBeInTheDocument();
  });

  it('hiển thị trạng thái rỗng khi không có dữ liệu', () => {
    setup({ data: [], emptyTitle: 'Trống trơn' });
    expect(screen.getByText('Trống trơn')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('hiển thị spinner khi loading', () => {
    setup({ loading: true });
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('tìm kiếm lọc hàng', async () => {
    setup({ searchable: true, searchText: (r) => r.name });
    await userEvent.type(screen.getByPlaceholderText('Tìm kiếm...'), 'Ali');
    const table = screen.getByRole('table');
    expect(within(table).getByText('Alice')).toBeInTheDocument();
    expect(within(table).queryByText('Charlie')).not.toBeInTheDocument();
    expect(within(table).queryByText('Bob')).not.toBeInTheDocument();
  });

  it('sắp xếp theo cột số tăng dần rồi giảm dần', async () => {
    setup();
    const sortBtn = within(screen.getByRole('table')).getByRole('button', { name: /Tuổi/ });

    // Lần bấm 1: tăng dần -> Alice(25), Charlie(30), Bob(40)
    await userEvent.click(sortBtn);
    let bodyRows = rowsOf();
    expect(within(bodyRows[0]).getByText('Alice')).toBeInTheDocument();
    expect(within(bodyRows[2]).getByText('Bob')).toBeInTheDocument();

    // Lần bấm 2: giảm dần -> Bob(40) lên đầu
    await userEvent.click(sortBtn);
    bodyRows = rowsOf();
    expect(within(bodyRows[0]).getByText('Bob')).toBeInTheDocument();
  });

  it('phân trang: giới hạn số hàng và chuyển trang', async () => {
    const many: Row[] = Array.from({ length: 5 }, (_, i) => ({
      id: String(i),
      name: `User ${i}`,
      age: i,
    }));
    renderR(<DataTable columns={columns} data={many} rowKey={(r) => r.id} pageSize={2} />);

    // Trang 1: 2 hàng
    expect(rowsOf()).toHaveLength(2);
    expect(within(screen.getByRole('table')).getByText('User 0')).toBeInTheDocument();

    // Sang trang sau
    await userEvent.click(screen.getByRole('button', { name: 'Trang sau' }));
    expect(within(screen.getByRole('table')).getByText('User 2')).toBeInTheDocument();
    expect(within(screen.getByRole('table')).queryByText('User 0')).not.toBeInTheDocument();
  });
});
