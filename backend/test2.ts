import mongoose from "mongoose";

const schema = new mongoose.Schema({ count: Number });
const Model = mongoose.model("TestCount", schema);

async function run() {
  await mongoose.connect('mongodb://localhost:27017/test-cart-race');
  await Model.deleteMany({});
  
  const doc = await Model.create({ count: 1 });
  
  const updated = await Model.findOneAndUpdate(
    { _id: doc._id },
    [{ $set: { count: { $add: ["$count", 1] } } }],
    { new: true }
  );
  console.log(updated);
  await mongoose.disconnect();
}
run().catch(console.error);
