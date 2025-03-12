import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { FaMapLocationDot, FaPhone } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";

const Contact = () => {
  const position = [50.0681, 14.4459];

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-[80%] sm:w-full flex flex-col items-center bg-black/70 rounded-md shadow-lg shadow-red-800 min-h-screen my-20 sm:my-0">
        <div className="w-[60rem] h-[30rem] sm:w-[40rem] sm:h-[20rem] mt-20 z-0">
          <MapContainer
            className="w-full h-full text-black rounded-lg"
            center={position}
            zoom={16}
            scrollWheelZoom={false}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position}>
              <Popup>Steelchefs</Popup>
            </Marker>
          </MapContainer>
        </div>
        <div className="flex flex-col mt-10 text-[3.5rem] md:text-[2.8rem] sm:text-[2.2rem]">
          <p className="flex items-center [&>*]:mx-2">
            <FaMapLocationDot /> <span>Vinohradská 194/105, Prague 10, 130 00, Czech Republic</span>
          </p>
          <p className="flex items-center [&>*]:mx-2">
            <MdEmail /> <span>info@steelchefs.cz</span>
          </p>
          <p className="flex items-center [&>*]:mx-2">
            <FaPhone /> <span>+420 889 123 105</span>
          </p>
          <div className="flex flex-col items-center my-20">
            <h1 className="font-bold underline">Opening hours:</h1>
            <p>Mon-Fri: 7:00 - 21:00</p>
            <p>Sat-Sun: 7:00 - 19:00</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
