import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.js';
import { Button } from '@/components/ui/button.js';
import { Eye } from 'lucide-react';
import { formatDate } from 'date-fns';

export default function VendorProjects({projects}){
    return (
        <Card>
            <CardHeader>
                <CardTitle>Associated Projects</CardTitle>
                <CardDescription>Projects where this vendor has been involved</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {projects.map((project) => (
                        <div key={project.id} className="flex items-center justify-between border rounded-lg p-4">
                            <div>
                                <p className="font-medium">{project.title}</p>
                                <p className="text-sm text-gray-600">{project.cer_number}</p>
                                <p className="text-xs text-gray-500">Last PO: {formatDate(project.last_po_date,'PP')}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">{project.po_count} POs</p>
                                <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
