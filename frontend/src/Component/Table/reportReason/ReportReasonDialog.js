import React, { useEffect, useState } from 'react'
import Button from '../../extra/Button';
import Input from '../../extra/Input';
import { CLOSE_DIALOGUE } from '../../store/dialogue/dialogue.type';
import { useDispatch, useSelector } from 'react-redux';
import { add } from 'date-fns';
import { addReportReason, updateReportReason } from '../../store/reportReason/reportReason.action';

const ReportReasonDialog = () => {

    const { dialogueData } = useSelector((state) => state.dialogue);
    console.log("dialogueData------", dialogueData);



    const dispatch = useDispatch();
    const [title, setTitle] = useState("");
    const [mongoId, setMongoId] = useState("");
    const [error, setError] = useState({});

    useEffect(() => {
        setMongoId(dialogueData?._id);
        setTitle(dialogueData?.title);
    }, [dialogueData])


    const handleSubmit = () => {
        if (!title) {
            let error = {};
            if (!title) error.title = "Title Is Required!";

            return setError({ ...error });
        } else {

            if (mongoId) {
                dispatch(updateReportReason(title, mongoId));
            } else {
                dispatch(addReportReason(title));
            }
            dispatch({ type: CLOSE_DIALOGUE });
        }
    };


    return (
        <>
            <div className="mainDialogue fade-in">
                <div className="Dialogue">
                    <div className="dialogueHeader">
                        <div className="headerTitle fw-bold text-white">Report Reason</div>
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
                                    label={`Title`}
                                    id={`title`}
                                    newClass={`text-capitalize`}
                                    type={`text`}
                                    value={title}
                                    placeholder={`Enter Title`}
                                    errorMessage={error.title && error.title}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                        if (!e.target.value) {
                                            return setError({
                                                ...error,
                                                title: `Title Is Required`,
                                            });
                                        } else {
                                            return setError({
                                                ...error,
                                                title: "",
                                            });
                                        }
                                    }}
                                />
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
        </>
    )
}

export default ReportReasonDialog