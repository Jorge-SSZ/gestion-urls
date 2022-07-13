const express = require('express');
const { body } = require('express-validator');
const { loginForm, resgisterForm, registerUser, confirmAccount, loginUser, cerrarSesion } = require('../controllers/authController');
const router = express.Router();


router.get('/register', resgisterForm);
router.post('/register', [
  body("userName", "Ingresa un nombre valido").trim().notEmpty().escape(),
  body("email", "Ingresa un email valido").trim().isEmail().normalizeEmail(),
  body("password", "Ingrese una contraseña de minimo 6 caracteres").trim().isLength({min: 6}).escape().custom((value, {req}) => {
    if(value !== req.body.repassword) {
      throw new Error('Las contraseñas no coinciden');
    }else {
      return value;
    }
  })
],registerUser);
router.get('/confirm/:token', confirmAccount)
router.get('/login', loginForm);
router.post('/login', [
  body("email", "Ingresa un email valido").trim().isEmail().normalizeEmail(),
  body("password", "Ingrese una contraseña de minimo 6 caracteres").trim().isLength({min: 6}).escape()
],loginUser);
router.get('/logout', cerrarSesion);

module.exports = router;