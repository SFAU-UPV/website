"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";

export function HeroActions() {
  const router = useRouter();

  return (
    <div className="button-row">
      <Button
        className="hero-button"
        variant="primary"
        onPress={() => router.push("/services/scholarships")}
      >
        Explore scholarships
      </Button>
      <Button
        className="hero-button hero-about-button"
        variant="primary"
        onPress={() => router.push("/about")}
      >
        About OSA-SFAU
      </Button>
    </div>
  );
}
