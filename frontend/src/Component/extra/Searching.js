// import { useState } from "react";
// import Button from "./Button";

// const Searching = (props) => {
//   const [search, setSearch] = useState("");

//   const {
//     data,
//     setData,
//     type,
//     serverSearching,
//   } = props;


//   const handleSearch = () => {
//     const searchValueLower = search.toLowerCase();

//     if (type === "client") {
//       if (searchValueLower) {
//         const filteredData = data.filter((item) => {
//           return Object.keys(item).some((key) => {
//             if (["_id", "updatedAt", "createdAt"].includes(key)) return false;

//             const itemValue = item[key];

//             if (typeof itemValue === "string") {
//               return itemValue.toLowerCase().includes(searchValueLower);
//             } else if (typeof itemValue === "number") {
//               return itemValue.toString().includes(searchValueLower);
//             }
//             return false;
//           });
//         });
//         setData(filteredData);
//       } else {
//         setData(data); 
//       }
//     } else {
//       serverSearching(searchValueLower);
//     }
//   };


//   const handleInputChange = (e) => {
//   const inputValue = e.target.value;
//   setSearch(inputValue);

//   const searchValueLower = inputValue.toLowerCase();

//   if (type === "client") {
//     if (searchValueLower) {
//       const filteredData = data.filter((item) =>
//         Object.keys(item).some((key) => {
//           if (["_id", "updatedAt", "createdAt"].includes(key)) return false;

//           const itemValue = item[key];

//           if (typeof itemValue === "string") {
//             return itemValue.toLowerCase().includes(searchValueLower);
//           } else if (typeof itemValue === "number") {
//             return itemValue.toString().includes(searchValueLower);
//           }
//           return false;
//         })
//       );
//       setData(filteredData);
//     } else {
//       setData(data); 
//     }
//   } else {
//     serverSearching(searchValueLower);
//   }
// };



//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       handleSearch();
//     }
//   };

//   return (
//     <div className="col-3 " style={{ float: "right" }}>
//       <div className="input-group">
//         <input
//           type="text"
//           autoComplete="off"
//           placeholder="Searching for..."
//           aria-describedby="button-addon4"
//           className="form-control bg-none border searchBar py-2"
//           style={{ borderRadius: "8px" }}
//           value={search}               
//           onChange={handleInputChange} 
//           onKeyPress={handleKeyPress} 
//         />


//       </div>
//     </div>
//   );
// };

// export default Searching;


import { useState } from "react";

// TU props me data, setData, type, serverSearching waale props bhej raha hai
const Searching = (props) => {
  const [search, setSearch] = useState("");

  const {
    data,
    setData,
    type,
    serverSearching,
  } = props;

  // UPDATED FILTER LOGIC for Nested Search
  const filterOrders = (dataArray, searchValueLower) => {
    return dataArray.filter(orderItem => {
      // Root fields (orderId, etc.)
      const rootMatch = Object.keys(orderItem).some(key => {
        if (["_id", "updatedAt", "createdAt"].includes(key)) return false;
        if (typeof orderItem[key] === "string")
          return orderItem[key].toLowerCase().includes(searchValueLower);
        if (typeof orderItem[key] === "number")
          return orderItem[key].toString().includes(searchValueLower);
        return false;
      });

      // User Info (firstName, lastName, uniqueId)
      const userMatch =
        orderItem.userId &&
        (
          (orderItem.userId.firstName && orderItem.userId.firstName.toLowerCase().includes(searchValueLower)) ||
          (orderItem.userId.lastName && orderItem.userId.lastName.toLowerCase().includes(searchValueLower)) ||
          (orderItem.userId.uniqueId && orderItem.userId.uniqueId.toString().includes(searchValueLower))
        );

      // Items array (multiple items per order)
      const itemsMatch =
        orderItem.items &&
        orderItem.items.some((item) =>
          (item.productId?.productName && item.productId.productName.toLowerCase().includes(searchValueLower)) ||
          (item.productId?.productCode && item.productId.productCode.toString().includes(searchValueLower)) ||
          (item.productQuantity && item.productQuantity.toString().includes(searchValueLower)) ||
          (item.purchasedTimeProductPrice && item.purchasedTimeProductPrice.toString().includes(searchValueLower))
        );

      // Add EVEN MORE nested checks below if you want: shipping address, seller, etc.

      return rootMatch || userMatch || itemsMatch;
    });
  };

  // JO SEARCH BAR ME TYPING HOTA HAI YEH TRIGGER HOGA
  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    setSearch(inputValue);

    const searchValueLower = inputValue.toLowerCase();

    if (type === "client") {
      if (searchValueLower) {
        // YAHAN NAYA FILTER LOGIC CALL KAR RAHE
        const filteredData = filterOrders(data, searchValueLower);
        setData(filteredData);
      } else {
        setData(data);
      }
    } else {
      serverSearching(searchValueLower);
    }
  };

  // ENTER PRESS KARNE PAR BHI SEARCH
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "client") {
        const searchValueLower = search.toLowerCase();
        const filteredData = filterOrders(data, searchValueLower);
        setData(filteredData);
      } else {
        serverSearching(search.toLowerCase());
      }
    }
  };

  return (
    <div className="col-3 " style={{ float: "right" }}>
      <div className="input-group">
        <input
          type="text"
          autoComplete="off"
          placeholder="Searching for..."
          aria-describedby="button-addon4"
          className="form-control bg-none border searchBar py-2"
          style={{ borderRadius: "8px" }}
          value={search}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
        />
      </div>
    </div>
  );
};

export default Searching;
