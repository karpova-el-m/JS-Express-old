export function requstTime(req, res, next) {
    req.requstTime = Date.now()
    next()
}