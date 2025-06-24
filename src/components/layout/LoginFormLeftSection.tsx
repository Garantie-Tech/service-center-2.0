"use client";

import Image from "next/image";
import React from "react";

const LoginFormLeftSection: React.FC = () => {
  return (
    <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-cover bg-center p-[80px] text-white bg-[#3C63FC]">
      <h2 className="text-xxl font-bold">Safety Verification</h2>
      <p className="text-[20px] mb-6 text-center">
        For safety concerns, we need to validate your login credentials
      </p>

      {/* Image */}
      <Image
        src="/images/login-left-image.svg"
        alt="Dashboard preview"
        width={170}
        height={250}
        className="text-center my-[40px]"
      />

      {/* Contact Details */}
      <div className="py-8 text-center">
        <div className="w-full">
          <p className="text-base">For claim-related queries</p>
          <p className="mt-2 text-[20px] font-semibold flex justify-center">
            <Image
              src="/images/mail-icon.svg"
              alt="Dashboard preview"
              width={40}
              height={40}
              className="pr-2"
            />
            <a href="mailto:claims.mobile@garantie.in">
              Claims.mobile@garantie.in
            </a>
          </p>
          <p className="text-[20px] flex justify-center font-semibold">
            <Image
              src="/images/phone-icon.svg"
              alt="Dashboard preview"
              width={40}
              height={40}
              className="pr-2"
            />
            <a href="tel:+918800502077">+91 9667 866 866</a>
          </p>
        </div>

        <Image
          src="/images/line.svg"
          alt="Dashboard preview"
          width={40}
          height={2}
          className="w-full py-4"
        />

        {/* Footer */}
        <div className="w-full text-center">
          <p className="text-base">For any other query</p>
          <p className="text-[20px] font-semibold flex justify-center">
            <Image
              src="/images/phone-icon.svg"
              alt="Dashboard preview"
              width={40}
              height={40}
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
