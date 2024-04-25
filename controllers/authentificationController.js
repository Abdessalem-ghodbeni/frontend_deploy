const userModel = require("../models/userModel");
const { join } = require("path");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

function generateAccessToken(user) {
  return jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
}
let refreshTokens = [];
function generateRefreshToken(user) {
  return jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
}

var transport = nodemailer.createTransport({
  host: process.env.MAILTRAP_HOST,
  port: process.env.MAILTRAP_PORT,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

module.exports = {
  verif: async (req, res) => {
    try {
      const user = await userModel.findOne({
        codeVerification: req.params.codeVerification,
      });
      user.verified = true;
      user.codeVerification = undefined;
      user.save();
      return res.redirect(`${process.env.CLIENT_URL}/verificationEmailSuccess`);
    } catch (error) {
      return res.redirect(`${process.env.CLIENT_URL}/verificationEmailError`);
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Invalid E-mail address.",
          data: null,
        });
      }
      if (!user.verified) {
        return res.status(400).json({
          success: false,
          message: "Please check your mailbox and confirm your E-mail address.",
          data: null,
        });
      }
      if (!user.confirmed) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is not verified by the administrator.",
          data: null,
        });
      }
      if (user.blocked) {
        return res.status(400).json({
          success: false,
          message:
            "Your account is blocked.",
          data: null,
        });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Incorrect password.",
          data: null,
        });
      }
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);
      refreshTokens.push(refreshToken);
      return res.status(201).json({
        success: true,
        message: "Bienvenu",
        data: {
          data: user,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
      });
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: "error" + error, data: null });
    }
  },
  logout: async (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token manquant",
        data: null,
      });
    }

    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json({
        success: false,
        message: "Refresh token invalide",
        data: null,
      });
    }

    // Supprimer le refresh token de la liste des jetons actifs
    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    return res
      .status(200)
      .json({ success: true, message: "Déconnexion réussie", data: null });
  },
  verifyRefreshToken: async (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token manquant",
        data: null,
      });
    }

    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json({
        success: false,
        message: "Refresh token invalide",
        data: null,
      });
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Refresh token invalide",
          data: null,
        });
      }

      const accessToken = generateAccessToken({ id: user.id });
      const refreshToken = generateRefreshToken({ id: user.id });

      return res.status(200).json({
        success: true,
        message: "Token actualisé",
        data: { accessToken: accessToken, refreshToken: refreshToken },
      });
    });
  },
  forgotPassword: async (req, res) => {
    const { email } = req.body;

    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Aucun utilisateur avec cet email.",
        });
      }

      const resetToken = jwt.sign(
        { id: user.id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "24h" }
      );
      user.resetToken = resetToken;
      await user.save();

      transport.sendMail(
        {
          from: '"MediColGes" <<superadmin@medicolges.com>>',
          to: user.email,
          subject: "MediColGes: Password reset",
          html: `
          <!DOCTYPE html>
          <html lang="fr">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
              <style>
                  html, body {
                      height: 100%;
                  }
                  body {
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      min-height: 100vh;
                      margin: 0;
                  }
              </style>
          </head>
          <body>
          
              <div class="card text-center shadow-lg p-3 mb-5 bg-body rounded" style="width: 30rem;">
                  <img class="card-img-top mx-auto d-block" src="https://res.cloudinary.com/dvofvctg3/image/upload/v1711821509/nj5tztlezkwzrfpgwlgr.png" style="width: 6rem; height: 5rem;" alt="Card image cap">
                  <div class="card-body">
                      <h5 class="card-title">Resetting your MediColGes password</h5>
                      <br>
                      <p class="card-text"><strong>${user.nom} ${user.prenom}</strong>, You have requested to reset your password. Please click the link below to perform the reset:</p>
                      <p class="card-text">The link will expire after <strong>24 hours</strong>.</p>
                      <br>
                      <a href='http://localhost:5173/resetPassword/${resetToken}' class="btn btn-primary">Reset my password</a>
                  </div>
                  <div class="card-footer">
                      <p class="card-text">If you have not requested a password reset, please ignore this email or notify us.</p>
                  </div>
              </div>
          
              <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js" integrity="sha384-IQsoLXl5PILFhosVNubq5LC7Qb9DXgDA9i+tQ8Zj3iwWAwPtgFTxbJ8NT4GN1R8p" crossorigin="anonymous"></script>
              <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js" integrity="sha384-cVKIPhGWiC2Al4u+LWgxfKTRIcfu0JTxR+EQDz/bgldoEyl4H0zUF0QKbrJ0EcQF" crossorigin="anonymous"></script>
          
          </body>
          </html>
        `,
        },
        (err, info) => {
          if (err) {
            return res.status(400).json({
              success: false,
              message: "Une erreur s'est produite lors de l'envoi de l'email.",
            });
          }
          return res
            .status(200)
            .json({ success: true, message: "Email envoyé avec succès." });
        }
      );
    } catch (error) {
      return res.status(400).json({ success: false, message: "error" + error });
    }
  },
  resetPassword: async (req, res) => {
    const { newPassword } = req.body;
    const token = req.params.resetToken;

    try {
      const user = await userModel.findOne({
        resetToken: token,
      });

      if (!user) {
        return res.status(400).json({
          success: false,
          message: "Jeton de réinitialisation invalide ou expiré.",
          data: null,
        });
      }

      user.password = await bcrypt.hash(newPassword, saltRounds);
      user.resetToken = undefined;
      await user.save();

      return res.status(201).json({
        success: true,
        message: "Mot de passe réinitialisé avec succès.",
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la réinitialisation du mot de passe.",
        data: null,
      });
    }
  },
  verify2fa: async (req, res) => {
    const { token } = req.body;
    const { id } = req.params;

    try {
      const user = await userModel.findById(id);

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token,
      });

      if (verified) {
        user.isTwoFactorEnabled = true;
        await user.save();
        res.json({ success: true, message: "2FA activé avec succès" });
      } else {
        res.status(400).json({ success: false, message: "Code 2FA invalide" });
      }
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Erreur lors de la vérification 2FA",
        });
    }
  },
  disable2fa: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await userModel.findById(id);

      user.isTwoFactorEnabled = false;

      await user.save();

      res.json({ success: true, message: "2FA successfully disabled" });
    } catch (error) {
      return res.status(500).json({
        message:
          "Une erreur s'est produite lors de la désactivation de l'authentification à deux facteurs.",
      });
    }
  },
};
