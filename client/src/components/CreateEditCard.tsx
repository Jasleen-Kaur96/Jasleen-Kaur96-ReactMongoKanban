import { neonColors } from "../constants/color";
import { CSSProperties } from "react";
import { IoCloseCircle } from "react-icons/io5";
import { IoCheckmarkCircle } from "react-icons/io5";
import TextInput from "./TextInput";
import { CreateEditCardProps } from "../types";

const CreateEditCard = ({
  title,
  description,
  setTitle,
  setDescription,
  assignedTo,
  setAssignedTo,
  users,
  createNewTask,
  toggleNewCard,
}: CreateEditCardProps) => {
  const color = neonColors[0];
  const style: CSSProperties = {
    padding: 8,
    marginBottom: 8,
    borderWidth: 2,
    color: color,
    borderStyle: "solid",
    borderColor: color,
    borderRadius: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  };

  return (
    <div style={style}>
      <div style={{ display: "flex", width: "80%", flexDirection: "column" }}>
        <TextInput
          largeText={true}
          color={color}
          value={title}
          setValue={setTitle}
        />
        <TextInput
          largeText={false}
          color={color}
          value={description}
          setValue={setDescription}
        />
        <select
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          style={{ backgroundColor: "transparent", color, marginTop: 5 }}
        >
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "flex" }}>
        {title && description ? (
          <IoCheckmarkCircle size={20} onClick={createNewTask} />
        ) : (
          <IoCloseCircle size={20} onClick={toggleNewCard} />
        )}
      </div>
    </div>
  );
};

export default CreateEditCard;
