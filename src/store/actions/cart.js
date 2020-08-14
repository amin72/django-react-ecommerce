import { authAxios } from "../../utils";
import { CART_START, CART_SUCCESS, CART_FAIL } from "./actionTypes";
import { ORDER_SUMNARY_URL } from "../../constants";


export const cartStart = () => {
    return {
        type: CART_START
    };
};


export const cartSuccess = data => {
    return {
        type: CART_SUCCESS,
        payload: data
    };
};


export const cartFail = error => {
    return {
        type: CART_FAIL,
        error: error
    };
};


export const fetchCart = () => {
    return dispatch => {
        dispatch(cartStart());
        authAxios
            .get(ORDER_SUMNARY_URL)
            .then(res => {
                dispatch(cartSuccess(res.data));
            })
            .catch(err => {
                dispatch(cartFail(err));
            });
    };
};
