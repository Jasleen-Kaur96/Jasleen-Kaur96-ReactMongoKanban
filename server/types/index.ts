export type CreateCardPayload = {
  card: {
    id: string;
    title: string;
    description?: string;
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