import { render, screen, fireEvent } from '@testing-library/react';
import { DateRangePicker } from '@/components/filters/DateRangePicker';

describe('DateRangePicker', () => {
  const defaultProps = {
    startDate: '2024-01-01',
    endDate: '2024-01-05',
    onStartDateChange: jest.fn(),
    onEndDateChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders start and end date inputs', () => {
    render(<DateRangePicker {...defaultProps} />);

    const startInput = screen.getByLabelText('Start date');
    const endInput = screen.getByLabelText('End date');

    expect(startInput).toBeInTheDocument();
    expect(endInput).toBeInTheDocument();
  });

  it('displays the correct initial values', () => {
    render(<DateRangePicker {...defaultProps} />);

    const startInput = screen.getByLabelText('Start date') as HTMLInputElement;
    const endInput = screen.getByLabelText('End date') as HTMLInputElement;

    expect(startInput.value).toBe('2024-01-01');
    expect(endInput.value).toBe('2024-01-05');
  });

  it('calls onStartDateChange when start date changes with valid range', () => {
    render(<DateRangePicker {...defaultProps} />);

    const startInput = screen.getByLabelText('Start date');
    fireEvent.change(startInput, { target: { value: '2024-01-02' } });

    expect(defaultProps.onStartDateChange).toHaveBeenCalledWith('2024-01-02');
  });

  it('calls onEndDateChange when end date changes with valid range', () => {
    render(<DateRangePicker {...defaultProps} />);

    const endInput = screen.getByLabelText('End date');
    fireEvent.change(endInput, { target: { value: '2024-01-06' } });

    expect(defaultProps.onEndDateChange).toHaveBeenCalledWith('2024-01-06');
  });

  it('shows validation error when range exceeds 30 days', () => {
    render(<DateRangePicker {...defaultProps} />);

    const endInput = screen.getByLabelText('End date');
    fireEvent.change(endInput, { target: { value: '2024-02-15' } });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Date range cannot exceed 30 days.',
    );
    expect(defaultProps.onEndDateChange).not.toHaveBeenCalled();
  });

  it('shows validation error when end date is before start date', () => {
    render(<DateRangePicker {...defaultProps} />);

    const endInput = screen.getByLabelText('End date');
    fireEvent.change(endInput, { target: { value: '2023-12-25' } });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'End date must be after start date.',
    );
    expect(defaultProps.onEndDateChange).not.toHaveBeenCalled();
  });

  it('has proper ARIA group role', () => {
    render(<DateRangePicker {...defaultProps} />);
    expect(screen.getByRole('group')).toHaveAttribute(
      'aria-label',
      'Date range picker',
    );
  });
});
