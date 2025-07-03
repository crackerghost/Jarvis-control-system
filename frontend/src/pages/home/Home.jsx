import React from "react";
import WhisperMic from "../../components/Whisper";
import Sidebar from "../../components/sidebar/Sidebar";
import DeviceMenu from "../../components/devices/DeviceMenu";
import Mydevice from "../../components/mydevices/Mydevice";

function Home() {
  return (
    <div className="bg-[#000] h-screen w-screen flex justify-between">
      <Sidebar />
      <div className="w-full h-full py-12 overflow-y-auto text-white">
        <h2 className="text-4xl font-bold mb-4 px-4">Dashboard</h2>
        <DeviceMenu />
        <Mydevice />
        <WhisperMic/>
      </div>
    </div>
  );
}

export default Home;
