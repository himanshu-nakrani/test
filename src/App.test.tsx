import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the hero headline', () => {
    render(<App />)
    expect(screen.getByText(/Build Something/i)).toBeInTheDocument()
    expect(screen.getByText(/Beautiful/i)).toBeInTheDocument()
  })

  it('renders all feature cards', () => {
    render(<App />)
    expect(screen.getByText('Lightning Fast')).toBeInTheDocument()
    expect(screen.getByText('Modern Design')).toBeInTheDocument()
    expect(screen.getByText('Type Safe')).toBeInTheDocument()
    expect(screen.getByText('Component-Based')).toBeInTheDocument()
  })

  it('increments and resets the counter', () => {
    render(<App />)
    const counterBtn = screen.getByText(/Count: 0/)
    fireEvent.click(counterBtn)
    expect(screen.getByText(/Count: 1/)).toBeInTheDocument()

    fireEvent.click(counterBtn)
    fireEvent.click(counterBtn)
    expect(screen.getByText(/Count: 3/)).toBeInTheDocument()

    const resetBtn = screen.getByText('Reset')
    fireEvent.click(resetBtn)
    expect(screen.getByText(/Count: 0/)).toBeInTheDocument()
  })

  it('handles newsletter subscription', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('Enter your email')
    const submitBtn = screen.getByText('Subscribe')

    fireEvent.change(input, { target: { value: 'test@example.com' } })
    fireEvent.click(submitBtn)

    expect(screen.getByText(/Thanks for subscribing/i)).toBeInTheDocument()
  })
})
