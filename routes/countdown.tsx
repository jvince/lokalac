import Countdown from "../islands/Countdown.tsx";

export default function CountdownPage() {
  const date = new Date();
  date.setSeconds(date.getSeconds() + 10);

  return (
    <p>
      The big event is happening in <Countdown target={date.toISOString()} />!
    </p>
  );
}
