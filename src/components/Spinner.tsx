import { css } from "@linaria/core"

export default function Spinner() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={css`
      stroke-width: 2px;
      height: 20px;
      width: 20px;
      stroke-dasharray: 16px;
      stroke-linecap: round;
      display: inline;
      height: 1em;

      animation: spin 1s linear infinite;
      @keyframes spin { to { transform: rotate(360deg); } }
    `}>
      <path d="M5 9C7.20914 9 9 7.20914 9 5C9 2.79086 7.20914 1 5 1C2.79086 1 1 2.79086 1 5C1 7.20914 2.79086 9 5 9Z" stroke="currentColor" />
    </svg>
  )
}
