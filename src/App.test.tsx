import { render, screen, fireEvent, within } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import App from './App'

beforeEach(() => {
  window.scrollTo = () => {}
  localStorage.clear()
})

describe('AI Models Hub', () => {
  it('renders the hero section with animated stats', () => {
    render(<App />)
    const hero = document.querySelector('.hero-section')!
    expect(hero).toBeTruthy()
    expect(within(hero as HTMLElement).getByText(/Explore.*models from.*providers/i)).toBeInTheDocument()
  })

  it('renders model cards on the home page', () => {
    render(<App />)
    expect(screen.getByText('GPT-4o')).toBeInTheDocument()
    expect(screen.getByText('Claude 4 Opus')).toBeInTheDocument()
    expect(screen.getByText('Gemini 2.5 Pro')).toBeInTheDocument()
  })

  it('filters models by search query', () => {
    render(<App />)
    const searchInput = screen.getByPlaceholderText(/Search.*models/i)
    fireEvent.change(searchInput, { target: { value: 'Claude' } })
    expect(screen.getByText('Claude 4 Opus')).toBeInTheDocument()
    expect(screen.getByText('Claude 4 Sonnet')).toBeInTheDocument()
    expect(screen.queryByText('GPT-4o')).not.toBeInTheDocument()
  })

  it('opens model detail view on card click', () => {
    render(<App />)
    fireEvent.click(screen.getByText('GPT-4o'))
    expect(screen.getByText(/Back to all models/i)).toBeInTheDocument()
    expect(screen.getByText(/Specifications/i)).toBeInTheDocument()
    expect(screen.getByText(/Related Models/i)).toBeInTheDocument()
  })

  it('navigates back from detail view', () => {
    render(<App />)
    fireEvent.click(screen.getByText('GPT-4o'))
    expect(screen.getByText(/Back to all models/i)).toBeInTheDocument()
    fireEvent.click(screen.getByText(/Back to all models/i))
    expect(document.querySelector('.hero-section')).toBeTruthy()
  })

  it('filters by provider chip', () => {
    render(<App />)
    const anthropicChip = screen.getByRole('button', { name: 'Anthropic' })
    fireEvent.click(anthropicChip)
    expect(screen.getByText('Claude 4 Opus')).toBeInTheDocument()
    expect(screen.queryByText('GPT-4o')).not.toBeInTheDocument()
  })

  it('switches between grid and table view', () => {
    render(<App />)
    const tableBtn = screen.getByTitle('Table view')
    fireEvent.click(tableBtn)
    expect(document.querySelector('.model-table')).toBeTruthy()
    const gridBtn = screen.getByTitle('Grid view')
    fireEvent.click(gridBtn)
    expect(document.querySelector('.model-grid')).toBeTruthy()
  })

  it('toggles favorites on model cards', () => {
    render(<App />)
    const favButtons = document.querySelectorAll('.fav-btn')
    expect(favButtons.length).toBeGreaterThan(0)
    fireEvent.click(favButtons[0])
    expect(favButtons[0].classList.contains('is-fav')).toBe(true)
  })
})
