import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.js';
import { Button } from '@/components/ui/button.js';
import { Building, Eye } from 'lucide-react';
import { formatDate } from 'date-fns';

export default function VendorProjects({projects}){
    return (
        <Card>
            <CardHeader>
                <CardTitle>Associated Projects</CardTitle>
                <CardDescription>Projects where this vendor has been involved</CardDescription>
            </CardHeader>
            <CardContent>
                {projects.length === 0 ?
                    (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <Building className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Projects </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">This vendor doesn't have any projects yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {projects.map((project) => (
                                <div key={project.id} className="flex items-center justify-between border dark:border-gray-700 rounded-lg p-4">
                                    <div>
                                        <p className="font-medium">{project.title}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{project.cer_number}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Last PO: {formatDate(project.last_po_date,'PP')}</p>
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
                    )
                }


            </CardContent>
        </Card>
    )
}
