// Headers better-auth reads the client IP from, for its rate limiter. nginx sets
// X-Real-IP from the TCP peer; X-Forwarded-For is whatever the caller sends.
export const AUTH_IP_HEADERS = ["x-real-ip"];
