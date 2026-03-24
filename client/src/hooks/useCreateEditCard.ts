import { useState } from "react";
import { socket } from "../socket";

const useCreateEditCard =()=>{
    const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isNew, setIsNew] = useState(false);
  const toggleNewCard = () => setIsNew((prev)=>!prev);
    const createNewTask = () => {
    socket.emit("card:create", {
      card: {
        id: Date.now().toString(),
        title: title,
        description: description,
        assignedTo: "69c1260802c6432e0d62f3fc",
      },
      columnId: "todo",
    });
    toggleNewCard();
    setTitle('');
    setDescription('');
  };
  return{
    isNew,
    title,
    setTitle,
    description,
    setDescription,
    createNewTask,
    toggleNewCard
  }
}

export default useCreateEditCard;