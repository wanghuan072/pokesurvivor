import s from "@/style/common/content.module.css";
export default function NotFound() {
  return (
    <div className={s.error}>
      <h1>404</h1>
      <h2>This trail leads off the map.</h2>
      <p>
        The page you are looking for could not be found. Your next adventure is
        still waiting.
      </p>
      <a className="btn" href="/">
        Back to home →
      </a>
    </div>
  );
}
