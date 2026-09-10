import {
  columnColors,
  columnColorsOpacity,
  neonColors,
} from "../constants/color";
import { ColumnProps } from "../types";
import CardItem from "./Card";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import React from "react";
import { FaCirclePlus } from "react-icons/fa6";
import CreateEditCard from "./CreateEditCard";
import useCreateEditCard from "../hooks/useCreateEditCard";

const Column = ({ column, cards, index, active, users }: ColumnProps) => {
  const color = columnColors[index];
  const lightColor = columnColorsOpacity[index];
  const createEdit = useCreateEditCard(users);
  const { isNew, toggleNewCard } = createEdit;

  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });
  const getColorFromId = (id: string) => {
    const index = parseInt(id, 10) % neonColors.length;
    return neonColors[index];
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        flex: 1,
        height: "100%",
        padding: 10,
        borderWidth: 3,
        borderStyle: "solid",
        borderColor: color,
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        backgroundColor: isOver ? lightColor : "transparent",
      }}
    >
      <div
        style={{
          display: "flex",
          flex: 1,
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ color: color, flex: 9 }}>{column.title}</h2>
        {column.title === "Todo" && (
          <div>
            <FaCirclePlus size={20} color={color} onClick={toggleNewCard} />
          </div>
        )}
      </div>
      <SortableContext
        items={column.cardIds}
        strategy={verticalListSortingStrategy}
      >
        {column.cardIds
          .filter(
            (id) => !active.length || active.includes(cards[id]?.assignedTo),
          )
          .map((id) => (
            <CardItem
              id={id}
              key={id}
              card={cards[id]}
              color={getColorFromId(id)}
            />
          ))}
        {isNew && <CreateEditCard {...createEdit} />}
      </SortableContext>
    </div>
  );
};

export default React.memo(Column);
