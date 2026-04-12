import React, { useEffect, useState } from "react";
import Button from "../../extra/Button";
import FaqDialog from "./FaqDialog";
import { OPEN_DIALOGUE } from "../../store/dialogue/dialogue.type";
import { connect, useDispatch, useSelector } from "react-redux";
import { getFaQ, deleteFaQ } from "../../store/FAQ/faq.action";
import {  warning } from "../../../util/Alert";
import Skeleton from "react-loading-skeleton";
import { colors } from "../../../util/SkeletonColor";
import "react-loading-skeleton/dist/skeleton.css";


const FaQ = (props) => {
  const { FaQ } = useSelector((state) => state.FaQ);
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);

  const dispatch = useDispatch();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(getFaQ());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setData(FaQ);
  }, [FaQ]);

  const handleDelete = (id) => {
    warning().then((isDeleted) => {
      if (isDeleted) {
        props.deleteFaQ(id);
      }
    });
  };

  return (
    <div className="container py-5 mt-4">
      <div className="text-center mb-5">
        <h1 className="fw-bold">
          Frequently Asked{" "}
          <span className="faq-gradient-text">Questions</span>
        </h1>
        <p className="text-muted fs-5">
          Need help or have questions? Find your answers below.
        </p>
      </div>

      <div className="text-center mb-4">
        <button
          className="btn btn-add-question"
          onClick={() =>
            dispatch({ type: OPEN_DIALOGUE, payload: { type: "faq" } })
          }
        >
          + Add Question
        </button>
        {dialogue && dialogueType === "faq" && <FaqDialog />}
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-10 faq-wrapper">
          <div className="accordion" id="faqAccordion">
            {loading ? (
              [...Array(3)].map((_, index) => (
                <div className="mb-3" key={index}>
                  <Skeleton
                    height={60}
                    baseColor={colors.baseColor}
                    highlightColor={colors.highlightColor}
                  />
                </div>
              ))
            ) : (
              data.map((item, index) => {
                const collapseId = `faq-collapse-${index}`;
                const headingId = `faq-heading-${index}`;
                return (
                  <div className="accordion-item faq-item shadow-sm" key={item._id}>
                    <h2 className="accordion-header" id={headingId}>
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#${collapseId}`}
                        aria-expanded="false"
                        aria-controls={collapseId}
                      >
                        {item.question}
                      </button>
                    </h2>
                    <div
                      id={collapseId}
                      className="accordion-collapse collapse"
                      aria-labelledby={headingId}
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body">
                        <p className="text-muted mb-3">{item.answer}</p>
                        <div className="d-flex justify-content-end gap-2">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() =>
                              dispatch({
                                type: OPEN_DIALOGUE,
                                payload: { data: item, type: "FaQ" },
                              })
                            }
                          >
                            <i className="fa fa-edit" /> Edit
                          </button>
                          {dialogue && dialogueType === "FaQ" && <FaqDialog />}
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(item._id)}
                          >
                            <i className="bi bi-trash3" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(null, { getFaQ, deleteFaQ })(FaQ);
