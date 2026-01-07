import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';

interface UserFormProps {
    roleOptions: Record<string, string>;
    modules: string[];
    isEdit: boolean;
    user?: {
        id: number;
        name: string;
        username: string;
        email: string;
        role: string;
        permissions: {
            read: string[];
            write: string[];
        };
    };
}

export default function UserForm({ roleOptions, modules, isEdit, user }: UserFormProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        name: user?.name || '',
        username: user?.username || '',
        email: user?.email || '',
        password: '',
        password_confirmation: '',
        role: user?.role || '',
        permissions: user?.permissions || { read: [], write: [] },
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (isEdit && user) {
            put(`/users/${user.id}`, {
                preserveScroll: true,
            });
        } else {
            post('/users', {
                preserveScroll: true,
            });
        }
    };

    const togglePermission = (module: string, type: 'read' | 'write') => {
        const permissions = { ...data.permissions };
        const index = permissions[type].indexOf(module);

        if (index === -1) {
            permissions[type].push(module);
        } else {
            permissions[type].splice(index, 1);
        }

        setData('permissions', permissions);
    };

    const formatModuleName = (module: string) => {
        return module
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <form onSubmit={submit}>
            <Card>
                <CardHeader>
                    <CardTitle>{isEdit ? 'Edit User' : 'Create New User'}</CardTitle>
                    <CardDescription>
                        {isEdit ? 'Update user information and permissions' : 'Add a new user to the system'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Basic Information</h3>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    value={data.username}
                                    onChange={(e) => setData('username', e.target.value)}
                                    required
                                />
                                {errors.username && (
                                    <p className="text-sm text-destructive">{errors.username}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Select
                                value={data.role}
                                onValueChange={(value) => setData('role', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(roleOptions).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role && (
                                <p className="text-sm text-destructive">{errors.role}</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Password */}
                    {!isEdit && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium">Password</h3>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required={!isEdit}
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-destructive">{errors.password}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">Confirm Password</Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required={!isEdit}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {!isEdit && <Separator />}

                    {/* Permissions */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium">Permissions</h3>
                            <p className="text-sm text-muted-foreground">
                                Select which modules this user can read and write
                            </p>
                        </div>

                        <div className="rounded-md border">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-4 text-left font-medium">Module</th>
                                        <th className="p-4 text-center font-medium">Read</th>
                                        <th className="p-4 text-center font-medium">Write</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modules.filter(m => m !== 'users').map((module, index) => (
                                        <tr key={module} className={index % 2 === 0 ? 'bg-muted/20' : ''}>
                                            <td className="p-4">{formatModuleName(module)}</td>
                                            <td className="p-4 text-center">
                                                <Checkbox
                                                    checked={data.permissions.read.includes(module)}
                                                    onCheckedChange={() => togglePermission(module, 'read')}
                                                />
                                            </td>
                                            <td className="p-4 text-center">
                                                <Checkbox
                                                    checked={data.permissions.write.includes(module)}
                                                    onCheckedChange={() => togglePermission(module, 'write')}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
