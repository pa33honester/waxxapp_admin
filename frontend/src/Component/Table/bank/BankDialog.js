import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createbank, updatebank } from "../../store/bank/bank.action";
import { CLOSE_DIALOGUE } from "../../store/dialogue/dialogue.type";
import Input from "../../extra/Input";
import Button from "../../extra/Button";

const BankDialog = () => {
  const dispatch = useDispatch();
  const { dialogueData } = useSelector((state) => state.dialogue);

  const [mongoId, setMongoId] = useState("");
  const [name, setName] = useState();

  const [error, setError] = useState({
    name: "",
  });

  useEffect(() => {
    setMongoId(dialogueData?._id);
    setName(dialogueData?.name);
  }, [dialogueData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      let error = {};
      if (!name) error.name = "Name is required!";

      setError({ ...error });
    } else {
      let data = {
        name: name,
      };

      if (mongoId) {
        dispatch(updatebank(data, mongoId));
      } else {
        dispatch(createbank(data));
      }

      dispatch({ type: CLOSE_DIALOGUE });
    }
  };
  return (
    <div className="mainDialogue fade-in">
      <div className="Dialogue">
        <div className="dialogueHeader">
          <div className="headerTitle fw-bold">Bank</div>
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
                label={`Bank Name`}
                id={`name`}
                type={`text`}
                value={name}
                placeholder={`Enter Bank Name`}
                errorMessage={error.name && error.name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      name: `Name Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      name: "",
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className="dialogueFooter">
          <div className="dialogueBtn">
            <Button
              btnName={`Submit`}
              btnColor={`btnBlackPrime text-light`}
              style={{ borderRadius: "5px", width: "80px" }}
              newClass={`me-2`}
              onClick={handleSubmit}
            />
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

export default BankDialog;
