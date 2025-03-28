// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import { Strategy as FacebookStrategy } from "passport-facebook";
// import { Strategy as TwitterStrategy } from "@superfaceai/passport-twitter-oauth2";
// import dotenv from "dotenv";

// dotenv.config(); // Load environment variables

// // Google OAuth Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
//     },
//     async function (accessToken, refreshToken, profile, done) {
//       try {
//         console.log("Google Profile:", profile);
//         return done(null, profile);
//       } catch (err) {
//         console.error("Google Auth Error:", err.message);
//         return done(err);
//       }
//     }
//   )
// );

// //Facebook OAuth Strategy
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: process.env.FACEBOOK_APP_ID,
//       clientSecret: process.env.FACEBOOK_APP_SECRET,
//       callbackURL: `${process.env.BASE_URL}/api/auth/facebook/callback`,
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

// // Twitter OAuth Strategy
// passport.use(
//   new TwitterStrategy(
//     {
//       clientID: process.env.TWITTER_CLIENT_ID,
//       clientSecret: process.env.TWITTER_CLIENT_SECRET,
//       callbackURL: `${process.env.BASE_URL}/api/auth/twitter/callback`,
//       pkce: false,
//       state: false,
//       session: false,
//     },
//     async (req, token, tokenSecret, profile, done) => {
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

// export default passport;
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as TwitterStrategy } from "@superfaceai/passport-twitter-oauth2";
import session from "express-session";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Session Middleware (Required for OAuth)
export const configureSession = (app) => {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "temporarySecret", // Secure session storage
      resave: false, // Don't save session if unchanged
      saveUninitialized: true, // Create session if new
      cookie: { secure: process.env.NODE_ENV === "production" }, // Secure in production
    })
  );
};

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
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
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/facebook/callback`,
      profileFields: ["id", "displayName", "email"], // Request email and name
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("Facebook Profile:", profile);
        return done(null, profile);
      } catch (err) {
        console.error("Facebook Auth Error:", err.message);
        return done(err);
      }
    }
  )
);

// Twitter OAuth Strategy
passport.use(
  new TwitterStrategy(
    {
      clientType: "confidential",
      clientID: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/auth/twitter/callback`,
      scope: ["tweet.read", "users.read"], // Ensure correct scopes
      session: true, // Ensure session is enabled for Twitter OAuth
      pkce: true,
      state: true, //
    },
    async (token, tokenSecret, profile, done) => {
      try {
        console.log("Twitter Profile:", profile);
        return done(null, profile);
      } catch (err) {
        console.error("Twitter Auth Error:", err.message);
        return done(err);
      }
    }
  )
);

// Serialize & Deserialize User (Required for session support)
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

export default passport;
