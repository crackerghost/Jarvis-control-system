import React from "react";

const devices = [
  { title: "Living Room", desc: "Control your living room devices" },
  { title: "Kitchen", desc: "Manage kitchen appliances" },
  { title: "Bedroom", desc: "Control bedroom lights and devices" },
  { title: "Game Room", desc: "Manage your gaming setup" },
  { title: "Office", desc: "Control office devices" },
  { title: "Bathroom", desc: "Bathroom automation" },
];

function Mydevice() {
  return (
    <div className="w-full mt-12">
      <h2 className="text-2xl font-bold mb-4 px-4">My Devices</h2>
      <div className="grid grid-cols-3 gap-0 mx-4">
        {devices.map((device, idx) => (
          <div
            key={idx}
            className={`border-b border-r p-4 border-gray-600`}
            style={{
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <h3 className="text-xl font-semibold mb-2">{device.title}</h3>
            <p className="text-gray-400">{device.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Mydevice;
