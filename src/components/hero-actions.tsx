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
        Browse scholarships
      </Button>
      <Button
        className="hero-button hero-button-secondary"
        variant="outline"
        onPress={() => router.push("/services")}
      >
        View all services
      </Button>
    </div>
  );
}
