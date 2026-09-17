import mongoose from 'mongoose';
import { Schema, model } from "mongoose";

const cartItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const cartSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, unique: true },
  items: { type: [cartItemSchema], default: [] },
});

const Cart = model("Cart", cartSchema);

async function run() {
  await mongoose.connect('mongodb://localhost:27017/test-cart-race');
  await Cart.deleteMany({});
  
  const userId = new mongoose.Types.ObjectId();
  const productId = new mongoose.Types.ObjectId();
  
  await Cart.create({
    userId,
    items: [{ productId, quantity: 900 }]
  });
  
  const quantity = 200;
  
  const incremented = await Cart.findOneAndUpdate(
    { userId, "items.productId": productId },
    [
      {
        $set: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $cond: [
                  { $eq: ["$$item.productId", new mongoose.Types.ObjectId(productId)] },
                  {
                    $mergeObjects: [
                      "$$item",
                      {
                        quantity: {
                          $min: [
                            1000,
                            { $add: ["$$item.quantity", quantity] }
                          ]
                        }
                      }
                    ]
                  },
                  "$$item"
                ]
              }
            }
          }
        }
      }
    ],
    { new: true, lean: true }
  );
  
  console.log(JSON.stringify(incremented?.items, null, 2));
  
  await mongoose.disconnect();
}

run().catch(console.error);
