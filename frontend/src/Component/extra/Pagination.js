import React, { useState, useEffect } from "react";
//material-ui
import IconButton from '@mui/material/IconButton';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LastPageIcon from '@mui/icons-material/LastPage';

// Define the CSS for pagination
const styles = {
  root: {
    flexShrink: 0,
    marginLeft: "20px",
  },
  pageNumber: {
    display: "flex",
    alignItems: "center",
    marginLeft: "20px",
  },
  pageNumberButton: {
    padding: "10px 15px",
    border: "none",
    margin: "0 5px",
    borderRadius: "10px",
    cursor: "pointer",
    color: "#000",
    backgroundColor: "#fff",
  },
  activePageNumberButton: {
    backgroundColor: "#3f51b5", // primary.main color from material-ui theme
    color: "#fff",
    "&:hover": {
      backgroundColor: "#303f9f", // primary.dark color from material-ui theme
    },
  },
};

const Pagination = (props) => {
  const [pages, setPages] = useState([]);
  const {
    type,
    // server props
    serverPage,
    serverPerPage,
    count,
    onPageChange,
    onRowsPerPageChange,
    // client props
    clientPage,
    totalPages,
    setCurrentPage,
    totalData,
  } = props;

  // Client pagination
  const onPageChangeClient = (serverPage) => {
    console.log(serverPage, "onPageChangeClient")
    setCurrentPage(serverPage);
  };

  useEffect(() => {
    const range = Math.min(3, totalPages); // Show up to 3 pages
    const start = Math.max(1, clientPage - Math.floor(range / 2));
    const end = Math.min(start + range - 1, totalPages);

    const pageNumbers = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
    setPages(pageNumbers);
  }, [clientPage, totalPages]);

  // Server pagination

  // count of pagination
  const totalCount = Math.min((serverPage + 1) * serverPerPage, totalData);
  const totalCounts = serverPerPage * serverPage;
  const rangeStart = totalCounts - serverPerPage + 1;
  const rangeEnd = Math.min(totalCounts, totalData);

  //firstPage button
  const handleFirstPageButtonClick = (event) => {
    onPageChange(event, 0);
  };
  // back button
  const handleBackButtonClick = (event) => {
    onPageChange(event, serverPage - 1);
  };

  //next page button
  const handleNextButtonClick = (event) => {
    onPageChange(event, serverPage + 1);
  };

  //last page button
  const handleLastPageButtonClick = (event) => {
    onPageChange(event, Math.max(0, Math.ceil(count / serverPerPage) - 1));
  };

  const renderPageNumbers = () => {
    const totalPages = Math.ceil(totalData / serverPerPage);
    const pageNumbers = [];
    for (let i = 0; i < totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          style={{
            ...styles.pageNumberButton,
            ...(i === serverPage ? styles.activePageNumberButton : {}),
          }}
          onClick={(event) => onPageChange(event, i)}
        >
          {i + 1}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="pagination">
      {type === "server" && totalData > 0 && (
        <>
          <span className="text-white fw-semibold fs-6">Row Per Page :-</span>
          <select
            className="mx-2 pageOption"
            onChange={(e) => onRowsPerPageChange(e.target.value)}
          >
            <option className="fs-6 fw-semibold" value="5" >
              5
            </option>
            <option className="fs-6 fw-semibold" value="10" selected>
              10
            </option>
            <option className="fs-6 fw-semibold" value="25">
              25
            </option>
            <option className="fs-6 fw-semibold" value="50">
              50
            </option>
            <option className="fs-6 fw-semibold" value="100">
              100
            </option>
            <option className="fs-6 fw-semibold" value={totalData}>
              All
            </option>
          </select>
          <p className="count text-white fw-semibold fs-6">
            {rangeStart}-{rangeEnd} of {totalData}
          </p>
          <button
            className={serverPage === 1 ? "page-btn" : "active"}
            disabled={serverPage === 1}
            onClick={() => onPageChangeClient(1)}
          >
            <FirstPageIcon />
          </button>
          <button
            className={serverPage === 1 ? "page-btn" : "active"}
            disabled={serverPage === 1}
            onClick={() => onPageChangeClient(serverPage - 1)}
          >
            <i className="fa-solid fa-angle-left"></i>
          </button>
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => onPageChangeClient(page - 1)}
              className={page + 1 === serverPage ? "active" : "active-btn"}
            >
              {page}
            </button>
          ))}
          <button
            className={
              serverPage === Math.ceil(totalData / serverPerPage)
                ? "page-btn"
                : "active"
            }
            disabled={serverPage === Math.ceil(totalData / serverPerPage)}
            onClick={() => onPageChangeClient(serverPage + 1)}
          >
            <i className="fa-solid fa-angle-right"></i>
          </button>
          <button
            className={
              serverPage === Math.ceil(totalData / serverPerPage)
                ? "page-btn"
                : "active"
            }
            disabled={serverPage === Math.ceil(totalData / serverPerPage)}
            onClick={() =>
              onPageChangeClient(Math.ceil(totalData / serverPerPage))
            }
          >
            <LastPageIcon />
          </button>
        </>
      )}

      {/* client side pagination  */}
      {type === "client" && (
        <>
          <span className="mt-2 text-white">Row Per Page :-</span>
          <select
            className="mx-2 pageOption"
            onChange={(e) => onRowsPerPageChange(e.target.value)}
          >
            <option value="5">5</option>
            <option value="10" selected>
              10
            </option>
            <option value="15">15</option>
            <option value="20">20</option>
            <option value={totalData}>All</option>
          </select>
          <p className="count text-white">
            {parseInt(serverPage * serverPerPage + 1) +
              "-" +
              totalCount +
              "of" +
              totalData}
          </p>
          <div style={styles.root}>
            <IconButton
              onClick={handleFirstPageButtonClick}
              disabled={serverPage === 0}
              aria-label="first page"
            >
              <FirstPageIcon />
            </IconButton>
            <IconButton
              onClick={handleBackButtonClick}
              disabled={serverPage === 0}
              aria-label="previous page"
            >
              <KeyboardArrowLeft />
            </IconButton>
            <IconButton
              onClick={handleNextButtonClick}
              disabled={serverPage >= Math.ceil(count / serverPerPage) - 1}
              aria-label="next page"
            >
              <KeyboardArrowRight />
            </IconButton>
            <IconButton
              onClick={handleLastPageButtonClick}
              disabled={serverPage >= Math.ceil(count / serverPerPage) - 1}
              aria-label="last page"
            >
              <LastPageIcon />
            </IconButton>
          </div>
        </>
      )}
    </div>
  );
};

export default Pagination;
