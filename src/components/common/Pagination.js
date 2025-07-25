import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const handlePageChange = (pageNum) => {
        if (pageNum >= 1 && pageNum <= totalPages && pageNum !== currentPage) {
            onPageChange(pageNum);
        }
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

                {/* First page */}
                {currentPage > 3 && (
                    <>
                        <li className="page-item">
                            <button className="page-link" onClick={() => handlePageChange(1)}>
                                1
                            </button>
                        </li>
                        {currentPage > 4 && (
                            <li className="page-item disabled">
                                <span className="page-link">...</span>
                            </li>
                        )}
                    </>
                )}

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(pageNum => pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    .map(pageNum => {
                        if (pageNum > 0 && pageNum <= totalPages) {
                            return (
                                <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => handlePageChange(pageNum)}>
                                        {pageNum}
                                    </button>
                                </li>
                            );
                        }
                        return null;
                    })}

                {/* Ellipsis if needed */}
                {currentPage < totalPages - 2 && (
                    <>
                        {currentPage < totalPages - 3 && (
                            <li className="page-item disabled">
                                <span className="page-link">...</span>
                            </li>
                        )}
                        <li className="page-item">
                            <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                                {totalPages}
                            </button>
                        </li>
                    </>
                )}

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
