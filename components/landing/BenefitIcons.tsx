import type { SVGProps } from "react";

/** Маркеры преимуществ без «коробочной» обводки */

/** Свежая выпечка: багет + пар из печи */
export function IconFreshBake(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="24" cy="30.5" rx="17.5" ry="7.5" className="fill-current" />
      <path
        d="m14.5 28.8 7-10.8M21.5 31.3 31 17.9M31.8 31.6 39.8 21"
        className="stroke-[#FFFCF9]"
        strokeWidth="1.45"
        strokeLinecap="round"
        opacity={0.5}
      />
      <path
        d="M17 13.5q1.5-3.5 4-5.5M21.8 14.8q3-6 13-8.8M31.8 13.8q5-8 13-10.5"
        className="stroke-current"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity={0.4}
      />
    </svg>
  );
}

export function IconQuality(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M24 11l2.6 5.3 5.9.9-4.3 4.2 1 5.9L24 23.8l-5.2 2.7 1-5.9-4.3-4.2 5.9-.9L24 11Z"
        className="fill-current"
      />
      <path
        d="M14 33c2.5-2.8 6-4.5 10-4.5s7.5 1.7 10 4.5"
        className="stroke-[#FFFCF9]"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity={0.55}
      />
    </svg>
  );
}

export function IconFastDelivery(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M11 27h23v5H11v-5Zm2-7h17l4 7H13v-7Z" className="fill-current" />
      <circle cx="15.5" cy="34" r="3.2" className="fill-current" />
      <circle cx="32.5" cy="34" r="3.2" className="fill-current" />
      <path
        d="M27 17h8l3 3v4"
        className="stroke-[#F5A623]"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="39" cy="13" r="3.5" className="fill-[#F5A623]" />
    </svg>
  );
}

export function IconMadeWithLove(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M24 37c-9.5-7.5-15-13-15-18.5C9 13 13 9 18 9c3 0 5.5 1.8 6 4.5C24.5 10.8 27 9 30 9c5 0 9 4 9 9.5 0 5.5-5.5 11-15 18.5Z"
        className="fill-current"
      />
    </svg>
  );
}
