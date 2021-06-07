const cron = require('node-cron');

var task = cron.schedule('00 00 00 * * *', () => {
	const tempPhotoModel = require('../models/tempPhotoModel');
	const fs = require('fs');
	tempPhotoModel.find({},(err,tempPhotos) => {
		for(i in tempPhotos) {
			let time = tempPhotos[i].time;
			let timeInterval = Math.abs(new Date() - time);

			if(timeInterval > 24*60*60*1000) {
				let photoPath = 'photos/temp/' + tempPhotos[i].name;

				fs.unlink(photoPath, (err) => {
                    if(!err) {
                        tempPhotos[i].remove();
                    }
                });
			}
		}
	});
}, {
	scheduled: true,
    timezone: "Etc/UTC"
});

task.start();