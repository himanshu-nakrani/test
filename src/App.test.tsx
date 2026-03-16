import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import App from './App'

beforeEach(() => {
  window.scrollTo = () => {}
  localStorage.clear()
})

describe('AI Models Hub', () => {
  it('renders the hero section with stats and showcase', () => {
    render(<App />)
    const hero = document.querySelector('.hero-section')!
    expect(hero).toBeTruthy()
    expect(within(hero as HTMLElement).getByText(/Explore.*models from.*providers/i)).toBeInTheDocument()
    expect(within(hero as HTMLElement).getByText('🔥 Featured')).toBeInTheDocument()
    expect(within(hero as HTMLElement).getByText('🆕 Recently Released')).toBeInTheDocument()
  })

  it('renders model cards in the grid', () => {
    render(<App />)
    const grid = document.querySelector('.model-grid')!
    expect(grid).toBeTruthy()
    expect(within(grid as HTMLElement).getByText('Claude 4 Opus')).toBeInTheDocument()
  })

  it('filters models by search query', () => {
    render(<App />)
    fireEvent.change(screen.getByPlaceholderText(/Search.*models/i), { target: { value: 'Phi-4' } })
    const grid = document.querySelector('.model-grid')!
    expect(within(grid as HTMLElement).getByText('Phi-4')).toBeInTheDocument()
    expect(within(grid as HTMLElement).queryByText('Claude 4 Opus')).not.toBeInTheDocument()
  })

  it('opens model detail view on card click', () => {
    render(<App />)
    const grid = document.querySelector('.model-grid')!
    fireEvent.click(within(grid as HTMLElement).getByText('Claude 4 Opus'))
    expect(screen.getByText(/Back to all models/i)).toBeInTheDocument()
    expect(screen.getByText(/Specifications/i)).toBeInTheDocument()
  })

  it('navigates back from detail view', () => {
    render(<App />)
    const grid = document.querySelector('.model-grid')!
    fireEvent.click(within(grid as HTMLElement).getByText('Claude 4 Opus'))
    fireEvent.click(screen.getByText(/Back to all models/i))
    expect(document.querySelector('.hero-section')).toBeTruthy()
  })

  it('filters by provider chip', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Microsoft' }))
    const grid = document.querySelector('.model-grid')!
    expect(within(grid as HTMLElement).getByText('Phi-4')).toBeInTheDocument()
    expect(within(grid as HTMLElement).queryByText('Claude 4 Opus')).not.toBeInTheDocument()
  })

  it('switches between grid and table view', () => {
    render(<App />)
    fireEvent.click(screen.getByTitle('Table view'))
    expect(document.querySelector('.model-table')).toBeTruthy()
    fireEvent.click(screen.getByTitle('Grid view'))
    expect(document.querySelector('.model-grid')).toBeTruthy()
  })

  it('navigates to leaderboard page', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Leaderboard' }))
    expect(screen.getByText(/AI Model Leaderboard/i)).toBeInTheDocument()
  })

  it('navigates to cost calculator page', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Pricing' }))
    expect(screen.getByText(/Cost Calculator/i)).toBeInTheDocument()
  })

  it('toggles favorites on model cards', () => {
    render(<App />)
    const favButtons = document.querySelectorAll('.fav-btn')
    expect(favButtons.length).toBeGreaterThan(0)
    fireEvent.click(favButtons[0])
    expect(favButtons[0].classList.contains('is-fav')).toBe(true)
  })
})
