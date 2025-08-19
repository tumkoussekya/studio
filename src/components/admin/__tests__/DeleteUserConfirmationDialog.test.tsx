
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteUserConfirmationDialog } from '../DeleteUserConfirmationDialog';
import { UserData } from '@/app/admin/page';
import { useToast } from '@/hooks/use-toast';

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

const mockUser: UserData = {
  id: '123',
  email: 'test@example.com',
  role: 'TeamMember',
  lastX: 0,
  lastY: 0,
};

describe('DeleteUserConfirmationDialog', () => {
  const setIsOpen = jest.fn();
  const onUserUpdate = jest.fn();

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    setIsOpen.mockClear();
    onUserUpdate.mockClear();
  });

  it('renders the dialog with user email when open', () => {
    render(
      <DeleteUserConfirmationDialog
        isOpen={true}
        setIsOpen={setIsOpen}
        user={mockUser}
        onUserUpdate={onUserUpdate}
      />
    );

    expect(screen.getByText(/are you absolutely sure/i)).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });

  it('does not render the dialog when closed', () => {
    render(
      <DeleteUserConfirmationDialog
        isOpen={false}
        setIsOpen={setIsOpen}
        user={mockUser}
        onUserUpdate={onUserUpdate}
      />
    );

    expect(screen.queryByText(/are you absolutely sure/i)).not.toBeInTheDocument();
  });

  it('calls setIsOpen(false) when cancel button is clicked', () => {
    render(
      <DeleteUserConfirmationDialog
        isOpen={true}
        setIsOpen={setIsOpen}
        user={mockUser}
        onUserUpdate={onUserUpdate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    // Radix dialog calls onOpenChange which is passed to setIsOpen
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });

  it('calls the delete API and onUserUpdate when delete is confirmed', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'User deleted' }),
    });
    
    const { toast } = useToast();

    render(
      <DeleteUserConfirmationDialog
        isOpen={true}
        setIsOpen={setIsOpen}
        user={mockUser}
        onUserUpdate={onUserUpdate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /yes, delete user/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(`/api/admin/users/${mockUser.id}`, {
        method: 'DELETE',
      });
    });

    expect(onUserUpdate).toHaveBeenCalledTimes(1);
    expect(setIsOpen).toHaveBeenCalledWith(false);
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({ title: 'User Deleted' }));
  });
  
    it('shows an error toast if the API call fails', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ message: 'Server error' }),
    });

    const { toast } = useToast();

    render(
      <DeleteUserConfirmationDialog
        isOpen={true}
        setIsOpen={setIsOpen}
        user={mockUser}
        onUserUpdate={onUserUpdate}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /yes, delete user/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    expect(onUserUpdate).not.toHaveBeenCalled();
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Server error'
    }));
  });
});
