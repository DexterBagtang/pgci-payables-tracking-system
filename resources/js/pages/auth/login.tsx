import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import AuthLayout from '@/layouts/auth-layout';
import { Form, Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(AuthenticatedSessionController.store.url(), {
            onSuccess: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your username and password below to log in">
            <Head title="Log in" />

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            name="username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="username"
                            placeholder="Username"
                        />
                        <InputError message={errors.username} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            {canResetPassword && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            className="ml-auto text-sm text-primary underline-offset-4 hover:underline"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Please contact IT for password reset assistance</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Log in
                    </Button>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
