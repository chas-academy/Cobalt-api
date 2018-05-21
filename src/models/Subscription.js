const mongoose = require("mongoose");

const now = new Date();
let oneMonthFromNow = new Date(now.getFullYear(), now.getMonth()+1, 1);

const subscriptionSchema = mongoose.Schema({
  type: String,
  price: String,
  dateAdded: { type: Date, default: Date.now },
  expirationDate: { type: Date, default: oneMonthFromNow }
});

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

module.exports = Subscription;
