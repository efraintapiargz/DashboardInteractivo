import { render, screen, fireEvent } from '@testing-library/react';
import ApodCard from '@/components/ApodCard';
import * as useApodModule from '@/hooks/useApod';
import type { ApodResponse, ApiError } from '@/types';

jest.mock('@/hooks/useApod');

const mockUseApod = useApodModule.useApod as jest.MockedFunction<
  typeof useApodModule.useApod
>;

const MOCK_APOD: ApodResponse = {
  date: '2024-01-15',
  title: 'The Crab Nebula',
  explanation: 'A beautiful supernova remnant in Taurus.',
  url: 'https://apod.nasa.gov/apod/image/test.jpg',
  hdurl: 'https://apod.nasa.gov/apod/image/test_hd.jpg',
  media_type: 'image',
  service_version: 'v1',
};

const MOCK_ERROR: ApiError = {
  message: 'Network error',
  statusCode: null,
  endpoint: '/apod',
  timestamp: '2024-01-15T00:00:00.000Z',
};

describe('ApodCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a loading skeleton while data is loading', () => {
    mockUseApod.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<ApodCard />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an error message with retry button on error', () => {
    const refetchFn = jest.fn();
    mockUseApod.mockReturnValue({
      data: null,
      isLoading: false,
      error: MOCK_ERROR,
      refetch: refetchFn,
    });

    render(<ApodCard />);
    expect(screen.getByRole('alert')).toHaveTextContent('Network error');
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetchFn).toHaveBeenCalledTimes(1);
  });

  it('renders the APOD image card when data is available', () => {
    mockUseApod.mockReturnValue({
      data: MOCK_APOD,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ApodCard />);
    expect(screen.getByRole('article')).toHaveAttribute(
      'aria-label',
      'Astronomy Picture of the Day',
    );
    expect(screen.getByRole('img', { name: 'The Crab Nebula' })).toBeInTheDocument();
    expect(screen.getByText('The Crab Nebula')).toBeInTheDocument();
    expect(screen.getByText(/beautiful supernova remnant/i)).toBeInTheDocument();
  });

  it('renders an iframe when media_type is video', () => {
    mockUseApod.mockReturnValue({
      data: {
        ...MOCK_APOD,
        media_type: 'video',
        url: 'https://www.youtube.com/embed/test',
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ApodCard />);
    const iframe = screen.getByTitle('The Crab Nebula');
    expect(iframe.tagName).toBe('IFRAME');
  });

  it('shows copyright when present', () => {
    mockUseApod.mockReturnValue({
      data: { ...MOCK_APOD, copyright: 'NASA/ESA' },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ApodCard />);
    expect(screen.getByText(/NASA\/ESA/)).toBeInTheDocument();
  });

  it('renders nothing when data is null and not loading', () => {
    mockUseApod.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { container } = render(<ApodCard />);
    expect(container.innerHTML).toBe('');
  });

  it('has a date picker for navigation', () => {
    mockUseApod.mockReturnValue({
      data: MOCK_APOD,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<ApodCard />);
    const datePicker = screen.getByLabelText('Select APOD date');
    expect(datePicker).toBeInTheDocument();
    expect(datePicker).toHaveAttribute('type', 'date');
  });
});
