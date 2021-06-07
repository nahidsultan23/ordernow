const mongoose = require('mongoose');

const schema = mongoose.Schema;

const orderSchema = new schema({
    userID: {
        type: String,
        default: 'N/A'
    },
    userName: {
        type: String,
        default: 'N/A'
    },
    restaurantID: {
        type: String,
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    },
    tableID: {
        type: String,
        required: true
    },
    numberOfGuests: {
        type: Number,
        default: 1
    },
    associate: {
        type: String
    },
    orderDetails: {
        type: [Object],
        required: true
    },
    governmentChargePercentage: {
        type: Number
    },
    governmentChargeDescription: {
        type: String
    },
    governmentChargeRegNo: {
        type: String
    },
    serviceChargePercentage: {
        type: Number
    },
    serviceChargeDescription: {
        type: String
    },
    grossTotal: {
        type: Number,
        required: true
    },
    totalGovernmentCharge: {
        type: Number,
        required: true
    },
    serviceCharge: {
        type: Number,
        required: true
    },
    nextDiscountID: {
        type: Number,
        default: 0
    },
    discountRecord: {
        type: [Object],
        default: []
    },
    specialDiscount: {
        type: Number,
        default: 0
    },
    decimalRounding: {
        type: Number,
        default: 0
    },
    netPayable: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number
    },
    changeAmount: {
        type: Number,
        default: 0
    },
    instantService: {
        type: Boolean,
        default: false
    },
    parcel: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    currentState: {
        type: String,
        default: 'Checking restaurant status'
    },
    stateRecord: {
        type: [
            {
                state: String,
                time: Date
            }
        ],
        required: true
    },
    paymentMethod: {
        type: Object
    },
    paymentStatus: {
        type: String,
        default: 'Pending'
    },
    offlineUpdate: {
        type: Boolean,
        default: false
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    reason: {
        type: String
    },
    rating: {
        type: Boolean,
        default: false
    },
    comment: {
        type: Boolean,
        default: false
    }
});

const orderModel = mongoose.model('orders',orderSchema,'orders');

module.exports = orderModel;