import toastify, {toast} from 'react-toastify'

function useToastType(type: toastify.TypeOptions) {
    return function(msg: string) {
        toast(msg, {
            type
        })
    }
}

export default {
    error: useToastType('error'),
    success: useToastType('success'),
    info: useToastType('info'),
    warning: useToastType('warning'),
    default: useToastType('default'),
}