import React, { useEffect, useState } from 'react'
import Input from '../../extra/Input';
import { useDispatch, useSelector } from 'react-redux';
import { CLOSE_DIALOGUE } from '../../store/dialogue/dialogue.type';
import { Box, FormControl, InputLabel, MenuItem, OutlinedInput, Select } from '@mui/material';
import Button from '../../extra/Button';
import Chip from "@mui/material/Chip";
import { getProducts, selectProducts } from '../../store/fake Seller/fakeSeller.action';
import { set } from 'date-fns';


const LiveSellerDialogue = () => {

    const dispatch = useDispatch();
    const { dialogueData } = useSelector((state) => state.dialogue);
    console.log("dialogueData------", dialogueData);

    const { fakeProduct } = useSelector((state) => state.fakeSeller)
    console.log("fakeProduct-----", fakeProduct);


    const [name, setName] = useState("")
    const [mongoId, setMongoId] = useState("")
    const [selectedProducts, setSelectedProducts] = useState([])
    const [selectedId, setSelectedId] = useState([]);

    const [errors, setErrors] = useState({});

    useEffect(() => {
        dispatch(getProducts(dialogueData?._id))
    }, [dispatch])

    const capitalizeFullName = (fullName = "") => {
        return fullName
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
    };

    useEffect(() => {
        setMongoId(dialogueData?._id);
        setName(capitalizeFullName(dialogueData?.firstName + " " + dialogueData?.lastName));
        setSelectedProducts(
            dialogueData?.selectedProducts?.map((product) => product.productName)
        );
        setSelectedId(dialogueData?.selectedProducts?.map((product) => product?.productId));
    }, [dialogueData]);

    const handleProductChange = (event) => {

        const {
            target: { value },
        } = event;

        const selectedValues = typeof value === "string" ? value.split(",") : value;


        setSelectedProducts(selectedValues);
        const selectedIds = selectedValues
            .map((productName) => {
                const product = fakeProduct.find(
                    (item) => item.productName === productName
                );
                return product ? product._id : null;
            })
            .filter((id) => id !== null);

        console.log("Selected IDs:", selectedIds);
        setSelectedId(selectedIds);

        if (selectedValues.length > 0) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                selectedProducts: "", 
            }));
        }

    }

    useEffect(() => {
        dialogueData?.isLive === false ? setSelectedProducts([]) : setSelectedProducts(dialogueData?.selectedProducts?.map((product) => product?.productName))
    }, [dialogueData])


    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {};

        // Validate: At least one product selected
        if (selectedProducts.length === 0) {
            newErrors.selectedProducts = "At least one product must be selected.";
        }

        // If validation fails, show errors and prevent submit
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // If valid, prepare data
        const data = {
            sellerId: dialogueData?._id,
            productIds: selectedId, // Ensure this is an array of product IDs
        };

        // Dispatch selected products action
        dispatch(selectProducts(data));

        // Close the dialogue
        dispatch({ type: CLOSE_DIALOGUE });
    };


    return (
        <div className="mainDialogue fade-in">
            <div className="Dialogue">
                <div className="dialogueHeader">
                    <div className="headerTitle fw-bold text-white">Live Seller</div>
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
                                label={`Name`}
                                id={`name`}
                                disabled
                                newClass={`text-capitalize`}
                                type={`text`}
                                value={name}
                            // errorMessage={error.name && error.name}
                            />
                        </div>


                        <label className="select_product mb-1">{`Select Product`}</label>
                        <div className="col-md-12 col-12"
                            style={{
                                paddingRight: "20px",
                                paddingLeft: "0px",

                            }}
                        >
                            <FormControl sx={{ m: 1, width: '100%' }}>
                                <InputLabel id="product-select-label">{`Select Product`}</InputLabel>
                                <Select
                                    labelId="product-select-label"
                                    id="product-select"
                                    multiple
                                    value={selectedProducts}
                                    onChange={handleProductChange}
                                    input={<OutlinedInput label="Select Products" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {fakeProduct.map((data) => (
                                        <MenuItem key={data._id} value={data.productName}>
                                            {data.productName}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {errors.selectedProducts && (
                                    <span className="text-danger">{errors.selectedProducts}</span>
                                )}
                            </FormControl>
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
                                // onClick={handleSubmit}
                                />
                            </>
                        ) : (
                            <>
                                <Button
                                    btnName={`Submit`}
                                    btnColor={`btnBlackPrime text-light`}
                                    style={{ borderRadius: "5px", width: "80px" }}
                                    newClass={`me-2`}
                                    onClick={handleSubmit}
                                />
                            </>
                        )}
                        <Button
                            btnName={`Close`}
                            btnColor={`myCustomButton`}
                            style={{ borderRadius: "5px", width: "80px" }}
                            onClick={() => {
                                dispatch({ type: CLOSE_DIALOGUE });
                            }}
                        />
                    </div>
                </div>
            </div>
        </div >
    )
}

export default LiveSellerDialogue