import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { BoardModel } from "./db/models/Board";
import { connectDB } from "./db/db";
import { CreateCardPayload, DeleteCardPayload, UpdateCardPayload } from "./types";
import { UserModel } from "./db/models/User";

const app = express();
app.use(cors());

app.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const initBoard = async () => {
  let board = await BoardModel.findOne();

  if (!board) {
    board = await BoardModel.create({
      data: {
        cards: {},
        columns: {
          todo: { id: "todo", title: "Todo", cardIds: []},
          inProgress: { id: "inProgress", title: "In Progress", cardIds: [] },
          done: { id: "done", title: "Done", cardIds: [] },
        },
        columnOrder: ["todo", "inProgress", "done"],
      },
    });
  }

};

// 🔌 Socket connection
io.on("connection", async(socket) => {
  console.log("User connected:", socket.id);

  const board = await BoardModel.findOne();
  socket.emit("board:init", board?.data);
  // CREATE CARD
  socket.on("card:create", async (payload: CreateCardPayload) => {
    const { card, columnId } = payload;

    const board = await BoardModel.findOne();
    if (!board) return;

    const data = board.data as any;
    if (!data.cards) {
  data.cards = {};
}
    data.cards[card.id] = card;
    data.columns[columnId].cardIds.push(card.id);

    await BoardModel.updateOne({ _id: board._id }, { data });

    io.emit("card:create", payload); // send to all clients
  });

  // UPDATE CARD
  socket.on("card:update", async (payload: UpdateCardPayload) => {
    const { cardId, updates } = payload;

    const board = await BoardModel.findOne();
    if (!board) return;

    const data = board.data as any;

    data.cards[cardId] = {
      ...data.cards[cardId],
      ...updates,
    };

    await BoardModel.updateOne({ _id: board._id }, { data });

    io.emit("card:update", payload);
  });

  // DELETE CARD
  socket.on("card:delete", async (payload: DeleteCardPayload) => {
    const { cardId, columnId } = payload;

    const board = await BoardModel.findOne();
    if (!board) return;

    const data = board.data as any;

    delete data.cards[cardId];

    data.columns[columnId].cardIds =
      data.columns[columnId].cardIds.filter((id: string) => id !== cardId);

    await BoardModel.updateOne({ _id: board._id }, { data });

    io.emit("card:delete", payload);
  });

 socket.on("card:move", async ({ cardId, sourceColId, destColId, destIndex, senderId }) => {
  const board = await BoardModel.findOne();
  if (!board) return;

  const data = board.data as any;

  // SAME COLUMN (reorder)
  if (sourceColId === destColId) {
    const items = [...data.columns[sourceColId].cardIds];

    const oldIndex = items.indexOf(cardId);
    if (oldIndex === -1) return;

    items.splice(oldIndex, 1);
    items.splice(destIndex, 0, cardId);

    data.columns[sourceColId].cardIds = items;
  } else {
    // CROSS COLUMN
    const sourceItems = data.columns[sourceColId].cardIds.filter(
      (id: string) => id !== cardId
    );
    const destItems = [...data.columns[destColId].cardIds];
    destItems.splice(destIndex, 0, cardId);

    data.columns[sourceColId].cardIds = sourceItems;
    data.columns[destColId].cardIds = destItems;
  }

  await BoardModel.updateOne(
    { _id: board._id },
    { data }
  );

  io.emit("card:move", { cardId, sourceColId, destColId, destIndex, senderId });
});
});

const startServer = async () => {
  await connectDB();
  await seedUsers();
  await initBoard();

  server.listen(4000, () => {
    console.log("Server running on http://localhost:4000");
  });
};

startServer();

const seedUsers = async () => {
  const existingUsers = await UserModel.find();

  if (existingUsers.length === 0) {
    await UserModel.create([
      { name: "Jasleen", email: "jasleen@test.com" },
      { name: "Abc", email: "abc@test.com" },
      { name: "Xyz", email: "xyz@test.com" },
    ]);
  }
};