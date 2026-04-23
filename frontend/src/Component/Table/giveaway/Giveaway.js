import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { cancelGiveaway, getGiveaways } from "../../store/giveaway/giveaway.action";
import { warning } from "../../../util/Alert";

const STATUS_LABEL = {
  1: { text: "Open", color: "#138F00", bg: "#CEFAC6" },
  2: { text: "Closed (no entries)", color: "#737272", bg: "#E5E5E5" },
  3: { text: "Drawn", color: "#228070", bg: "#c7ffe9" },
  4: { text: "Cancelled", color: "#a13b2f", bg: "#ffd4cf" },
};

const TYPE_LABEL = { 1: "Standard", 2: "Follower-only" };

const formatDate = (iso) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const Giveaway = () => {
  const dispatch = useDispatch();
  const { giveaways } = useSelector((state) => state.giveaway);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    dispatch(getGiveaways(statusFilter));
  }, [statusFilter]);

  const handleCancel = (id) => {
    warning()
      .then((confirmed) => {
        if (confirmed) dispatch(cancelGiveaway(id));
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="px-3 py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="text-white mb-0">Giveaways</h4>
        <div className="d-flex align-items-center">
          <label className="text-white me-2 mb-0">Status:</label>
          <select
            className="form-select"
            style={{ width: 200 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All</option>
            <option value="1">Open</option>
            <option value="2">Closed (no entries)</option>
            <option value="3">Drawn</option>
            <option value="4">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table text-white align-middle">
          <thead>
            <tr>
              <th>No</th>
              <th>Created</th>
              <th>Seller</th>
              <th>Product</th>
              <th>Type</th>
              <th>Status</th>
              <th>Entries</th>
              <th>Winner</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {giveaways.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-4">
                  No giveaways yet.
                </td>
              </tr>
            )}
            {giveaways.map((g, idx) => {
              const label = STATUS_LABEL[g.status] || STATUS_LABEL[2];
              const seller = g.sellerId || {};
              const product = g.productId || {};
              const winner = g.winnerUserId || null;
              return (
                <tr key={g._id}>
                  <td>{idx + 1}</td>
                  <td>{formatDate(g.createdAt)}</td>
                  <td>
                    {seller.storeName ||
                      [seller.firstName, seller.lastName].filter(Boolean).join(" ") ||
                      "—"}
                  </td>
                  <td>{product.productName || "—"}</td>
                  <td>{TYPE_LABEL[g.type] || "—"}</td>
                  <td>
                    <span
                      className="badge p-2"
                      style={{ color: label.color, background: label.bg, borderRadius: 10 }}
                    >
                      {label.text}
                    </span>
                  </td>
                  <td>{g.entryCount ?? 0}</td>
                  <td>
                    {winner
                      ? [winner.firstName, winner.lastName].filter(Boolean).join(" ")
                      : "—"}
                  </td>
                  <td>
                    {g.status === 1 ? (
                      <button
                        className="btn btn-sm"
                        style={{ background: "#ffd4cf", color: "#a13b2f" }}
                        onClick={() => handleCancel(g._id)}
                      >
                        Cancel
                      </button>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Giveaway;
