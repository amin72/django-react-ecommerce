export const BASE_URL = 'http://localhost:8000'
export const API_URL = '/api'
export const END_POINT = `${BASE_URL}${API_URL}`

export const PRODUCT_LIST_URL = `${END_POINT}/products/`
export const PRODUCT_DETAIL_URL = id => `${END_POINT}/products/${id}`
export const ADD_TO_CART_URL = `${END_POINT}/add-to-cart/`
export const ORDER_SUMNARY_URL = `${END_POINT}/order-summary/`
export const CHECKOUT_URL = `${END_POINT}/checkout/`
export const ADD_COUPON_URL = `${END_POINT}/add-coupon/`
