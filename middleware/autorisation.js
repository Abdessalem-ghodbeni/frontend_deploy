const jwt = require('jsonwebtoken');

module.exports = {
    autorisation: async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).send("Authorization failed. No access token.");
        }
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                // Vérifiez si l'erreur est due à un token expiré
                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({
                        success: false,
                        message: "Token expired",
                        expiredAt: err.expiredAt
                    });
                }
                console.log(err);
                return res.status(403).send("Could not verify token");
            }
            req.user = user;
            next();
        });
    }
};
