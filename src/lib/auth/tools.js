import jwt from "jsonwebtoken"

export const createAccessToken = payload =>
  new Promise((resolve, reject) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1 week" }, (err, token) => {
      if (err) reject(err)
      else resolve(token)
    })
  )

export const verifyAccessToken = accessToken =>
  new Promise((res, rej) =>
    jwt.verify(accessToken, process.env.JWT_SECRET, (err, originalPayload) => {
      if (err) rej(err)
      else res(originalPayload)
    })
  )