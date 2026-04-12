import * as ActionType from "./subCategory.type";

const initialState = {
  subCategory: [],
  categoryWiseSubCategory: [],
};

export const subCategoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_SUB_CATEGORY:
      return {
        ...state,
        subCategory: action.payload,
      };
    case ActionType.GET_CATEGORY_WISE_SUBCATEGORY:
      return {
        ...state,
        categoryWiseSubCategory: action.payload,
      };
    case ActionType.CREATE_SUB_CATEGORY:
      return {
        ...state,
        categoryWiseSubCategory: Array.isArray(state.categoryWiseSubCategory)
          ? Array.isArray(action?.payload)
            ? [...state.categoryWiseSubCategory, ...action?.payload]
            : [...state.categoryWiseSubCategory, action?.payload]
          : Array.isArray(action?.payload)
          ? [...action?.payload]
          : [action?.payload],
      };
    case ActionType.UPDATE_SUB_CATEGORY:
      const transformedData2 = {
        subCategoryId: action.payload.data._id,
        name: action.payload.data.name,
        image: action.payload.data.image,
        category: action.payload.data.category.name,
        categoryId: action.payload.data.category._id,
        sameSubcategoryProductCount: 0,
      };


      return {
        ...state,
        categoryWiseSubCategory: state.categoryWiseSubCategory.map((data) =>
          data?.subCategoryId
            ? data.subCategoryId === action.payload.id
              ? action?.payload?.data
              : data
            : data?._id === action?.payload?.id
            ? action?.payload?.data
            : data
        ),
      };
    case ActionType.DELETE_SUB_CATEGORY:
      return {
        ...state,
        categoryWiseSubCategory: state.categoryWiseSubCategory.filter(
          (data) => 
              data?.subCategoryId ?          
            data.subCategoryId !== action?.payload :
              data?._id !== action?.payload
        ),
      };

      case ActionType.CLEAR_SUB_CATEGORY:
      return {
        ...state,
        categoryWiseSubCategory: [],
      }


    default:
      return state;
  }
};
