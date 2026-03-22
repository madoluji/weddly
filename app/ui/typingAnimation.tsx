"use client";
import { useEffect, useState } from "react";

interface Props {
  className?: string;
  text: string;
  startDelay?: number;
  interval: number;
}

const TypingAnimation = ({ className, text, startDelay, interval }: Props) => {
  const [typedText, setTypedText] = useState<string>("");

  useEffect(() => {
    let localTypingIndex = 0;
    let localTyping = "";

    const startTimeout = setTimeout(() => {
      const printer = setInterval(() => {
        if (localTypingIndex < text.length) {
          localTyping += text[localTypingIndex];
          setTypedText(localTyping);
          localTypingIndex += 1;
        } else {
          clearInterval(printer);
        }
      }, interval);

      return () => clearInterval(printer); // Cleanup the interval on component unmount
    }, startDelay);

    return () => clearInterval(startTimeout); // Cleanup the interval on component unmount
  }, [text, startDelay, interval]);

  return <span className={`${className}`}>{typedText}</span>;
};

export default TypingAnimation;
