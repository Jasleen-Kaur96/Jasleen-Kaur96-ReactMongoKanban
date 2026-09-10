import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
  data: {
    type: Object,
    required: true,
    default: {
      cards: {},
      columns: {},
      columnOrder: [],
    },
  },
});

export const BoardModel = mongoose.model("Board", boardSchema);
