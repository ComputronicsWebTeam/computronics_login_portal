const { validateToken } = require("../services/authentication")


function verifyRole(requiredRole) {
    return (req, res, next)=>{
        const tokenValue = req.cookies['token']

        if(!tokenValue) {
            return next()
        }

        try {
            const adminPayload = validateToken(tokenValue)
            if(adminPayload.role !== requiredRole){
                return res.send('Access denied. Insufficient permissions')
            }
            req.User = adminPayload
            next()
        } catch (error) {
            next()
        }
    }
}



module.exports = {verifyRole,}