import { File, Image, FileText, FileSpreadsheet } from 'lucide-react';

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

        const billion = Math.floor(n / 1000000000);
        const million = Math.floor((n % 1000000000) / 1000000);
        const thousand = Math.floor((n % 1000000) / 1000);
        const remainder = n % 1000;

        let result = '';
        if (billion > 0) result += convertLessThanThousand(billion) + ' Billion ';
        if (million > 0) result += convertLessThanThousand(million) + ' Million ';
        if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand ';
        if (remainder > 0) result += convertLessThanThousand(remainder);

        return result.trim();
    };

    const [intPart, decPart = '00'] = num.toFixed(2).split('.');
    const pesos = convertNumber(parseInt(intPart));
    const centavos = decPart.padEnd(2, '0');

    if (centavos === '00') {
        return `${pesos} Pesos Only`;
    }
    return `${pesos} and ${centavos}/100 Pesos Only`;
};



