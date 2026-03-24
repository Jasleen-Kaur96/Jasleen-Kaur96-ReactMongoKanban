import { useUsers } from "../hooks/useUsers";
import { BoardState } from "../types";
import Column from "./Column";
import User from "./User";

const Board = ({ board }: { board: BoardState }) => {
  const userState = useUsers();
  return (
    <div style={{ display: "flex", gap: 16, flex: 1, flexDirection: "column" }}>
      <User {...userState}/>
      <div style={{ display: "flex", flex: 1, flexDirection: "row", gap: 16 }}>
        {board.columnOrder.map((colId, index) => {
          const column = board.columns[colId];
          return (
            <Column
              index={index}
              key={column.id}
              column={column}
              active={userState.active}
              cards={board.cards}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Board;
