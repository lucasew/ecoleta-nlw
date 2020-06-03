import getenv from 'getenv';

export default {
    port: getenv.int("HTTP_PORT", 3001)
}