"use client";

import React from "react";

const LoginFormLeftSection: React.FC = () => {
  return (
    <div
      className="hidden md:flex flex-col justify-center items-center w-1/2 bg-cover bg-center p-8 text-white"
      style={{
        backgroundImage: "url(/images/service-center-login-bg.svg)",
      }}
    >
      <h2 className="text-3xl font-bold mb-4">Safety Verification</h2>
      <p className="text-lg mb-6">
        For safety concerns, we need to validate your login credentials
      </p>

      {/* Contact Details */}
      <div className="mb-6">
        <p className="text-sm font-medium">For claim-related queries</p>
        <p className="mt-2 text-base">
          📧{" "}
          <a href="mailto:claims.mobile@garantie.in" className="underline">
            Claims.mobile@garantie.in
          </a>
        </p>
        <p className="text-base">
          📞{" "}
          <a href="tel:+918800502077" className="underline">
            +91 8800502077
          </a>{" "}
          /{" "}
          <a href="tel:+919650604181" className="underline">
            9650604181
          </a>
        </p>
      </div>

      {/* Image */}
      {/* <Image
        src="/images/dashboard-preview.png"
        alt="Dashboard preview"
        width={300}
        height={200}
        className="rounded-md shadow-md"
      /> */}

      {/* Footer */}
      <div className="mt-8">
        <p className="text-sm">For any other query</p>
        <p className="text-lg font-semibold">📞 +91 9871115834</p>
      </div>
    </div>
  );
};

export default LoginFormLeftSection;
