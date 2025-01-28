import axios from "axios"

const BASE_URL = 'https://quanlychungcuhuydung.loca.lt/'

export const endpoints={
    'token':'/o/token/',
    'user':'/user',
}

export default axios.create({
    baseURL: BASE_URL
});