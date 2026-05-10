import { cn } from "@/lib/utils";

type ProductImagePlaceholderProps = {
  className?: string;
};

/**
 * Заглушка для карточек без фото: тёплый фон + плоская иконка «блюдо под клошом».
 * При появлении `imageUrl` у товара достаточно подставить картинку — компонент не нужен.
 */
export function ProductImagePlaceholder({
  className,
}: ProductImagePlaceholderProps) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-[#F5F1E9]",
        className
      )}
      aria-hidden
    >
      <svg
        viewBox="0 0 200 170"
        className="mx-auto aspect-[200/170] h-[min(52%,7.5rem)] w-[min(68%,10rem)] min-h-[2.75rem] min-w-[3.25rem] max-h-[120px] max-w-[150px] shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* пар */}
        <path
          d="M76 42c3-7 3-14 0-22M100 36c4-9 4-18 0-27M124 42c3-7 3-14 0-22"
          stroke="#9CA3AF"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        {/* купол */}
        <path
          d="M42 128 Q100 50 158 128 Z"
          fill="#EDE8DF"
          stroke="#9CA3AF"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* блик слева */}
        <path
          d="M56 118 Q70 86 86 68"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* ручка */}
        <ellipse cx="100" cy="54" rx="9" ry="6" fill="#9CA3AF" />
        {/* тарелка */}
        <path
          d="M32 132h136"
          stroke="#9CA3AF"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
