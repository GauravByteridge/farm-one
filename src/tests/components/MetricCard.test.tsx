import { render, screen } from '@testing-library/react'
import { MetricCard } from '@/components/MetricCard'

describe('MetricCard', () => {
  it('renders value and label', () => {
    render(<MetricCard value={42} label="Active Cows" />)
    expect(screen.getByText('Active Cows')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders loading skeleton when isLoading is true', () => {
    render(<MetricCard value={0} label="Test" isLoading />)
    // Loading state renders with aria-busy; the label text is used in aria-label
    const busyEl = document.querySelector('[aria-busy="true"]')
    expect(busyEl).not.toBeNull()
    // Value '0' should NOT be rendered as text when loading
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('renders up trend icon with accessible label', () => {
    render(<MetricCard value={100} label="Test" trend="up" />)
    // The trend span has aria-label="Trending up"
    expect(screen.getByLabelText(/trending up/i)).toBeInTheDocument()
  })
})
