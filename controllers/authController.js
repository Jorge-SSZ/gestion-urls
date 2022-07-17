const User = require("../models/User");
const {validationResult} = require('express-validator')
const {nanoid} = require('nanoid');
const nodemailer = require('nodemailer');
require('dotenv').config()

const resgisterForm = (req, res) => {
  res.render('register');
}

const registerUser = async(req, res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    //return res.json(errors)
    req.flash("mensajes", errors.array())
    return res.redirect('/auth/register')
  }

  const { userName, email, password } = req.body;
  try {
    let user = await User.findOne({email: email});
    if(user) throw new Error('Ya existe usuario');

    user = new User({userName, email, password, tokenConfirm: nanoid() });
    await user.save();
    
    //Enviar correo electronico con la confirmación de cuenta

    const transport = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.USEREMAIL,
        pass: process.env.PASSEMAIL
      }
    });

    await transport.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: user.email, // list of receivers
      subject: "Verificación de correo electronico", // Subject line
      html: `<a href="${process.env.PATHHEROKU || 'http://localhost:5000'}auth/confirm/${user.tokenConfirm}">Verifica tu cuenta aqui</a>`, // html body
    });

    req.flash("mensajes", [{ msg: 'Revisa tu correo electronico y valida tu cuenta'}])
    return res.redirect('/auth/login')
  } catch (error) {
    //res.json({ error: 'Ocurrio un error al guardar el usuario'});
    req.flash("mensajes", [{ msg: error.message}])
    return res.redirect('/auth/register')
  }
}

const confirmAccount = async(req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({tokenConfirm: token});

    if (!user) throw new Error('No existe el usuario');
    
    user.cuentaConfirmada = true;
    user.tokenConfirm = null;
    
    await user.save();

    req.flash("mensajes", [{ msg: 'Cuenta verificada, puedes iniciar sesión'}])
    res.redirect('/auth/login');
  } catch (error) {
    //res.json({ error: error.message })  
    req.flash("mensajes", [{ msg: error.message}])
    return res.redirect('/auth/login')
  }
};

const loginForm = (req, res) => {
  res.render('login');
}

const loginUser = async (req, res) => {

  const errors = validationResult(req);
  if(!errors.isEmpty()){
    req.flash("mensajes", errors.array())
    return res.redirect('/auth/login')
  }

  const { email, password } = req.body;
  console.log(email, password);
  try {
    const user = await User.findOne({email});
    if(!user) throw new Error('No existe el email');

    if(!user.cuentaConfirmada) throw new Error('La cuenta no ha sido confirmada');

    if(!(await user.comparePassword(password)))
      throw new Error('Contraseña invalida');

      //me esta generando la sesión a traves de passport
      req.login(user, function (err) {
        if(err) throw new Error('Error al crear la sesión');
        return res.redirect('/')
      })


  } catch (error) {
    //console.log(error);
    req.flash("mensajes", [{ msg: error.message}])
    return res.redirect('/auth/login')
    //res.send(error.message);
  }
}

const cerrarSesion = (req, res) => {
  req.logout(function (err) {
    if(err) {
      return next(err);
    }
    return res.redirect('/auth/login');
  });
}


module.exports = {
  loginForm,
  resgisterForm,
  registerUser,
  confirmAccount,
  loginUser,
  cerrarSesion, 
}