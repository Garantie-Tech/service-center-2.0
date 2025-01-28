"use client";

import { useGlobalStore } from "@/store/store";
import Image from "next/image";
import React from "react";

const Loading = () => {
  const isLoading = useGlobalStore((state) => state.isLoading);

  return (
    isLoading && (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-20 flex items-center justify-center z-50">
        <Image src="/images/loader.gif" alt="Loader" width={100} height={100} />
        {/* Uncomment one of the loading options below if needed */}
        {/* <span className="loading loading-spinner text-primary loading-lg"></span> */}
        {/* <span className="loading loading-bars loading-lg"></span> */}
        {/* <span className="loading loading-ring loading-lg text-primary"></span> */}
      </div>
    )
  );
};

export default Loading;
