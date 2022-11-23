const multer = require('multer')
const mime = require('mime-types')

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'upload')
  },
  filename: (req, file, callback) => {
    const extension = mime.extension(file.mimetype)
    callback(null, Date.now() + '.' + extension)
  }
})

module.exports = multer({
  storage
}).fields([{
  name: 'photo',
  maxCount: 1
}, {
  name: 'logo',
  maxCount: 1
}, {
  name: 'image',
  maxCount: 1
}, {
  name: 'files',
  maxCount: 20
}])