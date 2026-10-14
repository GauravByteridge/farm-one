import { render, screen } from '@testing-library/react'
import { StatusBadge } from '@/components/StatusBadge'

describe('StatusBadge', () => {
  it('renders certified status with green chip and check text', () => {
    render(<StatusBadge status="certified" />)
    // aria-label on the span element
    const badge = screen.getByLabelText(/status: certified/i)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-emerald-100')
    expect(screen.getByText('Certified')).toBeInTheDocument()
  })

  it('renders in_review status with amber chip', () => {
    render(<StatusBadge status="in_review" />)
    const badge = screen.getByLabelText(/status: in review/i)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-amber-100')
    expect(screen.getByText('In Review')).toBeInTheDocument()
  })

  it('renders draft status with grey chip', () => {
    render(<StatusBadge status="draft" />)
    const badge = screen.getByLabelText(/status: draft/i)
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-gray-100')
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })
})
