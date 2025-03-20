import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import { Strategy as FacebookStrategy } from "passport-facebook";
// import { Strategy as TwitterStrategy } from "passport-twitter";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        console.log("Google Profile:", profile);
        return done(null, profile);
      } catch (err) {
        console.error("Google Auth Error:", err.message);
        return done(err);
      }
    }
  )
);

// Facebook OAuth Strategy
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID,
//       clientSecret: process.env.FACEBOOK_APP_SECRET,
//       callbackURL: "/auth/facebook/callback",
//       profileFields: ["id", "displayName", "email"], // Request email and name
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         console.log("Facebook Profile:", profile);
//         return done(null, profile);
//       } catch (err) {
//         console.error("Facebook Auth Error:", err.message);
//         return done(err, null);
//       }
//     }
//   )
// );

// Twitter OAuth Strategy
// passport.use(
//   new TwitterStrategy(
//     {
//       consumerKey: process.env.TWITTER_CONSUMER_KEY,
//       consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
//       callbackURL: "/auth/twitter/callback",
//       includeEmail: true,
//     },
//     async (token, tokenSecret, profile, done) => {
//       try {
//         console.log("Twitter Profile:", profile);
//         return done(null, profile);
//       } catch (err) {
//         console.error("Twitter Auth Error:", err.message);
//         return done(err, null);
//       }
//     }
//   )
// );

export default passport;
