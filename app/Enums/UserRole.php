<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case PURCHASING = 'purchasing';
    case PAYABLES = 'payables';
    case DISBURSEMENT = 'disbursement';

    /**
     * Get the label for the role.
     */
    public function label(): string
    {
        return match($this) {
            self::ADMIN => 'Admin',
            self::PURCHASING => 'Purchasing',
            self::PAYABLES => 'Payables',
            self::DISBURSEMENT => 'Disbursement',
        };
    }

    /**
     * Get all role options for dropdowns.
     *
     * @return array<string, string>
     */
    public static function options(): array
    {
        return [
            self::ADMIN->value => self::ADMIN->label(),
            self::PURCHASING->value => self::PURCHASING->label(),
            self::PAYABLES->value => self::PAYABLES->label(),
            self::DISBURSEMENT->value => self::DISBURSEMENT->label(),
        ];
    }
}
