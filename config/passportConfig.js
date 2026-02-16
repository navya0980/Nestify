const passport = require("passport");
const LocalStrategy = require("passport-local");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/users");

module.exports = (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) => {
  // Set up Local Strategy
  passport.use(new LocalStrategy(User.authenticate()));

  // Custom serialization for both local and Google users
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id)
      .then(user => {
        done(null, user);
      })
      .catch(err => {
        done(err);
      });
  });

  // Set up Google Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const displayName = profile.displayName;

          if (!email) {
            return done(null, false, { message: "No email from Google" });
          }

          // Case 1: user already linked with Google
          let user = await User.findOne({ googleId: profile.id });

          // Case 2: existing local user with same email
          if (!user && email) {
            user = await User.findOne({ email });

            if (user) {
              user.googleId = profile.id;
              user.avatar = profile.photos?.[0]?.value;
              await user.save();
            }
          }

          // Case 3: new user
          if (!user) {
            let username = displayName || email.split('@')[0];

            // Check if username already exists, if yes append random suffix
            let existingUser = await User.findOne({ username });
            if (existingUser) {
              username = username + "_" + Math.random().toString(36).substring(7);
            }

            user = await User.create({
              username: username,
              googleId: profile.id,
              email: email,
              avatar: profile.photos?.[0]?.value,
            });
          }

          return done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    )
  );
};
