const checkPhoto = (file) => {
    const photoExtension = /.*(jpg|jpeg|png)/i; 
    if(photoExtension.test(file.originalname) && photoExtension.test(file.mimetype))
        return true;

    return false;
}

module.exports = checkPhoto;