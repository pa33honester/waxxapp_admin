import { apiInstanceFetch } from "../../../util/api";
import * as ActionType from "./verification.type";
import { setToast } from "../../../util/toast";

// Fetch the admin verification queue. Default filter: pending_review.
// Backend endpoint: GET /verification/admin/list?status=&page=&limit=
export const getVerificationQueue = (status = "pending_review", page = 1, limit = 50) => (dispatch) => {
  const url = `verification/admin/list?status=${encodeURIComponent(status)}&page=${page}&limit=${limit}`;
  apiInstanceFetch
    .get(url)
    .then((res) => {
      dispatch({
        type: ActionType.GET_VERIFICATION_QUEUE,
        payload: { items: res.data || [], total: res.total || 0 },
      });
    })
    .catch((error) => console.error("getVerificationQueue:", error));
};

// Approve / reject a submission. Backend: PATCH /verification/admin/review
// Body: { verificationId, decision, rejectionReason? }
export const reviewVerification = (verificationId, decision, rejectionReason) => (dispatch) => {
  const body = { verificationId, decision, rejectionReason };
  apiInstanceFetch
    .patch("verification/admin/review", body)
    .then((res) => {
      if (res?.status) {
        dispatch({
          type: ActionType.REVIEW_VERIFICATION,
          payload: { verificationId, decision },
        });
        setToast("success", res.message || `Verification ${decision}`);
      } else {
        setToast("error", res?.message || "Review failed");
      }
    })
    .catch((error) => setToast("error", error.message || String(error)));
};
