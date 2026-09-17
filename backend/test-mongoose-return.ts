import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const schema = new mongoose.Schema({ count: Number });
const Model = mongoose.model("TestCount3", schema);

async function run() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  const doc = await Model.create({ count: 1 });
  
  const updated1 = await Model.findOneAndUpdate(
    { _id: doc._id },
    [{ $set: { count: { $add: ["$count", 1] } } }] as any,
    { new: true, returnDocument: "after" }
  );
  console.log("With new: true:", updated1?.count); // Expected: 2

  await mongoose.disconnect();
  await mongoServer.stop();
}
run().catch(console.error);
