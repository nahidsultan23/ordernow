const mongoose = require('mongoose');
const geoCoordinateSchema = require('./geoCoordinateSchema');

const schema = mongoose.Schema;

const restaurantSchema = new schema({
    ownerID: {
        type: String,
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    isPayFirst: {
        type: Boolean,
        default: false
    },
    governmentCharge: {
        type: Number,
        default: 0
    },
    governmentChargeDescription: {
        type: String
    },
    governmentChargeRegNo: {
        type: String
    },
    serviceCharge: {
        type: Number,
        default: 0
    },
    serviceChargeDescription: {
        type: String
    },
    phoneNumber: {
        type: [String],
        required: true
    },
    email: {
        type: [String]
    },
    lat: {
        type: Number,
        required: true
    },
    long: {
        type: Number,
        required: true
    },
    latRad: {
        type: Number,
        required: true
    },
    longRad: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    coordinate: {
        type: geoCoordinateSchema,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    instruction: {
        type: String
    },
    openingHours: {
        type: {
            everyday: {
                from: String,
                to: String
            },
            sunday: {
                from: String,
                to: String
            },
            monday: {
                from: String,
                to: String
            },
            tuesday: {
                from: String,
                to: String
            },
            wednesday: {
                from: String,
                to: String
            },
            thursday: {
                from: String,
                to: String
            },
            friday: {
                from: String,
                to: String
            },
            saturday: {
                from: String,
                to: String
            }
        },
        required: true
    },
    isMidBreakApplicable: {
        type: Boolean,
        default: false
    },
    midBreaks: {
        type: {
            sunday: {
                from: String,
                to: String
            },
            monday: {
                from: String,
                to: String
            },
            tuesday: {
                from: String,
                to: String
            },
            wednesday: {
                from: String,
                to: String
            },
            thursday: {
                from: String,
                to: String
            },
            friday: {
                from: String,
                to: String
            },
            saturday: {
                from: String,
                to: String
            },
            everyday: {
                from: String,
                to: String
            }
        }
    },
    tableID: {
        type: [String]
    },
    associates: {
        type: [String]
    },
    discountCoupon: {
        type: [Object]
    },
    paymentMethod: {
        type: [Object],
        required: true
    },
    paymentMessage: {
        type: String,
        required: true
    },
    serviceMessage: {
        type: String,
        required: true
    },
    activeStatus: {
        type: Boolean,
        default: true
    },
    decimalRounding: {
        type: Boolean,
        default: true
    },
    lastPingTime: {
        type: Date,
        default: Date.now
    },
    logo: {
        type: String
    },
    banner: {
        type: String
    },
    photo: {
        type: [String]
    },
    createdOn: {
        type: Date
    },
    updatedOn: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    avgRating: {
        type: Number,
        default: 0
    },
    ratings: {
        type: [
            {
                userID: String,
                rating: Number,
                orderID: String,
                time: Date
            }
        ]
    },
    numberOfRatings: {
        type: Number,
        default: 0
    },
    comments: {
        type: [
            {
                commentID: Number,
                userID: String,
                userName: String,
                rating: Number,
                comment: String,
                orderID: String,
                time: Date,
                replies: [
                    {
                        userID: String,
                        userName: String,
                        reply: String,
                        time: Date
                    }
                ]
            }
        ]
    }
});

restaurantSchema.index({coordinate: "2dsphere"});
const restaurantModel = mongoose.model('restaurants',restaurantSchema,'restaurants');

module.exports = restaurantModel;