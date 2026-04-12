import React, { useState } from "react";

function Table2(props) {
  const { data, mapData, PerPage = 10, type } = props;

  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [visibleCount, setVisibleCount] = useState(PerPage);

  const handleColumnClick = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + PerPage);
  };

  const handleShowLess = () => {
    setVisibleCount(PerPage);
  };

  const sortedData =
    data?.length > 0 &&
    [...data].sort((a, b) => {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      if (valueA < valueB) {
        return sortOrder === "asc" ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });

  return (
    <>
      <div className="nprimeMain" style={{ borderRadius: "9px" }}> 
        <table
          width="100%"
          
          className="newpt text-center"
          style={{ maxHeight: "600px" }}
        >
          <thead className="sticky-top" style={{ top: "-1px", zIndex: "1" }}>
            <tr>
              {mapData.map((res, i) => (
                <th key={i} className="fw-normal py-3">
                  {`${" "}${res.Header}`}
                  {res?.sorting && (
                    <i
                      className="fa-solid fa-sort deg90 ms-1"
                      onClick={() => handleColumnClick(res.body)}
                      style={{ cursor: "pointer" }}
                    ></i>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody >
            {sortedData.length > 0 ? (
              sortedData.slice(0, visibleCount).map((i, k) => (
                <tr key={k}>
                  {mapData.map((res, idx) => {
                    const splits = res.body?.split(".");
                    return (
                      <td key={idx}>
                        {res.Cell ? (
                          <res.Cell row={i} index={k} />
                        ) : (
                          <span className={res.className}>
                            {splits?.length > 1
                              ? i[splits[0]][splits[1]] ??
                                (i[splits[0]][splits[1]] >= 0
                                  ? i[splits[0]][splits[1]]
                                  : "-")
                              : i[res.body] ?? (i[res.body] >= 0 ? i[res.body] : "-")}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="25" className="text-center text-white">
                  No Data Found !
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Buttons */}
        <div className="text-center my-3 d-flex justify-content-center gap-3">
          {sortedData.length > visibleCount && (
            <button className="myCustomButton " style={{ borderRadius: "5px", width: "100px",height:"30px" }} onClick={handleLoadMore}>
              Load More
            </button>
          )}

          {visibleCount > PerPage && (
            <button className="myCustomButton" style={{ borderRadius: "5px", width: "100px",height:"30px" }} onClick={handleShowLess}>
              Show Less
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Table2;
