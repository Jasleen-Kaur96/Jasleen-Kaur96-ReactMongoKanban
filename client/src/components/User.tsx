import React from "react";
import { neonColors } from "../constants/color";
import { UserScreenProps } from "../types";

const Users = ({ users, active, toggleActive }: UserScreenProps) => {
  return (
    <div style={{ flexDirection: "row", display: "flex" }}>
      {users.map((item, index) => {
        const color = neonColors[index];
        const {_id} = item;
        const isActive = active?.includes(_id);
        return (
          <div
            style={{
              display: "flex",
              borderRadius: "50%",
              backgroundColor: isActive? color: "transparent",
              borderWidth: isActive ? 4 : 2,
              borderStyle: "solid",
              borderColor: isActive?'white':color,
              height: 44,
              width: 44,
              boxSizing: "border-box",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
              color: isActive? 'black':color,
              fontWeight: isActive ? "bold" : "500",
            }}
            onClick={() => toggleActive(item._id)}
          >
            {item?.name.charAt(0)}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(Users);
