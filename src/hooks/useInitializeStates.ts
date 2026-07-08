import { useEffect } from "react";
import { useGlobalStore } from "@/store/store";
import { safeJsonParse } from "@/helpers/safeJson";

// Define type here or import from types.ts if external
type StateMap = Record<string, string>;

const useInitializeStates = () => {
  const setStateOptions = useGlobalStore((s) => s.setStateOptions);
  const stateOptions = useGlobalStore((s) => s.stateOptions);

  useEffect(() => {
    const loadStates = async () => {
      // Load from localStorage if present
      const parsedStates: StateMap = safeJsonParse<StateMap>(
        localStorage.getItem("states"),
        {},
      );

      if (Object.keys(parsedStates ?? {}).length > 0) {
        setStateOptions(parsedStates);
        return;
      }
    };

    if (Object.keys(stateOptions ?? {}).length === 0) {
      loadStates();
    }
  }, [setStateOptions, stateOptions]);
};

export default useInitializeStates;
