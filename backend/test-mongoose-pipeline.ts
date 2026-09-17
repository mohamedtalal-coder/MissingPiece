import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const schema = new mongoose.Schema({ count: Number });
const Model = mongoose.model("TestCount4", schema);

async function run() {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  
  const doc = await Model.create({ count: 1 });
  
  try {
    const updated1 = await Model.findOneAndUpdate(
      { _id: doc._id },
      [{ $set: { count: { $add: ["$count", 1] } } }] as any,
      { returnDocument: "after", updatePipeline: true }
    );
    console.log("With updatePipeline: true, returnDocument: 'after':", updated1?.count); // Expected: 2
  } catch (err: any) {
    console.error("Error 1:", err.message);
  }

  try {
    const updated2 = await Model.findOneAndUpdate(
      { _id: doc._id },
      [{ $set: { count: { $add: ["$count", 1] } } }] as any,
      { new: true, returnDocument: "after", updatePipeline: true }
    );
    console.log("With new: true, updatePipeline: true:", updated2?.count); // Expected: 3
  } catch (err: any) {
    console.error("Error 2:", err.message);
  }

  await mongoose.disconnect();
  await mongoServer.stop();
}
run().catch(console.error);
