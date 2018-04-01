// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('Review', new Schema({ 
    name: {
        type: String,
        required: [true, 'name must be provided']
    }, 
    title: {
        type: String,
        required: [true, 'title must be provided']
    }, 
    quote: {
        type: String,
        required: [true, 'quote must be provided']
    },
    rating: {
        type: String,
        required: [true, 'rating must be provided']
    } 
}));