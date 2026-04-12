import React, { useState } from "react";

function Table3(props) {
  const { data, mapData, Page, PerPage, type } = props;

  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleColumnClick = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedData =
    data?.length > 0
      ? [...data]?.sort((a, b) => {
          const valueA = a?.[sortColumn];
          const valueB = b?.[sortColumn];
          if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
          if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
          return 0;
        })
      : [];

  const renderRows = () => {
    const source =
      PerPage > 0
        ? sortedData.slice(Page * PerPage, Page * PerPage + PerPage)
        : sortedData;

    return source.length > 0 ? (
      source.map((i, k) => (
        <tr
          key={k}
          className={k % 2 === 0 ? "bg-white" : "bg-gray-50 hover:bg-gray-100"}
          
        >
          {mapData?.map((res, index) => {
            const splits = res.body?.split(".");
            const value =
              splits?.length > 1
                ? i[splits[0]]?.[splits[1]] ?? "-"
                : i[res.body] ?? "-";
            return (
              <td key={index} className="px-4 py-3 whitespace-nowrap text-center">
                {res?.Cell ? (
                  <res.Cell row={i} index={k} />
                ) : (
                  <span className={res?.className || "text-gray-700"}>
                    {value}
                  </span>
                )}
              </td>
            );
          })}
        </tr>
      ))
    ) : (
      <tr>
        <td
          colSpan={mapData.length}
          className="text-center px-6 py-4 text-gray-400"
        >
          No Data Found!
        </td>
      </tr>
    );
  };

  return (
    <div className="overflow-auto  shadow-md ">
      <table className=" text-sm text-left text-gray-800">
        <thead className="bg-gradient-to-r from-blue-50 to-blue-100 sticky top-0 z-10 shadow-sm">
          <tr>
            {mapData.map((res, idx) => (
              <th
                key={idx}
                className="px-4 py-3 font-semibold text-gray-600 uppercase tracking-wide"
              >
                <div className="flex items-center text-center">
                  {res.Header}
                  {res.sorting && (
                    <i
                      className={`fa fa-sort${
                        sortColumn === res.body
                          ? sortOrder === "asc"
                            ? "-asc"
                            : "-desc"
                          : ""
                      } ms-2 text-gray-500 hover:text-gray-700 cursor-pointer`}
                      onClick={() => handleColumnClick(res.body)}
                    ></i>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody >{type === "server" || type === "client" ? renderRows() : null}</tbody>
      </table>
    </div>
  );
}

export default Table3;
