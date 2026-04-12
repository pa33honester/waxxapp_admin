// import React, { useEffect } from 'react'
// import { useDispatch, useSelector } from 'react-redux';
// import { reelInfo } from '../../store/reels/reels.action';
// import { CLOSE_DIALOGUE } from '../../store/dialogue/dialogue.type';

// const ReelInfoDialogue = (id) => {

//     const dispatch = useDispatch();
//     const { reelInfoDetails } = useSelector((state) => state.reels);
//     console.log("reelInfoDetails", reelInfoDetails);


//     useEffect(() => {
//         dispatch(reelInfo(id));
//     }, [])

//     return (
//         <>
//             <div className="mainDialogue fade-in">
//                 <div className="Dialogue">
//                     <div className="dialogueHeader">
//                         <div className="headerTitle fw-bold"

//                         >Product Information</div>
//                         <div
//                             className="closeBtn "
//                             onClick={() => {
//                                 dispatch({ type: CLOSE_DIALOGUE });
//                             }}
//                         >
//                             <i class="fa-solid fa-xmark"></i>
//                         </div>
//                     </div>

//                 </div>
//             </div>
//         </>
//     )
// }

// export default ReelInfoDialogue

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reelInfo } from '../../store/reels/reels.action';
import { CLOSE_DIALOGUE } from '../../store/dialogue/dialogue.type';
import { getSetting } from '../../store/setting/setting.action';
import defaultImage from '../../../assets/images/default.jpg';
import { baseURL } from '../../../util/config';

const ReelInfoDialogue = () => {
    const dispatch = useDispatch();
    const { dialogueData } = useSelector((state) => state.dialogue);
    console.log("dialogueData----male chhehh sdhsfhsdhf", dialogueData);


    const { setting } = useSelector((state) => state.setting);
    console.log("setting--", setting);


    const [showFullDesc, setShowFullDesc] = useState(false);

    useEffect(() => {
        dispatch(getSetting());
    }, [dispatch]);

    // Optional: truncate text after approx 4 lines (~300 chars or adjust as needed)
    const truncateLength = 165;

    const description = dialogueData?.description || '';
    const isTruncateNeeded = description.length > truncateLength;

    const displayText = showFullDesc || !isTruncateNeeded
        ? description
        : description.slice(0, truncateLength) + '...';

    return (
        <div className="mainDialogue fade-in" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
            <div className="DialogueReels" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
                <div className="dialogueHeader">
                    <div className="headerTitle fw-bold">Product Information</div>
                    <div
                        className="closeBtn"
                        onClick={() => {
                            dispatch({ type: CLOSE_DIALOGUE });
                        }}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </div>
                </div>

                <div className='row' style={{ padding: "0px 24px" }}>
                    <div className='col-4'>
                        <div className='model-body mt-3 d-flex justify-content-start'>
                            <video
                                // autoPlay
                                controls
                                className="w-100"
                                height={490}
                                style={{ borderRadius: "5px" }}
                                src={dialogueData?.video}
                            />
                        </div>
                    </div>
                    <div className='col-8'>
                        <div>
                            <h4 className='fw-bold' >{dialogueData?.sellerId?.firstName + ' ' + dialogueData?.sellerId?.lastName}</h4>
                        </div>
                        <div
                            className='row'
                            style={{
                                maxHeight: '500px',  // set a fixed max height (adjust as needed)
                                overflowY: 'auto',   // vertical scrollbar will appear if content overflow
                                paddingRight: '12px' // optional padding for scrollbar space
                            }}>
                            {dialogueData?.products?.map((data, index) => (
                                <div
                                    key={index}
                                    className="d-flex mb-4" // Each product card with margin-bottom for gap
                                    style={{
                                        border: "1px solid #eee",
                                        borderRadius: "8px",
                                        padding: "18px",
                                        background: "#fff",
                                        alignItems: "flex-start"
                                    }}
                                >
                                    <div className='col-4' style={{ minWidth: "180px", marginRight: "18px" }}>
                                        <img
                                            src={data?.mainImage}
                                            alt={data?.productName || "Product image"}
                                            style={{ width: "80%", borderRadius: "6px", objectFit: "cover", maxHeight: "200px" }}
                                        />
                                    </div>

                                    <div className='col-8'>
                                        <div className='fw-semibold mb-2' style={{ color: "#000" }}>
                                            Product Name : <span style={{ color: "#000", fontWeight: "300" }}>{data?.productName}</span>
                                        </div>
                                        <div className='fw-semibold mb-2' style={{ color: "#000" }}>
                                            Product Code : <span style={{ color: "#000", fontWeight: "300" }}>{data?.productCode}</span>
                                        </div>
                                        <div className='fw-semibold mb-2' style={{ color: "#000" }}>
                                            Product price ({`${setting?.currency?.symbol}`}) : <span style={{ color: "#000", fontWeight: "300" }}>{data?.price}</span>
                                        </div>
                                        {/* Attributes Loop */}
                                        {data?.attributes && data?.attributes.length > 0 && (
                                            <div style={{ marginTop: '12px' }}>
                                                <div className='fw-semibold' style={{ color: "#000" }}>Attributes:</div>
                                                {data?.attributes.map((attr, attrIdx) => (
                                                    <div key={attrIdx} style={{ marginBottom: "8px", marginLeft: "12px" }}>
                                                        {/* Attribute Image */}
                                                        {attr?.image && (
                                                            <img
                                                                src={baseURL + attr.image}
                                                                alt={attr.name}
                                                                style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px", marginRight: "10px" }}
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = defaultImage;
                                                                }}
                                                            />
                                                        )}
                                                        {/* Attribute Name + Values */}
                                                        <span style={{ color: "#444", fontWeight: "bold" }}>{attr?.name}:</span>
                                                        <span style={{ marginLeft: "8px" }}>
                                                            {(attr?.values || []).join(", ")}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

                <div
                    style={{
                        background: "#f8f9fa",
                        padding: "10px 28px",
                        borderRadius: "12px",
                        margin: "1px 24px 10px 24px",
                        border: "1px solid #eee",
                        display: "flex",
                        alignItems: "flex-start"
                    }}
                >
                    <i className="fa-solid fa-info-circle" style={{ fontSize: 26, marginRight: 18, color: "#377dff" }} />
                    <div style={{ fontSize: 16, color: "#343a40", fontWeight: 400 }}>
                        {dialogueData?.description}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ReelInfoDialogue;


