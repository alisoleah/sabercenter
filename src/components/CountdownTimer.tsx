import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate?: Date;
}

export function CountdownTimer({ targetDate = new Date(Date.now() + 24 * 60 * 60 * 1000) }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-4 bg-gradient-to-r from-[#FF6600] to-[#FF8833] text-white px-6 py-4 rounded-lg">
      <Clock className="w-6 h-6" />
      <div className="flex items-center gap-2">
        <span>Offer Expires In:</span>
        <div className="flex gap-2">
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded">
            <span>{String(timeLeft.hours).padStart(2, '0')}</span>
          </div>
          <span>:</span>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded">
            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
          </div>
          <span>:</span>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded">
            <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
