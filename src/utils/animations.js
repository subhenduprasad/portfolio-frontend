import { useState, useEffect } from "react";
import { titleData } from "./constants";

export default function useHeroTyping() {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = titleData[index]?.role || "";
    const speed = deleting ? 50 : 120;

    const timeout = setTimeout(() => {
      if (!deleting && subIndex === current.length) {
        setTimeout(() => setDeleting(true), 600);
        return;
      }
      if (deleting && subIndex === 0) {
        setDeleting(false);
        setIndex((i) => (i + 1) % titleData.length);
        return;
      }

      setSubIndex((v) => v + (deleting ? -1 : 1));
      setText(current.substring(0, subIndex));
    }, speed);

    return () => clearTimeout(timeout);
  }, [subIndex, deleting]);

  return text;
}
