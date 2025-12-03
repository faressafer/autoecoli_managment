"use client";

import { useEffect, useState } from "react";
import { initializeDefaultAdmin } from "@/lib/firebase/services/admin";

export default function AdminInitializer() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!initialized) {
        await initializeDefaultAdmin();
        setInitialized(true);
      }
    };

    init();
  }, [initialized]);

  return null; // This component doesn't render anything
}
