'use client';

import React, { useEffect, useState, startTransition } from 'react';
import type { User } from '@/models/User';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, UserPlus, Users, Trash2, Edit, Save, Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { EditUserRoleDialog } from '@/components/admin/EditUserRoleDialog';
import { DeleteUserConfirmationDialog } from '@/components/admin/DeleteUserConfirmationDialog';
import { InviteUserDialog } from '@/components/admin/InviteUserDialog';
import { Input } from '@/components/ui/input';

export type UserData = Omit<User, 'passwordHash'>;

function DomainRestrictionSettings() {
    const [domain, setDomain] = useState<string | null>(null);
    const [initialDomain, setInitialDomain] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSettings = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/admin/settings');
                if (!response.ok) throw new Error('Failed to fetch settings');
                const data = await response.json();
                setDomain(data.domain || '');
                setInitialDomain(data.domain || '');
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [toast]);
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ domain: domain || null })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Failed to save settings');
            
            toast({ title: 'Settings Saved', description: 'Domain restriction has been updated.' });
            setInitialDomain(domain);
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Domain Restriction</CardTitle>
                <CardDescription>
                    Restrict sign-ups to a specific email domain (e.g., yourcompany.com). Leave blank to allow any email address.
                </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <div className="flex items-center gap-2 flex-grow">
                    <span className="text-muted-foreground">@</span>
                    <Input 
                        placeholder="yourcompany.com" 
                        value={domain || ''} 
                        onChange={(e) => setDomain(e.target.value)}
                        disabled={isSaving}
                    />
                </div>
                 <Button onClick={handleSave} disabled={isSaving || domain === initialDomain}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save
                </Button>
            </CardContent>
            <CardContent>
                {initialDomain ? (
                    <div className="flex items-center text-sm text-green-600">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Sign-ups are currently restricted to @{initialDomain}.
                    </div>
                ) : (
                    <div className="flex items-center text-sm text-yellow-600">
                        <ShieldOff className="mr-2 h-4 w-4" />
                        Sign-ups are currently open to all domains.
                    </div>
                )}
            </CardContent>
        </Card>
    )
}


export default function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/users');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = (action: string, email: string) => {
    toast({
      title: `${action}`,
      description: `This action for ${email} is a placeholder.`,
    });
  };

  const getBadgeVariant = (role: User['role']) => {
    switch (role) {
      case 'Admin':
        return 'default';
      case 'TeamMember':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  const handleOpenEdit = (user: UserData) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };
  
  const handleOpenDelete = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  }

  const onUserUpdate = () => {
    startTransition(() => {
        fetchUsers();
    });
  }

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        <header className="p-4 border-b">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-primary" />
            Administrator Panel
          </h1>
        </header>
        <main className="flex-grow p-4 md:p-6 lg:p-8 space-y-6">
          <DomainRestrictionSettings />
          <Card>
            <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage all users in the system.
                </CardDescription>
              </div>
              <Button onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </CardHeader>
            <CardContent>
             <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Role</TableHead>
                    <TableHead className="hidden lg:table-cell">Last Position (X, Y)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-20" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-5 w-16" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : users.length > 0 ? (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={getBadgeVariant(user.role)}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          ({user.lastX}, {user.lastY})
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAction('Reset Password', user.email)}>
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => handleOpenDelete(user)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
             </div>
            </CardContent>
          </Card>
        </main>
      </div>
      <InviteUserDialog isOpen={isInviteModalOpen} setIsOpen={setIsInviteModalOpen} />
       {selectedUser && (
        <>
          <EditUserRoleDialog 
            isOpen={isEditModalOpen} 
            setIsOpen={setIsEditModalOpen}
            user={selectedUser}
            onUserUpdate={onUserUpdate}
          />
          <DeleteUserConfirmationDialog 
             isOpen={isDeleteModalOpen}
             setIsOpen={setIsDeleteModalOpen}
             user={selectedUser}
             onUserUpdate={onUserUpdate}
          />
        </>
      )}
    </>
  );
}
