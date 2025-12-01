import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Button } from "@/components/ui/button.js";
import { Input } from "@/components/ui/input.js";
import { Label } from "@/components/ui/label.js";
import { Textarea } from "@/components/ui/textarea.js";
import { Badge } from "@/components/ui/badge.js";
import { Trash2, Plus, Package } from 'lucide-react';
import { Separator } from '@/components/ui/separator.js';

const LineItemsManager = ({ lineItems, setLineItems, poAmount, setPoAmount, currency = 'PHP' }) => {
    const [showLineItems, setShowLineItems] = useState(false);

    const addLineItem = () => {
        const newItem = {
            id: Date.now(), // temporary ID
            item_description: '',
            quantity: '',
            unit_price: '',
            total_amount: '',
            unit_of_measure: ''
        };
        setLineItems([...lineItems, newItem]);
    };

    const removeLineItem = (id) => {
        const updatedItems = lineItems.filter(item => item.id !== id);
        setLineItems(updatedItems);
        updateTotalAmount(updatedItems);
    };

    const updateLineItem = (id, field, value) => {
        const updatedItems = lineItems.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };

                // Calculate total_amount when quantity or unit_price changes
                if (field === 'quantity' || field === 'unit_price') {
                    const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(updatedItem.quantity) || 0;
                    const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : parseFloat(updatedItem.unit_price) || 0;
                    updatedItem.total_amount = (quantity * unitPrice).toFixed(2);
                }

                return updatedItem;
            }
            return item;
        });

        setLineItems(updatedItems);
        updateTotalAmount(updatedItems);
    };

    const updateTotalAmount = (items) => {
        const total = items.reduce((sum, item) => {
            return sum + (parseFloat(item.total_amount) || 0);
        }, 0);
        setPoAmount(total.toFixed(2));
    };

    const formatCurrency = (amount) => {
        if (!amount) {
            return currency === 'USD' ? '$0.00' : '₱0.00';
        }
        const locale = currency === 'USD' ? 'en-US' : 'en-PH';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
        }).format(amount);
    };

    if (!showLineItems) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5" />
                            Line Items
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowLineItems(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Line Items
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Add detailed line items to automatically calculate the total PO amount.
                        </p>
                        <div className="text-xs text-muted-foreground">
                            Optional
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Line Items ({lineItems.length})
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addLineItem}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setShowLineItems(false);
                                setLineItems([]);
                                setPoAmount('');
                            }}
                        >
                            Hide Items
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {lineItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No line items added yet</p>
                        <p className="text-sm">Click "Add Item" to get started</p>
                    </div>
                ) : (
                    <>
                        {lineItems.map((item, index) => (
                            <div key={item.id} className="border rounded-lg p-4 space-y-4 bg-muted/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">Item {index + 1}</Badge>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeLineItem(item.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 space-y-2">
                                        <Label>Item Description *</Label>
                                        <Textarea
                                            value={item.item_description}
                                            onChange={(e) => updateLineItem(item.id, 'item_description', e.target.value)}
                                            placeholder="Describe the item..."
                                            rows={2}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Quantity *</Label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.quantity}
                                            onChange={(e) => updateLineItem(item.id, 'quantity', e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Unit of Measure</Label>
                                        <Input
                                            value={item.unit_of_measure}
                                            onChange={(e) => updateLineItem(item.id, 'unit_of_measure', e.target.value)}
                                            placeholder="e.g., pcs, kg, box"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Unit Price *</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                {currency === 'USD' ? '$' : '₱'}
                                            </span>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.unit_price}
                                                onChange={(e) => updateLineItem(item.id, 'unit_price', e.target.value)}
                                                className="pl-8"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Total Amount</Label>
                                        <div className="relative">
                                            <Input
                                                value={formatCurrency(item.total_amount)}
                                                readOnly
                                                className="bg-muted font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Separator />

                        <div className="flex justify-between items-center py-4 bg-primary/5 px-4 rounded-lg">
                            <span className="font-semibold text-lg">Total PO Amount:</span>
                            <span className="font-bold text-xl text-primary">
                                {formatCurrency(poAmount)}
                            </span>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default LineItemsManager;
