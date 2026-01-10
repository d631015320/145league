import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Avatar from '../../components/common/Avatar'

describe('Avatar', () => {
  it('renders with name initial when no src provided', () => {
    const { container } = render(<Avatar name="Alice" />)
    expect(container.querySelector('span')).toHaveTextContent('A')
  })

  it('renders image when src is provided', () => {
    const { container } = render(<Avatar name="Alice" src="https://example.com/avatar.jpg" />)
    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg')
    expect(img).toHaveAttribute('alt', 'Alice')
  })

  it('renders question mark when name is empty', () => {
    const { container } = render(<Avatar name="" />)
    expect(container.querySelector('span')).toHaveTextContent('?')
  })

  it('applies correct size classes', () => {
    const { container: smContainer } = render(<Avatar name="A" size="sm" />)
    expect(smContainer.firstChild).toHaveClass('w-8', 'h-8')

    const { container: lgContainer } = render(<Avatar name="A" size="lg" />)
    expect(lgContainer.firstChild).toHaveClass('w-16', 'h-16')
  })

  it('applies border when bordered is true', () => {
    const { container } = render(<Avatar name="A" bordered={true} />)
    expect(container.firstChild).toHaveClass('border-2')
  })

  it('does not apply border when bordered is false', () => {
    const { container } = render(<Avatar name="A" bordered={false} />)
    expect(container.firstChild).not.toHaveClass('border-2')
  })

  it('matches snapshot with default props', () => {
    const { container } = render(<Avatar name="Test" />)
    expect(container).toMatchSnapshot()
  })

  it('matches snapshot with image', () => {
    const { container } = render(<Avatar name="Test" src="https://example.com/test.jpg" size="lg" />)
    expect(container).toMatchSnapshot()
  })
})
