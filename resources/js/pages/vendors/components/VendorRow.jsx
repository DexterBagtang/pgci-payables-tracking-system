import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { router } from '@inertiajs/react';
import {
    Mail,
    MapPin,
    Phone,
    Calendar,
    Edit
} from 'lucide-react';

export default function VendorRow({ vendor, isSelected, onSelect, onEdit }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCategoryColor = (category) => {
        const colors = {
            'sap': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
            'manual': 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700',
        };
        return colors[category?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    };

    const getStatusColor = (isActive) => {
        return isActive 
            ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-700' 
            : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700';
    };

    return (
        <tr className={`group transition-all hover:bg-muted/30 border-b border-gray-100 dark:border-gray-800 ${isSelected ? 'bg-blue-50' : ''}`}>
            {/* Checkbox Column */}
            <td className="px-3 py-4">
                <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onSelect(vendor.id)}
                    aria-label={`Select ${vendor.name}`}
                />
            </td>

            {/* Name Column */}
            <td className="py-4 pl-4 pr-3">
                <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center mr-3">
                        <span className="font-medium text-blue-700 dark:text-blue-300">
                            {vendor.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <div
                            className="font-semibold text-gray-900 dark:text-gray-100 hover:underline hover:cursor-pointer"
                            onClick={() => router.get(`/vendors/${vendor.id}`)}
                        >
                            {vendor.name}
                        </div>
                    </div>
                </div>
            </td>

            {/* Contact Person */}
            <td className="px-3 py-4">{vendor.contact_person || '---'}</td>

            {/* Contact Info */}
            <td className="px-3 py-4 text-xs">
                {vendor.email ? (
                    <a
                        href={`mailto:${vendor.email}`}
                        className="text-blue-600 transition-colors hover:text-blue-800 hover:underline flex items-center"
                    >
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                        {vendor.email}
                    </a>
                ) : (
                    <span className="text-muted-foreground flex items-center">
                        <Mail className="h-3.5 w-3.5 mr-1.5 opacity-50" />
                        ---
                    </span>
                )}
                {vendor.phone ? (
                    <a className="text-blue-600 transition-colors hover:text-blue-800 hover:underline flex items-center">
                        <Phone className="h-3.5 w-3.5 mr-1.5" />
                        {vendor.phone}
                    </a>
                ) : (
                    <span className="text-muted-foreground flex items-center">
                        <Phone className="h-3.5 w-3.5 mr-1.5 opacity-50" />
                        ---
                    </span>
                )}
            </td>

            {/* Address */}
            <td className="px-3 py-4 max-w-[200px]">
                {vendor.address ? (
                    <div className="flex items-start">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 mt-0.5 flex-shrink-0" />
                        <span className="truncate" title={vendor.address}>
                            {vendor.address}
                        </span>
                    </div>
                ) : (
                    <span className="text-muted-foreground">---</span>
                )}
            </td>

            {/* Category */}
            <td className="px-3 py-4">
                <Badge
                    variant="secondary"
                    className={`rounded-md border ${getCategoryColor(vendor.category)} px-2.5 py-1 text-xs font-medium`}
                >
                    {vendor.category || 'Uncategorized'}
                </Badge>
            </td>

            {/* Status */}
            <td className="px-3 py-4">
                <div className="flex items-center">
                    <Badge
                        variant="secondary"
                        className={`rounded-full border ${getStatusColor(vendor.is_active)} py-1 px-2.5 text-xs font-medium flex items-center`}
                    >
                        <div className={`h-2 w-2 rounded-full mr-1.5 ${vendor.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        {vendor.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                </div>
            </td>

            {/* Created Date */}
            <td className="px-3 py-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 opacity-70" />
                    {formatDate(vendor.created_at)}
                </div>
            </td>

            {/* Actions */}
            <td className="px-3 py-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(vendor)}
                    className="rounded-full h-8 w-8 p-0"
                    aria-label={`Edit ${vendor.name}`}
                >
                    <Edit className="h-4 w-4" />
                </Button>
            </td>
        </tr>
    );
}
