import jwtPkg from "jsonwebtoken";

import environment from "../config/environment.js";

const { sign, verify } = jwtPkg;

export const signJWTtoken = (UserId, Email) => {
    const token = sign(
        { user_id: UserId, Email },
        environment?.tokenKey,
        { expiresIn: "2h", }
    );

    return token;
}

export const verifyJWTtoken = async(token) => {
    return new Promise((resolve, reject) => {
        verify(token, environment?.tokenKey, { algorithm: 'HS256' }, (err, decoded) => {
            if (err) { reject(null); }
            else { resolve(decoded); }
        });
    });
}

