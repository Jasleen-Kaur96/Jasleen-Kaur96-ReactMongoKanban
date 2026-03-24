import { DndContext, DragOverlay } from "@dnd-kit/core";
import Board from "./components/Board";
import { useBoard } from "./hooks/useBoard";
import CardItem from "./components/Card";

function App() {
  const { board, activeId, handleDragStart, handleDragOver, handleDragEnd } = useBoard();
    if (!board) return <div>Loading...</div>;
  return (
    <div
      style={{
        height: "100%",
        padding: 20, 
        backgroundColor: "rgb(16,22,62)",
      }}
    >
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <Board board={board} />
        <DragOverlay>
          {activeId ? (
            <CardItem
              cardStyle={{
                boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
                transform: "scale(1.05)",
              }}
              id={activeId}
              card={board.cards[activeId]}
              color={"#fff"}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default App;
