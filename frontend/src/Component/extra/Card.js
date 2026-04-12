import React from "react";

const Card = ({ data, clientPerPage, clientPage }) => {
  return (
    <div className="cardMain">
      <div
        key={index}
        className="card position-relative"
        style={{ overflow: "hidden" }}
      >
        <div className="card-body">
          <div className="productImage boxCenter">
            <img
              src={item.images[1]}
              style={{
                width: "100%",
                height: "300px",
                objectFit: "cover",
              }}
              alt=""
            />
          </div>
          <div className="productDetail mt-2">
            <h5>{item.productName}</h5>
            <div className="d-flex mt-0">
              <div className="quantity">
                <b>Quantity : </b>
                <span>{item.quantity}</span>
              </div>
              <div className="sold ms-4">
                <b>Sold : </b>
                <span>{item.sold}</span>
              </div>
            </div>
            <p
              className="fw-bolder mt-2 mb-0 fs-4"
              style={{ color: "#b93160" }}
            >
              ${item.price}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;
