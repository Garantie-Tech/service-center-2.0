"use client";

import Image from "next/image";
import React from "react";

const LoginFormLeftSection: React.FC = () => {
  return (
    <div
      className="hidden md:flex flex-col justify-center items-start w-1/2 bg-cover bg-center p-[80px] text-white"
      style={{
        backgroundImage: "url(/images/service-center-login-bg.svg)",
      }}
    >
      <h2 className="text-3xl font-bold mb-4">Safety Verification</h2>
      <p className="text-lg mb-6">
        For safety concerns, we need to validate your login credentials
      </p>

      {/* Image */}
      <Image
        src="/images/form-left-image.svg"
        alt="Dashboard preview"
        width={800}
        height={200}
        className="w-full"
      />

      {/* Contact Details */}
      <div className="flex justify-center items-start py-8 w-full">
        <div className="w-1/2">
          <p className="text-sm font-medium">For claim-related queries</p>
          <p className="mt-2 text-sm flex">
            <Image
              src="/images/mail-icon.svg"
              alt="Dashboard preview"
              width={25}
              height={25}
              className="pr-2"
            />
            <a href="mailto:claims.mobile@garantie.in" className="underline">
              Claims.mobile@garantie.in
            </a>
          </p>
          <p className="text-sm flex">
            <Image
              src="/images/phone-icon.svg"
              alt="Dashboard preview"
              width={25}
              height={25}
              className="pr-2"
            />
            <a href="tel:+918800502077" className="underline">
              +91 8800502077
            </a> / 
            <a href="tel:+919650604181" className="underline">
              9650604181
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="w-1/2">
          <p className="text-sm">For any other query</p>
          <p className="text-sm font-semibold flex">
            <Image
              src="/images/phone-icon.svg"
              alt="Dashboard preview"
              width={25}
              height={25}
              className="pr-2"
            />
            +91 9871115834
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginFormLeftSection;
