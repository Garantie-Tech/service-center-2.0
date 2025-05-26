import { useEffect } from "react";
import { useGlobalStore } from "@/store/store";

// Define type here or import from types.ts if external
type StateMap = Record<string, string>;

const useInitializeStates = () => {
  const setStateOptions = useGlobalStore((s) => s.setStateOptions);
  const stateOptions = useGlobalStore((s) => s.stateOptions);

  useEffect(() => {
    const loadStates = async () => {
      // Load from localStorage if present
      const storedStates = localStorage.getItem("states");

      if (storedStates && storedStates !== "undefined") {
        try {
          const parsedStates: StateMap = JSON.parse(storedStates);
          setStateOptions(parsedStates);
          return;
        } catch (err) {
          console.error("Failed to parse stored states:", err);
        }
      }
    };

    if (Object.keys(stateOptions ?? {}).length === 0) {
      loadStates();
    }
  }, [setStateOptions, stateOptions]);
};

export default useInitializeStates;
