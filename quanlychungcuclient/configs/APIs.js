import axios from "axios"

const BASE_URL = 'https://quanlychungcuhuydung.loca.lt/'

export const endpoints={
    'token':'/o/token/',
    'user':'/user',
    'thongtinchuyentiens':'/thongtinchuyentiens',
    'thegiuxes':'/thegiuxes',
}

export default axios.create({
    baseURL: BASE_URL
});