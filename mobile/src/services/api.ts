import axios from 'axios'

export const baseURL = "http://192.168.0.119:3001"

export interface ApiResponse<T> {
    error?: string,
    data?: T
}

const api = axios.create({
    baseURL
})

export default api