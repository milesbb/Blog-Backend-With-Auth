import GoogleStrategy from "passport-google-oauth20"
import AuthorsModel from "../../api/authors/model.js"
import { createTokens } from "./tools.js"

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: `${process.env.BE_URL}/users/googleRedirect`,
  },
  async (_, __, profile, passportNext) => {
    console.log("PROFILE: ", profile)
    try {
      const { email, given_name, family_name } = profile._json
      const author = await AuthorsModel.findOne({ email })

      if (author) {
        const { accessToken } = await createTokens(author)
        passportNext(null, { accessToken })
      } else {
        const newAuthor = new AuthorsModel({
          firstName: given_name,
          lastName: family_name,
          email,
          googleId: profile.id,
        })
        const createdAuthor = await newAuthor.save()

        // 3.1 Then we can go next (to /googleRedirect route handler function), passing the token
        const { accessToken } = await createTokens(createdAuthor)
        passportNext(null, { accessToken })
      }
    } catch (error) {
      // 4. In case of errors we are going to catch'em
      passportNext(error)
    }
  }
)

export default googleStrategy