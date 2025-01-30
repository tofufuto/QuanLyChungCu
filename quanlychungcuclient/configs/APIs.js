import axios from "axios"

const BASE_URL = 'https://quanlychungcuhuydung1.loca.lt/'

export const endpoints={
    'token':'/o/token/',
    'user':'/user',
    'thongtinchuyentiens':'/thongtinchuyentiens',
    'thegiuxes':'/thegiuxes',
    'phieudongtiens':'/phieudongtiens',
    'tudodientus':'/tudodientus',
}

export default axios.create({
    baseURL: BASE_URL
});