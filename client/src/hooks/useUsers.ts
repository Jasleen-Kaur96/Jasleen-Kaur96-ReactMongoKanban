import { useEffect, useState } from "react";
import { UserProps } from "../types";

export function useUsers() {
  const [users, setUsers] = useState<UserProps[]>([]);
  const [active, setActive] = useState<String[]>([]);
  useEffect(() => {
    fetch("http://localhost:4000/users")
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  useEffect(()=>{
    const activeUsers = users.map((e)=>e._id)
    setActive(activeUsers)
  },[users])

  const toggleActive = (id: string) => {
  const activeUsers = [...active];

  const index = activeUsers.indexOf(id);

  if (index !== -1) {
    activeUsers.splice(index, 1);
  } else {
    activeUsers.push(id);
  }

  setActive(activeUsers);
};
  return {
    users,
    active,
    toggleActive
  };
}
