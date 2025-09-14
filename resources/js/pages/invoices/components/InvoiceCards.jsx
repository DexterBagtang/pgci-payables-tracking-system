import React from 'react';
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
    Edit
} from 'lucide-react';

const InvoicesDisplay = () => {
    // Static sample data based on your database schema
    const invoices = [
        {
            id: 1,
            si_number: 'SI-2025-001',
            si_date: '2025-01-15',
            si_received_at: '2025-01-18',
            received_date: '2025-01-20',
            payment_type: 'Bank Transfer',
            invoice_amount: 125000.00,
            tax_amount: 15000.00,
            discount_amount: 0.00,
            net_amount: 140000.00,
            invoice_status: 'pending',
            due_date: '2025-02-20',
            notes: 'Hardware procurement for Server Room',
            submitted_at: '2025-01-22',
            submitted_to: 'Accounting Department',
            created_at: '2025-01-18T10:30:00Z',
            purchase_order: {
                po_number: 'PO-2025-001',
                vendor: {
                    name: 'Tech Solutions Inc.',
                    category: 'SAP'
                },
                project: {
                    project_title: 'IT Infrastructure Upgrade',
                    cer_number: 'CER-2025-001'
                }
            }
        },
        {
            id: 2,
            si_number: 'SI-2025-002',
            si_date: '2025-01-20',
            si_received_at: '2025-01-22',
            received_date: '2025-01-25',
            payment_type: 'Check',
            invoice_amount: 85000.00,
            tax_amount: 10200.00,
            discount_amount: 1200.00,
            net_amount: 94000.00,
            invoice_status: 'approved',
            due_date: '2025-02-25',
            notes: 'Office supplies and equipment',
            submitted_at: '2025-01-26',
            submitted_to: 'Finance Manager',
            created_at: '2025-01-22T14:15:00Z',
            purchase_order: {
                po_number: 'PO-2025-002',
                vendor: {
                    name: 'Office Supplies Co.',
                    category: 'Manual'
                },
                project: {
                    project_title: 'Office Renovation Phase 2',
                    cer_number: 'CER-2025-002'
                }
            }
        },
        {
            id: 3,
            si_number: 'SI-2025-003',
            si_date: '2025-01-25',
            si_received_at: '2025-01-28',
            received_date: '2025-01-30',
            payment_type: 'Bank Transfer',
            invoice_amount: 320000.00,
            tax_amount: 38400.00,
            discount_amount: 5000.00,
            net_amount: 353400.00,
            invoice_status: 'processing',
            due_date: '2025-03-02',
            notes: 'Software licenses and maintenance',
            submitted_at: '2025-02-01',
            submitted_to: 'CFO Office',
            created_at: '2025-01-28T09:45:00Z',
            purchase_order: {
                po_number: 'PO-2025-003',
                vendor: {
                    name: 'Software Solutions Ltd.',
                    category: 'SAP'
                },
                project: {
                    project_title: 'ERP System Implementation',
                    cer_number: 'CER-2025-003'
                }
            }
        },
        {
            id: 4,
            si_number: 'SI-2025-004',
            si_date: '2025-02-01',
            si_received_at: '2025-02-03',
            received_date: '2025-02-05',
            payment_type: 'Check',
            invoice_amount: 45000.00,
            tax_amount: 5400.00,
            discount_amount: 0.00,
            net_amount: 50400.00,
            invoice_status: 'rejected',
            due_date: '2025-03-07',
            notes: 'Consulting services - Q1 2025',
            submitted_at: '2025-02-06',
            submitted_to: 'Accounting Department',
            created_at: '2025-02-03T11:20:00Z',
            purchase_order: {
                po_number: 'PO-2025-004',
                vendor: {
                    name: 'Business Consultants Inc.',
                    category: 'Manual'
                },
                project: {
                    project_title: 'Process Optimization Study',
                    cer_number: 'CER-2025-004'
                }
            }
        }
    ];

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
                return <Clock className="w-4 h-4" />;
            case 'approved':
                return <CheckCircle2 className="w-4 h-4" />;
            case 'processing':
                return <FileText className="w-4 h-4" />;
            case 'rejected':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
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
                    <Button variant="outline" size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button size="sm">
                        <DollarSign className="w-4 h-4 mr-2" />
                        New Invoice
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {invoices.map((invoice) => (
                    <Card key={invoice.id} className="hover:shadow-lg transition-shadow duration-200">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-3">
                                    <div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">
                                            {invoice.si_number}
                                        </CardTitle>
                                        <div className="flex items-center mt-1 text-sm text-gray-500">
                                            <Building2 className="w-4 h-4 mr-1" />
                                            {invoice.purchase_order.vendor.name}
                                            <span className="mx-2">•</span>
                                            <span>PO: {invoice.purchase_order.po_number}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {isOverdue(invoice.due_date, invoice.invoice_status) && (
                                        <Badge variant="destructive" className="text-xs">
                                            <AlertCircle className="w-3 h-3 mr-1" />
                                            Overdue
                                        </Badge>
                                    )}
                                    <Badge className={`${getStatusColor(invoice.invoice_status)} text-xs capitalize`}>
                                        {getStatusIcon(invoice.invoice_status)}
                                        <span className="ml-1">{invoice.invoice_status}</span>
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Project Information</h4>
                                        <div className="bg-gray-50 p-3 rounded-md">
                                            <p className="text-sm font-medium text-gray-900">
                                                {invoice.purchase_order.project.project_title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                CER: {invoice.purchase_order.project.cer_number}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Details</h4>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Payment Type:</span>
                                                <span className="font-medium">{invoice.payment_type}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Submitted To:</span>
                                                <span className="font-medium">{invoice.submitted_to}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Important Dates</h4>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Invoice Date:</span>
                                                <span className="font-medium">{formatDate(invoice.si_date)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Received Date:</span>
                                                <span className="font-medium">{formatDate(invoice.received_date)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Due Date:</span>
                                                <span className={`font-medium ${isOverdue(invoice.due_date, invoice.invoice_status) ? 'text-red-600' : ''}`}>
                          {formatDate(invoice.due_date)}
                        </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-2">Amount Breakdown</h4>
                                        <div className="bg-gray-50 p-3 rounded-md space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Invoice Amount:</span>
                                                <span>{formatCurrency(invoice.invoice_amount)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Tax Amount:</span>
                                                <span>{formatCurrency(invoice.tax_amount)}</span>
                                            </div>
                                            {invoice.discount_amount > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-600">Discount:</span>
                                                    <span className="text-green-600">-{formatCurrency(invoice.discount_amount)}</span>
                                                </div>
                                            )}
                                            <div className="border-t pt-1 mt-2">
                                                <div className="flex justify-between text-sm font-semibold">
                                                    <span>Net Amount:</span>
                                                    <span className="text-lg">{formatCurrency(invoice.net_amount)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {invoice.notes && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                        {invoice.notes}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-end space-x-2 pt-2 border-t">
                                <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                </Button>
                                <Button variant="outline" size="sm">
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="flex justify-center pt-6">
                <div className="text-sm text-gray-500">
                    Showing {invoices.length} invoices
                </div>
            </div>
        </div>
    );
};

export default InvoicesDisplay;
