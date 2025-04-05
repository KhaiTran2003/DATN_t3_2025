// 📁 frontend/components/Table.jsx
import React from 'react';

const Table = ({ data, columns }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500">Không có dữ liệu</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-xs uppercase">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-3 py-2 whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t hover:bg-gray-50">
              {columns.map((col, cIdx) => (
                <td key={cIdx} className="px-3 py-1 whitespace-nowrap align-middle">
                  {typeof col.render === 'function' ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
