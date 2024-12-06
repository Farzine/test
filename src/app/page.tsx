'use client'

import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();
  return (
    <div >
      {(session ?.user?.email) && (session ?.user?.name)}
    </div>
  );
}
