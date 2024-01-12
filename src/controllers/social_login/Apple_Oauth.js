const Jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const { completeRegistration } = require("../authController");

const appleUrl = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
});

const verifyAppleIdentityToken = async (identityToken, user) => {
  try {
    const decodedToken = Jwt.decode(identityToken, { complete: true });
    const { header } = decodedToken;
    const kid = header.kid;

    const key = await new Promise((resolve, reject) => {
      appleUrl.getSigningKey(kid, (err, key) => {
        if (err) {
          reject(err);
        } else {
          resolve(key);
        }
      });
    });

    const publicKey = key.publicKey || key.rsaPublicKey;

    const verifiedToken = Jwt.verify(identityToken, publicKey, {
      algorithms: ["RS256"],
    });

    if (!verifiedToken) throw new Error("Verification failed");

    if (verifiedToken.aud === "com.mapout" && verifiedToken.sub === user) {
      const userInfo = {
        email: verifiedToken.email,
        name: verifiedToken.name,
        email_verified: verifiedToken.email_verified,
        // Extract other necessary information from the token
      };
      return userInfo;
    } else {
      throw new Error("Verifcation failed with invalid user or aud");
    }
  } catch (error) {
    throw new Error("Token verification failed: " + error.message);
  }
};

module.exports = {
  appleAuth: async (req, res) => {
    try {
      const { from, deviceToken, appleAuthRequestResponse } = await req.body;

      const { identityToken, user } = appleAuthRequestResponse;
      const userInfo = await verifyAppleIdentityToken(identityToken, user);
      const { email, name, email_verified } = userInfo;

      if (email_verified) {
        let registerUser;
        switch (from) {
          case "app":
            registerUser = await completeRegistration({
              email,
              name,
              deviceToken,
              isSocialLoggedin: true,
              socialSource: "apple",
            });
            break;

          case "dew":
            // For dew
            break;

          default:
            break;
        }
        res.status(200).send({
          status: true,
          message: "success",
          data: registerUser,
        });
      } else {
        res.status(400).send({ status: false, message: "Email not verified" });
      }
    } catch (error) {
      res
        .status(500)
        .send({
          status: false,
          message: `Something went wrong: ${error.message} `,
        });
    }
  },
};
