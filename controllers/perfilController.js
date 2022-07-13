const formidable = require('formidable');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const jimp = require('jimp');

module.exports.formPerfil = async(req, res) => {

  try {
    const user = await User.findById(req.user.id);
    return res.render('perfil', { user: req.user, imagen: user.imagen});
  } catch (error) {
    req.flash('mensajes', [{ msg: 'Error al leer el usuario'}]);
    return res.redirect('/perfil');
  }
  
};

module.exports.editarFotoPerfil = async(req, res) => {
  const form = new formidable.IncomingForm();
  //form.maxFileSize = 50 * 1024 * 1024 //5mb

  form.parse(req, async(err, fields, files) => {
    try {
      if (err) {
        throw new Error('Fallo formidable')
      }
      console.log(fields);
      //console.log(files);

      const file = files.myFile;

      if(files.originalFileName === '') {
        throw new Error('Por favor agrega una imagen');
      }

      const imageTypes = ["image/jpeg", "image/png"];

      if(!imageTypes.includes(file.mimetype)) {
        throw new Error('Por favor agrega una imagen con los siguientes formatos: .jpeg o .png');
      }

      if(file.size > 50 * 1024 * 1024) {
        throw new Error('El limite de la imagen es de 5MB');
      }

      const extension = file.mimetype.split('/')[1];
      const dirFile = path.join(__dirname, `../public/img/perfiles/${req.user.id}.${extension}`);

      fs.renameSync(file.filepath, dirFile);

      const image = await jimp.read(dirFile);
      image.resize(200, 200).quality(90).writeAsync(dirFile);

      const user = await User.findById(req.user.id);
      user.imagen = `${req.user.id}.${extension}`
      await user.save();

      req.flash('mensajes', [{ msg: 'La imagen se ha subido correctamente'}]);
      return res.redirect('/perfil');
    } catch (error) {
      req.flash('mensajes', [{ msg: error.message}])
      return res.redirect('/perfil');
    }
  });
};