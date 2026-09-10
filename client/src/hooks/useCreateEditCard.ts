import { useState } from "react";
import { socket } from "../socket";
import { UserProps } from "../types";

const useCreateEditCard = (users: UserProps[]) => {
    const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const toggleNewCard = () => setIsNew((prev)=>!prev);
    const createNewTask = () => {
    socket.emit("card:create", {
      card: {
        id: Date.now().toString(),
        title: title,
        description: description,
        assignedTo: assignedTo || users[0]?._id,
      },
      columnId: "todo",
    });
    toggleNewCard();
    setTitle('');
    setDescription('');
    setAssignedTo('');
  };
  return{
    isNew,
    title,
    setTitle,
    description,
    setDescription,
    assignedTo,
    setAssignedTo,
    users,
    createNewTask,
    toggleNewCard
  }
}

export default useCreateEditCard;