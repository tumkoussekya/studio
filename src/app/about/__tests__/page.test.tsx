
import React from 'react';
import { render, screen } from '@testing-library/react';
import AboutUsPage from '../page';

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode, href: string }) => {
        return <a href={href}>{children}</a>;
    };
});

describe('AboutUsPage', () => {
  it('renders the main heading', () => {
    render(<AboutUsPage />);
    const heading = screen.getByRole('heading', {
      name: /about syncrospace/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('renders the mission, vision, and values cards', () => {
    render(<AboutUsPage />);
    expect(screen.getByText(/our mission/i)).toBeInTheDocument();
    expect(screen.getByText(/our vision/i)).toBeInTheDocument();
    expect(screen.getByText(/our values/i)).toBeInTheDocument();
  });

  it('renders the "Meet the Team" section', () => {
    render(<AboutUsPage />);
    expect(screen.getByRole('heading', { name: /meet the team/i })).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
    expect(screen.getByText('David')).toBeInTheDocument();
  });

  it('contains a link back to the dashboard', () => {
    render(<AboutUsPage />);
    const dashboardLink = screen.getByRole('link', { name: /back to dashboard/i });
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });
});
