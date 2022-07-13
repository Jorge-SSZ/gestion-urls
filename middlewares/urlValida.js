const { URL } = require('url');
const urlValidar = (req, res, next) => {
  try {
    const { origin } = req.body;
    const urlFrontend = new URL(origin);
    if (urlFrontend.origin !== 'null') {
      if(urlFrontend.protocol === 'https:' ||
      urlFrontend.protocol === 'http:'
      ){
      return next();
      }
      throw new Error('Tiene que ser https://')
    } 
      throw new Error('no valida 😒');
  } catch (error) {
    if(error.message === 'Invalid URL') {
      req.flash("mensajes", [{ msg: 'URL no valida' }]);
    } else {
      req.flash('mensajes', [{ msg: error.message }])
    }
    //console.log(error);
    return res.redirect('/');
    
  }
}

module.exports = urlValidar;  