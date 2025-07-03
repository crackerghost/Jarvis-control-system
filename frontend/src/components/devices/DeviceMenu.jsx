import React from "react";

function DeviceMenu() {
  return (
    <div className="w-full text-white mt-12">
      <ul className="flex gap-2">
        <li className="p-2 hover:bg-white hover:text-black rounded-xl cursor-pointer text-center w-[120px]">
          Living Room
        </li>
        <li className="p-2 hover:bg-white hover:text-black rounded-xl cursor-pointer text-center w-[120px]">
          Kitchen Room
        </li>
        <li className="p-2 hover:bg-white hover:text-black rounded-xl cursor-pointer text-center w-[120px]">
          Game Room
        </li>
        <li className="p-2 hover:bg-white hover:text-black rounded-xl cursor-pointer text-center w-[120px]">
          Bed Room
        </li>
        <li className="p-2 hover:bg-white hover:text-black rounded-xl cursor-pointer text-center w-[120px]">
          + Add
        </li>
      </ul>
    </div>
  );
}

export default DeviceMenu;
