import { useEffect, useState } from "react";

export function useFontsReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => {
      setReady(true);
    });
  }, []);

  return ready;
}
