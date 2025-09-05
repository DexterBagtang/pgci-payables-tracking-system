import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Calendar,
    FileText,
    DollarSign,
    Building2,
    Clock,
    AlertCircle,
    CheckCircle2,
    Eye,
    Edit,
    ChevronDown,
    ChevronUp,
    Filter
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {Link} from '@inertiajs/react'

const InvoicesTable = ({invoices}) => {

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'processing':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-3 h-3 mr-1" />;
            case 'approved':
                return <CheckCircle2 className="w-3 h-3 mr-1" />;
            case 'processing':
                return <FileText className="w-3 h-3 mr-1" />;
            case 'rejected':
                return <AlertCircle className="w-3 h-3 mr-1" />;
            default:
                return <FileText className="w-3 h-3 mr-1" />;
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(dateString));
    };

    const isOverdue = (dueDate, status) => {
        const today = new Date();
        const due = new Date(dueDate);
        return due < today && status !== 'approved';
    };

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-600 mt-1">Manage and track all supplier invoices</p>
                </div>
                <div className="flex items-center space-x-3">
                    <Link href="/invoices/create" prefetch>
                        <Button size="sm">
                            <DollarSign className="w-4 h-4 mr-2" />
                            New Invoice
                        </Button>
                    </Link>

                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">All Invoices</CardTitle>
                        <div className="flex space-x-2">
                            <Input placeholder="Search invoices..." className="max-w-sm" />
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Filter className="w-4 h-4 mr-2" />
                                        Filter
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuCheckboxItem checked>
                                        All Status
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem>
                                        Pending
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem>
                                        Approved
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem>
                                        Processing
                                    </DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem>
                                        Rejected
                                    </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Invoice & PO</TableHead>
                                <TableHead className="w-[260px]">Vendor & Project</TableHead>
                                <TableHead>Dates</TableHead>
                                <TableHead>Amounts</TableHead>
                                <TableHead>Payment & Submission</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{invoice.si_number}</span>
                                            <span className="text-sm text-gray-500 mt-1">
                                                PO: {invoice.purchase_order.po_number}
                                              </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <div className="flex items-center">
                                                <Building2 className="w-4 h-4 mr-1 text-gray-500" />
                                                <span className="font-medium">{invoice.purchase_order.vendor.name}</span>
                                                <Badge variant="outline" className="ml-2 text-xs">
                                                    {invoice.purchase_order.vendor.category}
                                                </Badge>
                                            </div>
                                            <div className="mt-1 text-sm">
                                                <div>{invoice.purchase_order.project.project_title}</div>
                                                <div className="text-gray-500">CER: {invoice.purchase_order.project.cer_number}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col space-y-1 text-sm">
                                            <div>
                                                <div className="text-gray-500">Invoice:</div>
                                                <div>{formatDate(invoice.si_date)}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Received:</div>
                                                <div>{formatDate(invoice.received_date)}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Due:</div>
                                                <div className={isOverdue(invoice.due_date, invoice.invoice_status) ? 'text-red-600 font-medium' : ''}>
                                                    {formatDate(invoice.due_date)}
                                                    {isOverdue(invoice.due_date, invoice.invoice_status) && (
                                                        <AlertCircle className="w-3 h-3 inline ml-1" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Amount:</span>
                                                <span>{formatCurrency(invoice.invoice_amount)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Tax:</span>
                                                <span>{formatCurrency(invoice.tax_amount)}</span>
                                            </div>
                                            {invoice.discount_amount > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Discount:</span>
                                                    <span className="text-green-600">-{formatCurrency(invoice.discount_amount)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between border-t pt-1 mt-1 font-medium">
                                                <span>Net:</span>
                                                <span>{formatCurrency(invoice.net_amount)}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col space-y-1 text-sm">
                                            <div>
                                                <div className="text-gray-500">Date Submitted:</div>
                                                <div>{invoice.submitted_at}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500">Submitted To:</div>
                                                <div>{invoice.submitted_to}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <Badge className={`${getStatusColor(invoice.invoice_status)} capitalize justify-center`}>
                                                {getStatusIcon(invoice.invoice_status)}
                                                {invoice.invoice_status}
                                            </Badge>
                                            {isOverdue(invoice.due_date, invoice.invoice_status) && (
                                                <Badge variant="destructive" className="mt-1 text-xs justify-center">
                                                    <AlertCircle className="w-3 h-3 mr-1" />
                                                    Overdue
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="ghost" size="icon">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-gray-500">
                    Showing {invoices.length} invoices
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" disabled>
                        Previous
                    </Button>
                    <Button variant="outline" size="sm">
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default InvoicesTable;
