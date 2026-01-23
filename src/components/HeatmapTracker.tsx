"use client";

import { useEffect, useRef, useCallback } from "react";

interface ClickData {
  xPercent: number;
  yPercent: number;
  viewportWidth: number;
  viewportHeight: number;
  elementSelector: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  timestamp: number;
}

interface HeatmapTrackerProps {
  clientSlug: string;
  enabled?: boolean;
}

// 세션 ID 생성/가져오기
function getSessionId(): string {
  const key = "heatmap_session_id";
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

// 디바이스 타입 감지
function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();

  // 태블릿 감지
  if (/ipad|tablet|playbook|silk/i.test(userAgent) || (width >= 768 && width < 1024)) {
    return 'tablet';
  }

  // 모바일 감지
  if (/iphone|ipod|android|blackberry|windows phone/i.test(userAgent) || width < 768) {
    return 'mobile';
  }

  return 'desktop';
}

// 요소의 선택자 생성
function getElementSelector(element: HTMLElement): string {
  // ID가 있으면 ID 사용
  if (element.id) {
    return `#${element.id}`;
  }

  // 클래스가 있으면 태그 + 클래스
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.split(' ')
      .filter(c => c && !c.startsWith('__'))
      .slice(0, 2)
      .join('.');
    if (classes) {
      return `${element.tagName.toLowerCase()}.${classes}`;
    }
  }

  // 태그명 + nth-child
  const parent = element.parentElement;
  if (parent) {
    const siblings = Array.from(parent.children).filter(
      child => child.tagName === element.tagName
    );
    const index = siblings.indexOf(element) + 1;
    return `${element.tagName.toLowerCase()}:nth-child(${index})`;
  }

  return element.tagName.toLowerCase();
}

export default function HeatmapTracker({ clientSlug, enabled = true }: HeatmapTrackerProps) {
  const clicksRef = useRef<ClickData[]>([]);
  const sessionIdRef = useRef<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSendingRef = useRef(false);

  // 클릭 데이터 전송
  const sendClicks = useCallback(async () => {
    if (clicksRef.current.length === 0 || isSendingRef.current) return;

    isSendingRef.current = true;
    const clicksToSend = [...clicksRef.current];
    clicksRef.current = [];

    try {
      await fetch("/api/heatmap/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientSlug,
          sessionId: sessionIdRef.current,
          clicks: clicksToSend,
        }),
        // 페이지 이탈 시에도 전송 완료하도록
        keepalive: true,
      });
    } catch (err) {
      console.error("히트맵 데이터 전송 실패:", err);
      // 실패한 클릭 데이터 복구
      clicksRef.current = [...clicksToSend, ...clicksRef.current];
    } finally {
      isSendingRef.current = false;
    }
  }, [clientSlug]);

  // 클릭 이벤트 핸들러
  const handleClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target) return;

    // 페이지 전체 크기 기준 퍼센트 계산
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    const pageWidth = document.documentElement.scrollWidth;
    const pageHeight = document.documentElement.scrollHeight;

    const xPercent = ((e.clientX + scrollX) / pageWidth) * 100;
    const yPercent = ((e.clientY + scrollY) / pageHeight) * 100;

    const click: ClickData = {
      xPercent,
      yPercent,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      elementSelector: getElementSelector(target),
      deviceType: getDeviceType(),
      timestamp: Date.now(),
    };

    clicksRef.current.push(click);

    // 클릭이 10개 이상 쌓이면 즉시 전송
    if (clicksRef.current.length >= 10) {
      sendClicks();
    }
  }, [sendClicks]);

  useEffect(() => {
    if (!enabled) return;

    // 세션 ID 초기화
    sessionIdRef.current = getSessionId();

    // 클릭 이벤트 리스너 등록
    document.addEventListener("click", handleClick, { passive: true });

    // 5초마다 전송
    timerRef.current = setInterval(() => {
      sendClicks();
    }, 5000);

    // 페이지 이탈 시 전송
    const handleBeforeUnload = () => {
      if (clicksRef.current.length > 0) {
        sendClicks();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handleBeforeUnload);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handleBeforeUnload);

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // 언마운트 시 남은 클릭 전송
      if (clicksRef.current.length > 0) {
        sendClicks();
      }
    };
  }, [enabled, handleClick, sendClicks]);

  // UI 렌더링 없음 (트래킹만 수행)
  return null;
}
