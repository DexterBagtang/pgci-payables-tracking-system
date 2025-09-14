import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem, PaginationLink, PaginationNext,
    PaginationPrevious
} from '@/components/ui/pagination.js';

export default function PaginationServerSide({items,onChange}) {
    const { current_page, last_page, from, to, total } = items;

    if (last_page <= 1) return null;

    const pages = [];
    const showPages = 5;
    const startPage = Math.max(1, current_page - Math.floor(showPages / 2));
    const endPage = Math.min(last_page, startPage + showPages - 1);

    // Add first page and ellipsis if needed
    if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('ellipsis-start');
    }

    // Add visible pages
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (endPage < last_page) {
        if (endPage < last_page - 1) pages.push('ellipsis-end');
        pages.push(last_page);
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-sm text-muted-foreground">
                Showing {from || 0} to {to || 0} of {total} items
            </div>
            <div>
                <Pagination>
                    <PaginationContent>
                        {current_page > 1 && (
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => onChange({ page: current_page - 1 })}
                                    className="cursor-pointer"
                                />
                            </PaginationItem>
                        )}

                        {pages.map((page, index) => {
                            if (typeof page === 'string') {
                                return (
                                    <PaginationItem key={`ellipsis-${index}`}>
                                        <PaginationEllipsis />
                                    </PaginationItem>
                                );
                            }

                            return (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        onClick={() => onChange({ page })}
                                        isActive={current_page === page}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        })}

                        {current_page < last_page && (
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => onChange({ page: current_page + 1 })}
                                    className="cursor-pointer"
                                />
                            </PaginationItem>
                        )}
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
};

