import { File, Image, FileText, FileSpreadsheet, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge.js';
import React from 'react';
import { toWords } from 'number-to-words';

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
    const [intPart, decPart = '00'] = num.toFixed(2).split('.');
    const pesosAmount = parseInt(intPart);

    // Convert to words and capitalize first letter
    const pesos = toWords(pesosAmount);
    const pesosCapitalized = pesos.charAt(0).toUpperCase() + pesos.slice(1);

    const centavos = decPart.padEnd(2, '0');

    if (centavos === '00') {
        return `${pesosCapitalized} Pesos Only`;
    }

    return `${pesosCapitalized} and ${centavos}/100 Pesos Only`;
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



