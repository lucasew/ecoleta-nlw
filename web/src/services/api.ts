import axios from 'axios'

export const baseURL = 'http://localhost:3001'

const api = axios.create({
    baseURL
})

// Debugging utilities
// api.interceptors.request.use(request => {
//     console.log(request)
//     return request
// })

// api.interceptors.response.use(response => {
//     console.log(response)
//     return response
// })

export default api