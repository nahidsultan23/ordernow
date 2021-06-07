const sharp = require('sharp');
sharp.cache(false);

const dimensionCalculator = (dimension,targetDimension) => {
    let newDimension = {};

    if(dimension.w > targetDimension.w && dimension.h < targetDimension.h) {
        newDimension.width = targetDimension.w;
    }
    else if(dimension.w < targetDimension.w && dimension.h > targetDimension.h) {
        newDimension.height = targetDimension.h;
    }
    else if(dimension.w > targetDimension.w && dimension.h > targetDimension.h) {
        if((dimension.h / dimension.w) * targetDimension.w <= targetDimension.h) {
            newDimension.width = targetDimension.w;
        }
        else if((dimension.w / dimension.h) * targetDimension.h <= targetDimension.w) {
            newDimension.height = targetDimension.h;
        }
    }
    else {
        newDimension.width = targetDimension.w;
    }

    return newDimension;
}

const storePhoto = (photo,outputDestination) => {
    var inputPhoto = sharp('photos/temp/' + photo.name).jpeg({quality : 50});

    if(photo.type === 'banner') {
        inputPhoto
        .metadata()
        .then(info => {
            let reSize = dimensionCalculator({w:info.width,h:info.height},{w:250,h:50});
            let outputPath = outputDestination + 'photo-250/' + photo.name;

            inputPhoto.resize(reSize).toFile(outputPath)
            .then(newFileInfo => {
                reSize = dimensionCalculator({w:info.width,h:info.height},{w:1500,h:300});
                outputPath = outputDestination + 'photo-1500/' + photo.name;

                inputPhoto.resize(reSize).toFile(outputPath)
                .then(newFileInfo => {
                    reSize = dimensionCalculator({w:info.width,h:info.height},{w:3000,h:600});
                    outputPath = outputDestination + 'photo-3000/' + photo.name;

                    inputPhoto.resize(reSize).toFile(outputPath)
                    .then(newFileInfo => {
                        const fs = require("fs");
                        fs.unlink('photos/temp/' + photo.name, (err) => {});
                    })
                    .catch(err => {
                        // No action required
                    });
                })
                .catch(err => {
                    // No action required
                });
            })
            .catch(err => {
                // No action required
            });
        })
        .catch(err => {
            // No action required
        })
    }
    else{
        inputPhoto
        .metadata()
        .then(info => {
            let reSize = dimensionCalculator({w:info.width,h:info.height},{w:50,h:47});
            let outputPath = outputDestination + 'photo-50/' + photo.name;

            inputPhoto.resize(reSize).toFile(outputPath)
            .then(newFileInfo => {
                reSize = dimensionCalculator({w:info.width,h:info.height},{w:320,h:300});
                outputPath = outputDestination + 'photo-320/' + photo.name;

                inputPhoto.resize(reSize).toFile(outputPath)
                .then(newFileInfo => {
                    reSize = dimensionCalculator({w:info.width,h:info.height},{w:640,h:600});
                    outputPath = outputDestination + 'photo-640/' + photo.name;

                    inputPhoto.resize(reSize).toFile(outputPath)
                    .then(newFileInfo => {
                        const fs = require("fs");
                        fs.unlink('photos/temp/' + photo.name, (err) => {});
                    })
                    .catch(err => {
                        // No action required
                    });
                })
                .catch(err => {
                    // No action required
                });
            })
            .catch(err => {
                // No action required
            });
        })
        .catch(err => {
            // No action required
        })
    }
}

module.exports = storePhoto;