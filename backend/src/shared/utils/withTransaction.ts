import mongoose from "mongoose";
import type { ClientSession } from "mongoose";

async function commitWithRetry(session: ClientSession) {
  try {
    await session.commitTransaction();
  } catch (error: any) {
    if (
      error.hasErrorLabel &&
      error.hasErrorLabel("UnknownTransactionCommitResult")
    ) {
      await commitWithRetry(session);
    } else {
      throw error;
    }
  }
}

export async function withTransaction<T>(
  callback: (session: ClientSession) => Promise<T>,
  maxRetries = 3
): Promise<T> {
  const session = await mongoose.startSession();

  try {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      session.startTransaction();
      try {
        const result = await callback(session);
        await commitWithRetry(session);
        return result;
      } catch (error: any) {
        await session.abortTransaction();
        if (
          error.hasErrorLabel &&
          error.hasErrorLabel("TransientTransactionError") &&
          attempt < maxRetries
        ) {
          continue;
        }
        throw error;
      }
    }
    throw new Error("Transaction failed after max retries");
  } finally {
    await session.endSession();
  }
}
