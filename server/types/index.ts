export type Card = {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
};

export type BoardColumn = {
  id: string;
  title: string;
  cardIds: string[];
};

export type BoardState = {
  cards: Record<string, Card>;
  columns: Record<string, BoardColumn>;
  columnOrder: string[];
};

export type CreateCardPayload = {
  card: {
    id: string;
    title: string;
    description?: string;
    assignedTo?: string;
  };
  columnId: string;
};

export type UpdateCardPayload = {
  cardId: string;
  updates: {
    title?: string;
    description?: string;
  };
};

export type DeleteCardPayload = {
  cardId: string;
  columnId: string;
};