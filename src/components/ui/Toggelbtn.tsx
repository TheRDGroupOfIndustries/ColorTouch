import React, { useState } from "react";

const ToggleBtn = () => {
  const [isActive, setIsActive] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => setIsActive(!isActive)}
        className={`w-14 h-7 flex items-center rounded-full p-1 transition-all duration-300 ${
          isActive ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`h-5 w-5 bg-white rounded-full shadow-md transform transition-all duration-300 ${
            isActive ? "translate-x-7" : ""
          }`}
        ></div>
      </button>

       
    </div>
  );
};

export default ToggleBtn;
