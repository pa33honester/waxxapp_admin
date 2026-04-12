import React, { useEffect, useState } from "react";
import Button from "../../extra/Button";
import { connect, useDispatch, useSelector } from "react-redux";
import { CLOSE_DIALOGUE } from "../../store/dialogue/dialogue.type";
import Input from "../../extra/Input";
import { createFaQ, updateFaQ } from "../../store/FAQ/faq.action";

const PromoDialog = (props) => {
  const { dialogueData } = useSelector((state) => state.dialogue);
  const [mongoId, setMongoId] = useState(0);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [error, setError] = useState({
    discountAmount: "",
    conditions: "",
    question: "",
    answer: "",
  });
  const dispatch = useDispatch();

  useEffect(() => {
    setMongoId(dialogueData?._id);

    setQuestion(dialogueData?.question);
    setAnswer(dialogueData?.answer);
  }, [dialogueData]);

  const handleSubmit = (e) => {
    if (!question || !answer) {
      let error = {};
      if (!question) error.question = "Question is Required !";
      if (!answer) error.answer = "Answer is Required !";

      return setError({ ...error });
    } else {
      const data = {
        question,
        answer,
      };

      if (mongoId) {
        props.updateFaQ(data, mongoId);
        console.log("mongoId", mongoId);
      } else {
        props.createFaQ(data);
      }
      dispatch({ type: CLOSE_DIALOGUE });
    }
  };
  return (
    <div className="mainDialogue fade-in">
      <div className="Dialogue">
        <div className="dialogueHeader">
          <div className="headerTitle fw-bold">FAQ</div>
          <div
            className="closeBtn "
            onClick={() => {
              dispatch({ type: CLOSE_DIALOGUE });
            }}
          >
            <i class="fa-solid fa-xmark"></i>
          </div>
        </div>
        <div className="dialogueMain">
          <div className="row">
            <div className="col-12">
              <Input
                label={`Question`}
                placeholder="Question..."
                id={`question`}
                type={`text`}
                value={question}
                errorMessage={error.question && error.question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      question: `Question Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      question: "",
                    });
                  }
                }}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-12 my-2">
              
              <div className="col-md-12 my-2">
                <Input
                  label={`Answer`}
                  placeholder={`Answer...`}
                  id={`answer`}
                  type={`text`}
                  as={`textarea`}
                  value={answer}
                  errorMessage={error.answer && error.answer}
                  onChange={(e) => {
                    setAnswer(e.target.value);
                    if (!e.target.value) {
                      setError({ ...error, answer: "Answer is Required!" });
                    } else {
                      setError({ ...error, answer: "" });
                    }
                  }}
                  rows={5} // if supported
                />
              </div>

              {error.answer && (
                <div className="pl-1 text-left">
                  <p className="errorMessage">{error.answer}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="dialogueFooter">
          <div className="dialogueBtn">
            {!mongoId ? (
              <>
                <Button
                  btnName={`Submit`}
                  btnColor={`btnBlackPrime text-light`}
                  style={{ borderRadius: "5px", width: "80px" }}
                  newClass={`me-2`}
                  onClick={handleSubmit}
                />
              </>
            ) : (
              <>
                <Button
                  btnName={`Update`}
                  btnColor={`btnBlackPrime text-light`}
                  style={{ borderRadius: "5px", width: "80px" }}
                  newClass={`me-2`}
                  onClick={handleSubmit}
                />
              </>
            )}
            <Button
              btnName={`Close`}
              btnColor="myCustomButton"
              style={{ borderRadius: "5px", width: "80px" }}
              onClick={() => {
                dispatch({ type: CLOSE_DIALOGUE });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(null, { createFaQ, updateFaQ })(PromoDialog);
