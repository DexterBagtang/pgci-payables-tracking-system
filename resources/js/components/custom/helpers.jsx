import { File, Image, FileText, FileSpreadsheet, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge.js';
import React from 'react';

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Add this helper function to get file icon based on type
export const getFileIcon = (fileType) => {
    if (fileType.includes('image')) {
        return <Image className="h-4 w-4" />;
    } else if (fileType.includes('pdf')) {
        return <FileText className="h-4 w-4" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
        return <FileSpreadsheet className="h-4 w-4" />;
    } else if (fileType.includes('word')) {
        return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
};



export function getUniqueProjectsWithFormattedDate(orders) {
    const projectMap = new Map();

    orders.forEach(order => {
        if (order.project) {
            const projectId = order.project.id;

            if (!projectMap.has(projectId)) {
                // Initialize project data
                projectMap.set(projectId, {
                    id: projectId,
                    title: order.project.project_title,
                    cer_number: order.project.cer_number,
                    po_count: 1,
                    last_po_date: order.po_date.split(' ')[0] // Extract just the date part
                });
            } else {
                // Update existing project data
                const existingProject = projectMap.get(projectId);
                existingProject.po_count++;

                // Update last_po_date if current PO date is more recent
                const currentPoDate = order.po_date.split(' ')[0];
                if (new Date(order.po_date) > new Date(existingProject.last_po_date + ' 00:00:00')) {
                    existingProject.last_po_date = currentPoDate;
                }
            }
        }
    });

    return Array.from(projectMap.values());
}


export const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
};

// Helper function to format number with commas
export const formatNumberWithCommas = (value) => {
    if (!value) return '';
    // Remove any existing commas and non-numeric characters except decimal point
    const numericValue = value.toString().replace(/[^\d.]/g, '');
    // Split by decimal point
    const parts = numericValue.split('.');
    // Add commas to the integer part
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    // Join back with decimal if it exists
    return parts.length > 1 ? parts[0] + '.' + parts[1] : parts[0];
};

// Helper function to parse formatted number back to numeric value
export const parseFormattedNumber = (value) => {
    if (!value) return '';
    return value.toString().replace(/,/g, '');
};

export const numberToWords = (num) => {
    if (num == null || num === "") return ""; // handle null/empty input

    // Convert to number safely (remove commas or currency symbols)
    const cleaned = Number(String(num).replace(/[^0-9.]/g, ""));
    if (isNaN(cleaned)) return ""; // return empty if invalid

    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

    const convertLessThanThousand = (n) => {
        if (n === 0) return '';
        if (n < 10) return ones[n];
        if (n < 20) return teens[n - 10];
        if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
        return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
    };

    const convertNumber = (n) => {
        if (n === 0) return 'Zero';
        const billion = Math.floor(n / 1_000_000_000);
        const million = Math.floor((n % 1_000_000_000) / 1_000_000);
        const thousand = Math.floor((n % 1_000_000) / 1_000);
        const remainder = n % 1_000;

        let result = '';
        if (billion > 0) result += convertLessThanThousand(billion) + ' Billion ';
        if (million > 0) result += convertLessThanThousand(million) + ' Million ';
        if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
        if (remainder > 0) result += convertLessThanThousand(remainder);
        return result.trim();
    };

    const [intPart, decPart = '00'] = cleaned.toFixed(2).split('.');
    const pesos = convertNumber(parseInt(intPart));
    const centavos = decPart.padEnd(2, '0');

    return centavos === '00'
        ? `${pesos} Pesos Only`
        : `${pesos} and ${centavos}/100 Pesos Only`;
};

export const getStatusBadge = (status) => {
    const config = {
        pending: { icon: Clock, className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
        pending_approval: { icon: Clock, className: 'bg-blue-100 text-blue-800 border-blue-300' },
        approved: { icon: CheckCircle, className: 'bg-green-100 text-green-800 border-green-300' },
        processed: { icon: CheckCircle, className: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
        rejected: { icon: XCircle, className: 'bg-red-100 text-red-800 border-red-300' },
    };

    const statusConfig = config[status] || config.pending;
    const StatusIcon = statusConfig.icon;

    return (
        <Badge variant="outline" className={statusConfig.className}>
            <StatusIcon className="mr-1 h-3 w-3" />
            {status?.toUpperCase().replace('_', ' ')}
        </Badge>
    );
};



