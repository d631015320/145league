import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import Icon from '../../components/common/Icon'

describe('Icon', () => {
  it('renders HelpCircle when name is empty', () => {
    const { container } = render(<Icon name="" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders HelpCircle when name is not provided', () => {
    const { container } = render(<Icon />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders correct icon for valid name', () => {
    const { container } = render(<Icon name="home" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders icon with kebab-case name', () => {
    const { container } = render(<Icon name="layout-dashboard" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('applies className to icon', () => {
    const { container } = render(<Icon name="home" className="w-6 h-6 text-red-500" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveClass('w-6', 'h-6', 'text-red-500')
  })

  it('renders fallback icon for invalid name', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<Icon name="invalid-icon-name-xyz" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('matches snapshot with home icon', () => {
    const { container } = render(<Icon name="home" className="w-5 h-5" />)
    expect(container).toMatchSnapshot()
  })

  it('matches snapshot with layout-dashboard icon', () => {
    const { container } = render(<Icon name="layout-dashboard" />)
    expect(container).toMatchSnapshot()
  })
})
