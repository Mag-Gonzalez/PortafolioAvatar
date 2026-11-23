"use client";

import dynamic from "next/dynamic";
import { LogoMark } from "@/components/ui/Icons";

const AvatarScene = dynamic(() => import("@/components/three/AvatarScene"), {
  ssr: false,
  loading: () => (
    <div className="scene-fallback" aria-hidden>
      <LogoMark />
    </div>
  ),
});

export default function AvatarStage() {
  return <AvatarScene />;
}
