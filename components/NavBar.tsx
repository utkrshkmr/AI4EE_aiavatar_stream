"use client";

import Image from "next/image";

export default function NavBar() {
  return (
    <>
      <div className="flex flex-row justify-between items-center w-[1000px] m-auto p-6">
        <div className="flex flex-row items-center gap-4">
          <div className="bg-gradient-to-br from-sky-300 to-indigo-500 bg-clip-text">
            <p className="text-xl font-semibold text-transparent">
              National AI Institute for Exceptional Education - Early Literacy Interview Avatar Demo
            </p>
          </div>
        </div>
        <div className="flex flex-row items-center gap-6">
          <Image 
            src="/ai4ee_logo.png" 
            alt="AI4EE Logo" 
            width={120} 
            height={60}
            className="object-contain"
          />
        </div>
      </div>
    </>
  );
}

