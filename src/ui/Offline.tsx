// 오프라인 표시: 문제 풀기는 그대로 되고 AI 기능만 쉬어요
import { useEffect, useState } from 'react';

export function OfflineBadge() {
  const [off, setOff] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  useEffect(() => {
    const on = () => setOff(false);
    const of = () => setOff(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', of);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', of);
    };
  }, []);
  if (!off) return null;
  return (
    <div className="offline noprint" role="status">
      📴 오프라인이에요. 문제 풀기·기록은 그대로 되고, AI 기능만 인터넷이 연결되면 다시 쓸 수 있어요.
    </div>
  );
}
