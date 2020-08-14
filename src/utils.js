import axios from 'axios'
import { END_POINT } from './constants'


export const authAxios = axios.create({
    baseURL: END_POINT,
    headers: {
        Authorization: `Token ${localStorage.getItem('token')}`
    }
})