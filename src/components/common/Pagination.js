import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const handlePageChange = (pageNum) => {
        if (pageNum >= 1 && pageNum <= totalPages && pageNum !== currentPage) {
            onPageChange(pageNum);
        }
    };

    const renderPageNumbers = () => {
        const pages = [];
        
        if (totalPages <= 7) {
            // If total pages is 7 or less, show all pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // For more than 7 pages, show smart pagination
            if (currentPage <= 4) {
                // Show first 5 pages + ellipsis + last page
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                // Show first page + ellipsis + last 5 pages
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    return (
        <nav aria-label="Page navigation">
            <ul className="pagination mb-0 justify-content-end">
                {/* Previous button */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                        Previous
                    </button>
                </li>

                {/* Page numbers */}
                {renderPageNumbers().map((page, index) => {
                    if (page === '...') {
                        return (
                            <li key={`ellipsis-${index}`} className="page-item disabled">
                                <span className="page-link">...</span>
                            </li>
                        );
                    }
                    
                    return (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => handlePageChange(page)}>
                                {page}
                            </button>
                        </li>
                    );
                })}

                {/* Next button */}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                        Next
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Pagination;
