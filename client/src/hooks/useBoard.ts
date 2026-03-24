import { useEffect, useState } from "react";
import { socket } from "../socket";
import { BoardState, Column } from "../types";

export function useBoard() {
  const defaultBoardState = {
    cards: {},
    columns: {
      todo: { id: "todo", title: "Todo", cardIds: [] },
      inProgress: { id: "inProgress", title: "In Progress", cardIds: [] },
      done: { id: "done", title: "Done", cardIds: [] },
    },
    columnOrder: ["todo", "inProgress", "done"],
  };
  const [board, setBoard] = useState<BoardState>(defaultBoardState);
  const [activeId, setActiveId] = useState<string | null>(null);
   const [sourceId, setSourceId] = useState<string | undefined>();

  useEffect(() => {
    // initial load
    socket.on("board:init", (data: BoardState) => {
      console.log("📥 board:init", data);
      setBoard(data);
    });
    socket.on("connect", () => {
      console.log("✅ connected to server", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ disconnected");
    });

    // updates from other users

    socket.on("card:create", (payload) => {
      setBoard((prev) => {
        if (!prev) return prev;

        const { card, columnId } = payload;

        return {
          ...prev,
          cards: {
            ...prev.cards,
            [card.id]: card,
          },
          columns: {
            ...prev.columns,
            [columnId]: {
              ...prev.columns[columnId],
              cardIds: Array.from(
                new Set([...prev.columns[columnId].cardIds, card.id]),
              ),
            },
          },
        };
      });
    });

    socket.on("card:update", (payload) => {
      setBoard((prev) => {
        if (!prev) return prev;

        const { cardId, updates } = payload;

        return {
          ...prev,
          cards: {
            ...prev.cards,
            [cardId]: {
              ...prev.cards[cardId],
              ...updates,
            },
          },
        };
      });
    });

    socket.on("card:delete", (payload) => {
      setBoard((prev) => {
        if (!prev) return prev;

        const { cardId, columnId } = payload;

        const newCards = { ...prev.cards };
        delete newCards[cardId];

        return {
          ...prev,
          cards: newCards,
          columns: {
            ...prev.columns,
            [columnId]: {
              ...prev.columns[columnId],
              cardIds: prev.columns[columnId].cardIds.filter(
                (id) => id !== cardId,
              ),
            },
          },
        };
      });
    });
    socket.on("card:move", ({ cardId, sourceColId, destColId, destIndex, senderId }) => {
      if (senderId === socket.id) return;
      setBoard((prev) => {
        if (!prev) return prev;

        const sourceItems = [...prev.columns[sourceColId].cardIds];
        const destItems =
          sourceColId === destColId
            ? sourceItems
            : [...prev.columns[destColId].cardIds];

        const filtered = sourceItems.filter((id) => id !== cardId);

        if (sourceColId === destColId) {
          filtered.splice(destIndex, 0, cardId);

          return {
            ...prev,
            columns: {
              ...prev.columns,
              [sourceColId]: {
                ...prev.columns[sourceColId],
                cardIds: filtered,
              },
            },
          };
        }

        // cross column
        destItems.splice(destIndex, 0, cardId);

        return {
          ...prev,
          columns: {
            ...prev.columns,
            [sourceColId]: {
              ...prev.columns[sourceColId],
              cardIds: filtered,
            },
            [destColId]: {
              ...prev.columns[destColId],
              cardIds: destItems,
            },
          },
        };
      });
    });

    return () => {
      socket.off("board:init");
      socket.off("card:create");
      socket.off("card:update");
      socket.off("card:delete");
      socket.off("card:move");
    };
  }, []);

  const findColumn = (board: BoardState, cardId: string) => {
    return Object.values(board.columns).find((col: Column) =>
      col.cardIds.includes(cardId),
    );
  };
  const handleDragStart = (event: any) => {
    const sourceCol = findColumn(board, event.active.id);
    setSourceId(sourceCol?.id);
    setActiveId(event.active.id);
  };
 
  const handleDragEnd = (event: any) => {
  setActiveId(null);

  const { active, over } = event;
  if (!over) return;

  const cardId = active.id;

  setBoard((prev) => {
    const sourceCol = findColumn(prev, cardId);
    if (!sourceCol) return prev;

    let destCol: Column | undefined;
    let destIndex = 0;

    // dropping on column
    if (over.id in prev.columns) {
      destCol = prev.columns[over.id];
      destIndex = destCol.cardIds.length;
    } else {
      destCol = findColumn(prev, over.id);
      if (!destCol) return prev;
      destIndex = destCol.cardIds.indexOf(over.id);
    }

    if (!destCol) return prev;

    const sourceItems = [...sourceCol.cardIds];
    const destItems =
      sourceCol.id === destCol.id
        ? sourceItems
        : [...destCol.cardIds];

    // remove from source
    const sourceIndex = sourceItems.indexOf(cardId);
    sourceItems.splice(sourceIndex, 1);

    if (sourceCol.id === destCol.id) {
      destItems.splice(destIndex, 0, cardId);
    } else {
      destItems.splice(destIndex, 0, cardId);
    }

    return {
      ...prev,
      columns: {
        ...prev.columns,
        [sourceCol.id]: {
          ...sourceCol,
          cardIds: sourceItems,
        },
        [destCol.id]: {
          ...destCol,
          cardIds: destItems,
        },
      },
    };
  });

  let destColId;
  let destIndex;

  if (over.id in board.columns) {
    destColId = over.id;
    destIndex = board.columns[destColId].cardIds.length;
  } else {
    const destCol = findColumn(board, over.id);
    if (!destCol) return;
    destColId = destCol.id;
    destIndex = destCol.cardIds.indexOf(over.id);
  }

  console.log("emit to server",{
    cardId,
    sourceColId: sourceId,
    destColId,
    destIndex,
  })
  socket.emit("card:move", {
    cardId,
    sourceColId: sourceId,
    destColId,
    destIndex,
     senderId: socket.id,
  });
};

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    if (!over) return;
    setBoard((prev) => {
      const sourceCol = findColumn(prev, active.id);
      let destCol: Column | undefined;
      if (over.id in prev.columns) {
        destCol = prev.columns[over.id];
      } else {
        destCol = findColumn(prev, over.id);
      }
      if (!sourceCol || !destCol) return prev; // Only handle cross-column preview
      if (sourceCol.id !== destCol.id) {
        const sourceItems = [...sourceCol.cardIds];
        const destItems = [...destCol.cardIds];
        const sourceIndex = sourceItems.indexOf(active.id);
        sourceItems.splice(sourceIndex, 1);

        if (destItems.includes(active.id)) return prev;
        let destIndex;

        // 👉 dropping on column (empty space)
        if (over.id in prev.columns) {
          destIndex = 0;
        } else {
          destIndex = destItems.indexOf(over.id);
        }

        destItems.splice(destIndex, 0, active.id);

        return {
          ...prev,
          columns: {
            ...prev.columns,
            [sourceCol.id]: {
              ...sourceCol,
              cardIds: sourceItems,
            },
            [destCol.id]: {
              ...destCol,
              cardIds: destItems,
            },
          },
        };
      }
      return prev;
    });
  };

  return {
    board,
    setBoard,
    activeId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
