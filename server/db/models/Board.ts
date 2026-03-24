import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
  data: {
    type: Object,
    required: true,
    default: {
      cards: {
        type: Map,
        of: new mongoose.Schema({
          id: String,
          title: String,
          description: String,
          assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
        }),
      },
      columns: {},
      columnOrder: [],
    },
  },
});

export const BoardModel = mongoose.model("Board", boardSchema);
