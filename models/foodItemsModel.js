const mongoose = require('mongoose');

const schema = mongoose.Schema;

const foodItemSchema = new schema({
    restaurantID: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    options: {
        type: [Object]
    },
    description: {
        type: String
    },
    instantService: {
        type: Boolean,
        default: false
    },
    parcelAvailable: {
        type: Boolean,
        default: false
    },
    availableHours: {
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
    governmentChargeApplicable: {
        type: Boolean,
        default: false
    },
    photo: {
        type: [String]
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    isUnavailable: {
        type: Boolean,
        default: false
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

const foodItemModel = mongoose.model('food_items',foodItemSchema,'food_items');

module.exports = foodItemModel;