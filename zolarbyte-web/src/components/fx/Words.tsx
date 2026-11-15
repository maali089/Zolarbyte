import { Fragment } from "react";

/**
 * Zerlegt eine Überschrift in Wörter, die einzeln aus einer Maske steigen.
 * Server-tauglich. Text bleibt für Screenreader ein zusammenhängender String.
 * `accent` markiert Wörter (exakte Übereinstimmung) in Magenta.
 */
export function Words({
  text,
  accent = [],
  delay = 0,
  className = "",
}: {
  text: string;
  accent?: string[];
  delay?: number;
  className?: string;
}) {
  const lines = text.split("\n");
  let w = 0;
  return (
    <span className={`words ${className}`} style={{ "--delay": `${delay}ms` } as React.CSSProperties}>
      <span className="visually-hidden">{text.replace(/\n/g, " ")}</span>
      <span aria-hidden="true">
        {lines.map((line, li) => (
          <Fragment key={li}>
            {line.split(" ").map((word, i, arr) => {
              const idx = w++;
              const isAccent = accent.includes(word.replace(/[.,!?]/g, ""));
              return (
                <Fragment key={i}>
                  <span className="word">
                    <span className={isAccent ? "accent" : undefined} style={{ "--w": idx } as React.CSSProperties}>
                      {word}
                    </span>
                  </span>
                  {i < arr.length - 1 ? " " : null}
                </Fragment>
              );
            })}
            {li < lines.length - 1 ? <br /> : null}
          </Fragment>
        ))}
      </span>
    </span>
  );
}
