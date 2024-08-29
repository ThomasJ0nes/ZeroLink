import * as React from "react";
import type { SVGProps } from "react";

// Ethereum SVG Component
const Ethereum = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="1em"
    height="1em"
    viewBox="0 0 32 32"
    {...props}
  >
    <defs>
      <linearGradient id="eth-c" x1="50%" x2="50%" y1="0%" y2="100%">
        <stop offset="0%" stopColor="#FFF" stopOpacity={0.5} />
        <stop offset="100%" stopOpacity={0.5} />
      </linearGradient>
      <circle id="eth-b" cx={16} cy={15} r={15} />
      <filter id="eth-a" width="111.7%" height="111.7%" x="-5.8%" y="-4.2%" filterUnits="objectBoundingBox">
        <feOffset dy={0.5} in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation={0.5} />
        <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1" />
        <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.199473505 0" />
      </filter>
      <path
        id="eth-e"
        d="M16.4977734,20.9675435 L23.9999473,16.616495 L16.4977207,26.9946245 L16.4976173,26.9943278 L9,16.6164144 L16.4977734,20.9674935 Z M16.4977471,3.00004297 L23.9954941,15.2198561 L16.4977734,19.5730917 L9,15.2198561 L16.4977471,3.00004297 Z"
      />
      <filter id="eth-d" width="123.3%" height="114.6%" x="-11.7%" y="-5.2%" filterUnits="objectBoundingBox">
        <feOffset dy={0.5} in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation={0.5} />
        <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1" />
        <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.204257246 0" />
      </filter>
    </defs>
    <g fill="none" fillRule="evenodd">
      <use fill="#000" filter="url(#eth-a)" xlinkHref="#eth-b" />
      <use fill="#627EEA" xlinkHref="#eth-b" />
      <use
        fill="url(#eth-c)"
        style={{
          mixBlendMode: "soft-light",
        }}
        xlinkHref="#eth-b"
      />
      <circle cx={16} cy={15} r={14.5} stroke="#000" strokeOpacity={0.097} />
      <g fillRule="nonzero">
        <use fill="#000" filter="url(#eth-d)" xlinkHref="#eth-e" />
        <use fill="#FFF" fillOpacity={0} fillRule="evenodd" xlinkHref="#eth-e" />
      </g>
      <g fill="#FFF" fillRule="nonzero" transform="translate(9 3)">
        <polygon fillOpacity={0.602} points="7.498 0 7.498 8.87 14.995 12.22" />
        <polygon points="7.498 0 0 12.22 7.498 8.87" />
        <polygon fillOpacity={0.602} points="7.498 17.968 7.498 23.995 15 13.616" />
        <polygon points="7.498 23.995 7.498 17.967 0 13.616" />
        <polygon fillOpacity={0.2} points="7.498 16.573 14.995 12.22 7.498 8.872" />
        <polygon fillOpacity={0.602} points="0 12.22 7.498 16.573 7.498 8.872" />
      </g>
    </g>
  </svg>
);

// Polygon SVG Component
const Polygon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 36 36" width="36" height="36" xmlns="http://www.w3.org/2000/svg" {...props}>
    <g fill="none" fillRule="nonzero">
      <circle fill="#8247E5" cx="18" cy="18" r="18" />
      <path
        d="M24.172 13.954c-.438-.25-1.002-.25-1.504 0l-3.509 2.068-2.38 1.316-3.447 2.068c-.439.25-1.003.25-1.504 0l-2.695-1.63a1.527 1.527 0 0 1-.752-1.315v-3.133c0-.502.25-1.003.752-1.316l2.695-1.567c.438-.25 1.002-.25 1.504 0l2.694 1.63c.439.25.752.751.752 1.315v2.068l2.381-1.378v-2.13c0-.502-.25-1.004-.752-1.317l-5.013-2.945c-.438-.25-1.002-.25-1.504 0l-5.138 3.008c-.501.25-.752.752-.752 1.253v5.89c0 .502.25 1.003.752 1.316l5.076 2.946c.438.25 1.002.25 1.504 0l3.446-2.006 2.381-1.378 3.447-2.006c.438-.25 1.002-.25 1.504 0l2.694 1.567c.439.25.752.752.752 1.316v3.133c0 .501-.25 1.003-.752 1.316l-2.632 1.567c-.438.25-1.002.25-1.504 0l-2.694-1.567a1.527 1.527 0 0 1-.752-1.316v-2.005L16.84 22.1v2.067c0 .502.25 1.003.752 1.316l5.075 2.946c.439.25 1.003.25 1.504 0l5.076-2.946c.439-.25.752-.752.752-1.316v-5.953c0-.5-.25-1.002-.752-1.316l-5.076-2.945z"
        fill="#FFF"
      />
    </g>
  </svg>
);

