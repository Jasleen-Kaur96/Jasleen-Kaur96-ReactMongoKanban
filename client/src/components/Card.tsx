import React from "react";
import { Card } from "../types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const CardItem=({ id, card, color,cardStyle }: { id: string; card: Card; color: string, cardStyle?:any }) =>{
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: 8,
    marginBottom: 8,
    borderWidth: 2,
    color: color,
    borderStyle: "solid",
    borderColor: color,
    borderRadius: 10,
    opacity: isDragging ? 0 : 1,
  };
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={cardStyle ? { ...style, ...cardStyle } : style}>
      {card.title}
      {card.description && 
        <p
          style={{
            marginTop: 4,
            marginBottom: 0,
            fontSize: 14,
            fontFamily: "Arial, sans-serif",
          }}
        >
          {card.description}
        </p>
      }
    </div>
  );
}

export default React.memo(CardItem);