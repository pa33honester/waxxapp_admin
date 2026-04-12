import React, { useState } from "react";

import noImage1 from "../assets/images/default.jpg";
// import LoadingGif from "../assets/images/loading_gray.gif";

const LazyImage = ({ imageSrc, noImage = noImage1 , width , height , style }) => {
  const [loading, setLoading] = useState(true);

  return (
<div style={{ position: "relative", width , height  }}>
      {/* Loader */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f0f0f0",
            borderRadius: 5,
          }}
          // className="placeholder"
        >
          {/* <span>Loading...</span> */}
        </div>
      )}

      {/* Image */}
      <img
        className="img-fluid"
        style={{
          height,
          width,
          boxShadow: "0 5px 15px 0 rgb(105 103 103 / 0%)",
          border: "0.5px solid rgba(255, 255, 255, 0.20)",
          borderRadius: 5,
          objectFit: "cover",
          ...style
        }}
        src={imageSrc || noImage}
        onLoad={() => setLoading(false)}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = noImage;
          setLoading(false);
        }}
        alt=""
      />
    </div>
  );
};

export default LazyImage;
