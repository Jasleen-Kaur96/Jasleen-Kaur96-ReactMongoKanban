import { memo, Dispatch, SetStateAction } from "react";

const TextInput = ({largeText,color,value,setValue}:{largeText:boolean,color:string,value: string, setValue:Dispatch<SetStateAction<string>>}) => {
    return (
      <input
        style={{
          backgroundColor: "transparent",
          marginBottom: 5,
          borderWidth: 0,
          borderStyle: "solid",
          borderBottomWidth:1,
          display:'flex',
          color: color,
          fontSize:largeText?16:14
        }}
        value={value}
        onChange={(e)=>setValue(e.target.value)}
      />
    );
  };

  export default memo(TextInput);