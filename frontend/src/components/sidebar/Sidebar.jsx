import React from "react";
import { BrainCircuit, Info, LayoutDashboard, Settings } from "lucide-react";
function Sidebar() {
  return (
    <div className="w-64 h-full ">
      <div className=" text-white h-full p-4">
        <div className="flex items-center gap-2 mb-6 p-4">
          <BrainCircuit className="w-10 h-10" />
          <h2 className="text-xl font-bold">Jarvis Control</h2>
        </div>

        <ul className="space-y-4 p-4">
          <li className="hover:bg-white hover:text-black rounded-xl p-2 flex text-gray-500 items-center gap-2">
            <LayoutDashboard />
             Dashboard
          </li>
          <li className="hover:bg-white hover:text-black rounded-xl p-2 flex text-gray-500  items-center gap-2">
            <Settings />
            Settings
          </li>
          {/* <li className="hover:bg-gray-700 p-2 rounded">Commands</li> */}
          <li className="hover:bg-white hover:text-black rounded-xl p-2 flex text-gray-500  items-center gap-2">
            <Info />
            About
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