const BNB = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="1em"
    height="1em"
    viewBox="0 0 32 32"
    {...props}
  >
    <defs>
      <linearGradient id="bnb-c" x1="50%" x2="50%" y1="0%" y2="100%">
        <stop offset="0%" stopColor="#FFF" stopOpacity={0.5} />
        <stop offset="100%" stopOpacity={0.5} />
      </linearGradient>
      <circle id="bnb-b" cx={16} cy={15} r={15} />
      <filter id="bnb-a" width="111.7%" height="111.7%" x="-5.8%" y="-4.2%" filterUnits="objectBoundingBox">
        <feOffset dy={0.5} in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation={0.5} />
        <feComposite in="shadowBlurOuter1" in2="SourceAlpha" operator="out" result="shadowBlurOuter1" />
        <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.199473505 0" />
      </filter>
      <path
        id="bnb-e"
        d="M12.1158217,13.4042 L15.99981,9.5203 L19.8857983,13.4062 L22.1457916,11.1462 L15.99981,5 L9.85592843,11.1442 L12.1158217,13.4042 Z M6,14.99969 L8.26006322,12.73962 L10.5199764,14.99955 L8.25993322,17.2596 L6,14.99969 Z M12.1158217,16.5958 L15.99981,20.4797 L19.8856983,16.5939 L22.1468916,18.8527 L22.1457916,18.8539 L15.99981,25 L9.85572843,18.856 L9.85252844,18.8528 L12.1158217,16.5958 Z M21.4800236,15.00093 L23.7400868,12.74087 L26,15.00079 L23.7399468,17.26086 L21.4800236,15.00093 Z M18.2921031,14.9988 L18.2942031,14.9999 L18.2931031,15.0012 L15.99981,17.2945 L13.7086169,15.0032 L13.7054169,14.9999 L13.7086169,14.9968 L14.1102157,14.5951 L14.3049151,14.4003 L14.3050151,14.4003 L15.99981,12.7055 L18.2931031,14.9988 L18.2921031,14.9988 Z"
      />
      <filter id="bnb-d" width="117.5%" height="117.5%" x="-8.8%" y="-6.2%" filterUnits="objectBoundingBox">
        <feOffset dy={0.5} in="SourceAlpha" result="shadowOffsetOuter1" />
        <feGaussianBlur in="shadowOffsetOuter1" result="shadowBlurOuter1" stdDeviation={0.5} />
        <feColorMatrix in="shadowBlurOuter1" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.204257246 0" />
      </filter>
    </defs>
    <g fill="none" fillRule="evenodd">
      <g fillRule="nonzero">
        <use fill="#000" filter="url(#bnb-a)" xlinkHref="#bnb-b" />
        <use fill="#F3BA2F" fillRule="evenodd" xlinkHref="#bnb-b" />
        <use
          fill="url(#bnb-c)"
          fillRule="evenodd"
          style={{
            mixBlendMode: "soft-light",
          }}
          xlinkHref="#bnb-b"
        />
        <circle cx={16} cy={15} r={14.5} stroke="#000" strokeOpacity={0.097} />
      </g>
      <g fillRule="nonzero">
        <use fill="#000" filter="url(#bnb-d)" xlinkHref="#bnb-e" />
        <use fill="#FFF" fillRule="evenodd" xlinkHref="#bnb-e" />
      </g>
    </g>
  </svg>
);

export { Ethereum, Polygon, BNB };
