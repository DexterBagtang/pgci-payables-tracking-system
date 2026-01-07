import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import UserForm from '@/pages/users/components/UserForm';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key } from 'lucide-react';
import { FormEventHandler } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: string;
    permissions: {
        read: string[];
        write: string[];
    };
}

interface PageProps {
    user: User;
    roleOptions: Record<string, string>;
    modules: string[];
}

export default function EditUser({ user, roleOptions, modules }: PageProps) {
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Users',
            href: '/users',
        },
        {
            title: user.name,
            href: `/users/${user.id}`,
        },
        {
            title: 'Edit',
            href: `/users/${user.id}/edit`,
        },
    ];

    const passwordForm = useForm({
        password: '',
        password_confirmation: '',
    });

    const handlePasswordReset: FormEventHandler = (e) => {
        e.preventDefault();
        passwordForm.post(`/users/${user.id}/reset-password`, {
            onSuccess: () => {
                setIsPasswordDialogOpen(false);
                passwordForm.reset();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit ${user.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="py-6">
                    <div className="mx-auto max-w-4xl space-y-6 sm:px-6 lg:px-8">
                        {/* Password Reset Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Password Management</CardTitle>
                                <CardDescription>
                                    Reset the user's password
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline">
                                            <Key className="mr-2 h-4 w-4" />
                                            Reset Password
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Reset Password</DialogTitle>
                                            <DialogDescription>
                                                Enter a new password for {user.name}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handlePasswordReset} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="password">New Password</Label>
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    value={passwordForm.data.password}
                                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                    required
                                                />
                                                {passwordForm.errors.password && (
                                                    <p className="text-sm text-destructive">
                                                        {passwordForm.errors.password}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="password_confirmation">
                                                    Confirm Password
                                                </Label>
                                                <Input
                                                    id="password_confirmation"
                                                    type="password"
                                                    value={passwordForm.data.password_confirmation}
                                                    onChange={(e) =>
                                                        passwordForm.setData('password_confirmation', e.target.value)
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsPasswordDialogOpen(false)}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={passwordForm.processing}>
                                                    {passwordForm.processing ? 'Resetting...' : 'Reset Password'}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>

                        {/* User Edit Form */}
                        <UserForm
                            roleOptions={roleOptions}
                            modules={modules}
                            isEdit={true}
                            user={user}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
