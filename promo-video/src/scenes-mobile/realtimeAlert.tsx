import { makeScene2D, Rect, Txt, Circle, Node } from '@motion-canvas/2d';
import { all, waitFor, createRef, easeOutCubic, easeInOutCubic, easeOutBack } from '@motion-canvas/core';
import { colors, fonts, fontSize, canvas } from '../components/styles-mobile';

export default makeScene2D(function* (view) {
  view.fill(colors.bgDark);
  view.size([canvas.width, canvas.height]);

  const root = createRef<Node>();

  // Phase 1: 텍스트 영역
  const textArea = createRef<Node>();
  const stepLabel = createRef<Txt>();
  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();
  const flowIcons = createRef<Node>();

  // Phase 2: 텔레그램 카드 (크게)
  const telegramCard = createRef<Node>();
  const notification = createRef<Node>();
  const notifBadge = createRef<Circle>();

  // 키포인트
  const keypoint = createRef<Rect>();

  view.add(
    <Node ref={root}>
      {/* === Phase 1: 텍스트 영역 === */}
      <Node ref={textArea}>
        <Txt
          ref={stepLabel}
          text="STEP 03"
          fontSize={fontSize.xl}
          fontWeight={600}
          fill={colors.telegram}
          fontFamily={fonts.main}
          y={-400}
          opacity={0}
        />

        <Txt
          ref={title}
          text={"실시간\n알림"}
          fontSize={fontSize['4xl']}
          fontWeight={900}
          fill={colors.white}
          fontFamily={fonts.main}
          y={-180}
          opacity={0}
          lineHeight={'120%'}
        />

        <Txt
          ref={subtitle}
          text={"접수 즉시\n텔레그램으로 알림 전송"}
          fontSize={fontSize.xl}
          fill={colors.textLight}
          fontFamily={fonts.main}
          y={60}
          opacity={0}
          lineHeight={'150%'}
        />

        {/* 흐름 아이콘 */}
        <Node ref={flowIcons} y={260} opacity={0}>
          <Circle width={60} height={60} fill={colors.success} x={-120}>
            <Txt text="✓" fontSize={32} fill={colors.white} fontFamily={fonts.main} />
          </Circle>

          <Node x={0}>
            <Rect width={60} height={4} fill={colors.textLight} />
            <Txt text="→" fontSize={32} fill={colors.textLight} fontFamily={fonts.main} />
          </Node>

          <Circle width={60} height={60} fill={colors.telegram} x={120}>
            <Txt text="🔔" fontSize={28} fontFamily={fonts.main} />
          </Circle>
        </Node>
      </Node>

      {/* === Phase 2: 텔레그램 카드 (크게 꽉 참) === */}
      <Node ref={telegramCard} y={0} opacity={0} scale={1.8}>
        {/* 카드 배경 */}
        <Rect
          width={480}
          height={700}
          radius={30}
          fill={'#212121'}
          shadowColor={'#00000066'}
          shadowBlur={40}
          shadowOffsetY={15}
        />

        {/* 텔레그램 헤더 */}
        <Rect width={480} height={70} fill={'#212121'} y={-290} radius={[30, 30, 0, 0]}>
          <Txt text="←" fontSize={28} fill={colors.white} fontFamily={fonts.main} x={-195} />
          <Circle width={44} height={44} fill={'#e91e63'} x={-130}>
            <Txt text="폴" fontSize={20} fontWeight={700} fill={colors.white} fontFamily={fonts.main} />
          </Circle>
          <Node x={0}>
            <Txt text="폴라애드랜딩" fontSize={18} fontWeight={600} fill={colors.white} fontFamily={fonts.main} y={-10} />
            <Txt text="2 subscribers" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} y={12} />
          </Node>
        </Rect>

        {/* 알림 메시지 - 메인 */}
        <Node ref={notification} y={-80} opacity={0} scale={0.9}>
          <Rect width={420} height={230} radius={14} fill={'#2b2b2b'}>
            <Txt text="🔔 새로운 리드 접수" fontSize={18} fontWeight={600} fill={colors.white} fontFamily={fonts.main} y={-85} x={-160} offsetX={-1} />
            <Txt text="🏢 클라이언트: 폴라애드" fontSize={15} fill={colors.white} fontFamily={fonts.main} y={-50} x={-160} offsetX={-1} />
            <Txt text="👤 이름: 홍**" fontSize={15} fill={colors.white} fontFamily={fonts.main} y={-20} x={-160} offsetX={-1} />
            <Node y={10}>
              <Txt text="📞 연락처: " fontSize={15} fill={colors.white} fontFamily={fonts.main} x={-160} offsetX={-1} />
              <Txt text="010-0000-0000" fontSize={15} fill={'#3390ec'} fontFamily={fonts.main} x={-60} offsetX={-1} />
            </Node>
            <Txt text="⏰ 시간: 01/24 오후 2:32" fontSize={15} fill={colors.white} fontFamily={fonts.main} y={40} x={-160} offsetX={-1} />
            <Txt text="접수내역확인" fontSize={15} fill={'#3390ec'} fontFamily={fonts.main} y={75} x={-160} offsetX={-1} />
          </Rect>
        </Node>

        {/* 이전 메시지들 */}
        <Rect width={400} height={80} radius={12} fill={'#2b2b2b'} y={110}>
          <Txt text="🔔 새로운 리드 접수" fontSize={14} fontWeight={600} fill={colors.white} fontFamily={fonts.main} y={-20} x={-155} offsetX={-1} />
          <Node y={8}>
            <Txt text="👤 이름: 김**  📞 " fontSize={12} fill={colors.white} fontFamily={fonts.main} x={-155} offsetX={-1} />
            <Txt text="010-0000-0000" fontSize={12} fill={'#3390ec'} fontFamily={fonts.main} x={-40} offsetX={-1} />
          </Node>
        </Rect>

        <Rect width={400} height={80} radius={12} fill={'#2b2b2b'} y={210}>
          <Txt text="🔔 새로운 리드 접수" fontSize={14} fontWeight={600} fill={colors.white} fontFamily={fonts.main} y={-20} x={-155} offsetX={-1} />
          <Node y={8}>
            <Txt text="👤 이름: 이**  📞 " fontSize={12} fill={colors.white} fontFamily={fonts.main} x={-155} offsetX={-1} />
            <Txt text="010-0000-0000" fontSize={12} fill={'#3390ec'} fontFamily={fonts.main} x={-40} offsetX={-1} />
          </Node>
        </Rect>

        {/* 알림 뱃지 */}
        <Circle
          ref={notifBadge}
          width={50}
          height={50}
          fill={colors.error}
          x={210}
          y={-320}
          opacity={0}
          scale={0}
        >
          <Txt text="1" fontSize={24} fontWeight={700} fill={colors.white} fontFamily={fonts.main} />
        </Circle>
      </Node>

      {/* 키포인트 */}
      <Rect
        ref={keypoint}
        width={420}
        height={60}
        radius={16}
        fill={colors.telegram + '20'}
        stroke={colors.telegram}
        lineWidth={2}
        y={800}
        opacity={0}
      >
        <Txt
          text="🔔 놓치는 리드 없이 실시간 확인"
          fontSize={fontSize.base}
          fontWeight={600}
          fill={colors.telegram}
          fontFamily={fonts.main}
        />
      </Rect>
    </Node>
  );

  // === 애니메이션: 순차 등장 패턴 ===

  // Phase 1: 텍스트 영역 등장
  yield* all(
    stepLabel().opacity(1, 0.3),
    stepLabel().y(-380, 0.3, easeOutCubic),
  );

  yield* all(
    title().opacity(1, 0.3),
    title().y(-160, 0.3, easeOutCubic),
  );

  yield* all(
    subtitle().opacity(1, 0.3),
    subtitle().y(80, 0.3, easeOutCubic),
  );

  yield* flowIcons().opacity(1, 0.3);

  yield* waitFor(0.6);

  // Phase 2: 텍스트 페이드아웃
  yield* textArea().opacity(0, 0.3, easeInOutCubic);

  yield* waitFor(0.1);

  // Phase 3: 텔레그램 카드 크게 등장
  yield* all(
    telegramCard().opacity(1, 0.4),
    telegramCard().scale(2.0, 0.4, easeOutCubic),
  );

  yield* waitFor(0.2);

  // 알림 뱃지 등장
  yield* all(
    notifBadge().opacity(1, 0.2),
    notifBadge().scale(1, 0.2, easeOutBack),
  );

  yield* waitFor(0.15);

  // 알림 메시지 등장
  yield* all(
    notification().opacity(1, 0.3),
    notification().scale(1, 0.3, easeOutBack),
  );

  yield* waitFor(0.4);

  // 키포인트 등장
  yield* all(
    keypoint().opacity(1, 0.25),
    keypoint().y(780, 0.25, easeOutCubic),
  );

  yield* waitFor(1);

  // 페이드 아웃
  yield* root().opacity(0, 0.25);
});
