import mongoose, { Schema, Document } from "mongoose";

export interface IFAQ extends Document {
  questionEn: string;
  questionAr: string;
  answerEn: string;
  answerAr: string;
  /** @deprecated legacy monolingual fields — kept for migration reads */
  question?: string;
  answer?: string;
  category: string;
  status: "draft" | "published";
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const FAQSchema = new Schema<IFAQ>(
  {
    questionEn: { type: String, required: true },
    questionAr: { type: String, required: true },
    answerEn: { type: String, required: true },
    answerAr: { type: String, required: true },
    question: { type: String },
    answer: { type: String },
    category: { type: String, required: true, default: "General" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const FAQ = mongoose.model<IFAQ>("FAQ", FAQSchema);

/** Normalize a FAQ doc for clients, including legacy monolingual records. */
export function localizeFaq(
  faq: Record<string, unknown>,
  lang: "en" | "ar" = "en"
) {
  const questionEn = (faq.questionEn as string) || (faq.question as string) || "";
  const questionAr = (faq.questionAr as string) || questionEn;
  const answerEn = (faq.answerEn as string) || (faq.answer as string) || "";
  const answerAr = (faq.answerAr as string) || answerEn;

  return {
    ...faq,
    questionEn,
    questionAr,
    answerEn,
    answerAr,
    question: lang === "ar" ? questionAr : questionEn,
    answer: lang === "ar" ? answerAr : answerEn,
  };
}
