import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '../button';

describe('Button', () => {
  it('renders the button with its children', () => {
    render(<Button>Click Me</Button>);
    
    const buttonElement = screen.getByRole('button', { name: /click me/i });
    
    expect(buttonElement).toBeInTheDocument();
  });

  it('applies the correct default variant class', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass('bg-primary');
  });

  it('is disabled when the disabled prop is passed', () => {
    render(<Button disabled>Click Me</Button>);
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toBeDisabled();
  });
});
