const mongoose = require('mongoose');

const outstandingSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    backName:{
        type:String,
        required:true,
    },
    depositedate:{
        type:String,
        

    },
    description:{
        type:String,

    },
     CHnumber:{
        type:String,
        // Not unique - same cheque number can be used multiple times
    },
    amount: {
        type: Number,
        required: true
    },
    outstanding: {
        type: Number,
        required: true
    }
   
});

const Outstanding = mongoose.model('Outstanding', outstandingSchema);

// Drop unique index on CHnumber if it exists (to allow duplicate cheque numbers)
Outstanding.collection.getIndexes().then((indexes) => {
    if (indexes.CHnumber_1 || indexes['CHnumber_1']) {
        Outstanding.collection.dropIndex('CHnumber_1').catch((err) => {
            // Index might not exist or already dropped, ignore error
            if (err.code !== 27) { // 27 = IndexNotFound
                console.log('Note: Could not drop CHnumber unique index:', err.message);
            }
        });
    }
}).catch((err) => {
    // Collection might not exist yet, ignore error
    console.log('Note: Could not check indexes:', err.message);
});

module.exports = Outstanding;

