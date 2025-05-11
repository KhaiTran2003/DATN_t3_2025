import React from 'react';
import '../css/component/PhanTrang.css';

const PhanTrang = ({ currentPage, totalPages, onPageChange }) => {
  const getPageItems = () => {
    const pages = [];

    // Nếu tổng trang nhỏ, hiển thị hết
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Always show first page
      pages.push(1);

      // Show left ellipsis if needed
      if (currentPage > 4) {
        pages.push('...');
      }

      // Determine start and end around current page
      const start = Math.max(2, currentPage - 2);
      const end = Math.min(totalPages - 1, currentPage + 2);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Show right ellipsis if needed
      if (currentPage < totalPages - 3) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageItems();

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button"
      >
        «
      </button>

      {pages.map((page, idx) => (
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span> // Sử dụng key độc nhất cho dấu ba chấm
        ) : (
          <button
            key={`page-${page}`} // Sử dụng key độc nhất cho các trang
            className={`pagination-button ${page === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button"
      >
        »
      </button>
    </div>
  );
};

export default PhanTrang;
