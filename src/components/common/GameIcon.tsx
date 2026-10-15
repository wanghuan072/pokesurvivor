import s from "@/style/common/game-icon.module.css";
import Image from "next/image";

export function GameIcon({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <Image
      src={`/game/icons/${name}.png`}
      width={size}
      height={size}
      alt=""
      unoptimized
      className={s.icon}
    />
  );
}
export function MoveIcon({ id, size = 42 }: { id: string; size?: number }) {
  return (
    <Image
      src={`/game/moves/${id}.png`}
      width={size}
      height={size}
      alt=""
      unoptimized
      className={s.icon}
    />
  );
}
