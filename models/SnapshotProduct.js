const mongoose = require("mongoose");

const stockSnapshotSchema = new mongoose.Schema({
    data: {
        type: Object, // store full JSON here
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("StockSnapshotProduct", stockSnapshotSchema);