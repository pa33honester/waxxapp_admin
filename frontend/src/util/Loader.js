import React from "react";
import { useSelector } from "react-redux";

const Loader = () => {
  const { isLoading } = useSelector((state) => state.dialogue);

  return (
    <>
      {isLoading && (
        <div className="mainLoaderBox">
          <div className="loader"></div>
        </div>
      )}
    </>
  );
};

export default Loader;
