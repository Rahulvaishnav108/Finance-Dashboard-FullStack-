import mongoose, { Document, Schema } from 'mongoose';

export interface IInvoiceCounter extends Document {
  year: number;
  sequence: number;
}

const invoiceCounterSchema = new Schema<IInvoiceCounter>(
  {
    year: {
      type: Number,
      required: true,
      unique: true,
    },
    sequence: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const InvoiceCounterModel = mongoose.model<IInvoiceCounter>(
  'InvoiceCounter',
  invoiceCounterSchema
);