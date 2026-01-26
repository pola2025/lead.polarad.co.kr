import { makeScene2D, Rect, Txt, Circle, Node } from '@motion-canvas/2d';
import { all, chain, waitFor, createRef, easeOutCubic, easeInCubic, easeOutBack } from '@motion-canvas/core';
import { colors, fonts, fontSize, canvas, spacing } from '../components/styles';

export default makeScene2D(function* (view) {
  view.fill(colors.bgDark);
  view.size([canvas.width, canvas.height]);

  const root = createRef<Node>();
  const stepLabel = createRef<Txt>();
  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();
  const keypoint = createRef<Rect>();

  // 개별 카드 refs (3개: 블랙리스트, 수집정보, 메시지)
  const card1 = createRef<Node>();
  const card2 = createRef<Node>();
  const card3 = createRef<Node>();

  // 카드 시작 위치 (오른쪽 화면 밖)
  const startX = 1500;
  const centerX = 0;
  const endX = -1500;

  // 카드 크기
  const cardWidth = 1500;
  const cardHeight = 850;

  view.add(
    <Node ref={root}>
      {/* 상단 타이틀 - 고정 */}
      <Node y={-850}>
        <Txt
          ref={stepLabel}
          text="STEP 06"
          fontSize={fontSize.lg}
          fontWeight={600}
          fill={colors.warning}
          fontFamily={fonts.main}
          opacity={0}
        />
        <Txt
          ref={title}
          text="주요 기능"
          fontSize={fontSize['4xl']}
          fontWeight={900}
          fill={colors.white}
          fontFamily={fonts.main}
          y={150}
          opacity={0}
        />
        <Txt
          ref={subtitle}
          text="필요한 기능만 골라 사용"
          fontSize={fontSize.xl}
          fill={colors.textLight}
          fontFamily={fonts.main}
          y={380}
          opacity={0}
        />
      </Node>

      {/* 카드 1: 블랙리스트 */}
      <Node ref={card1} x={startX} y={180} opacity={0} scale={0.8}>
        <Rect width={cardWidth} height={cardHeight} radius={40} fill={colors.white} shadowColor={'#00000030'} shadowBlur={80} shadowOffsetY={20}>
          <Node y={-240}>
            <Circle width={140} height={140} fill={colors.text + '15'} x={-380}>
              <Txt text="🚫" fontSize={64} fontFamily={fonts.main} />
            </Circle>
            <Txt text="블랙리스트" fontSize={80} fontWeight={800} fill={colors.text} fontFamily={fonts.main} x={-50} />
          </Node>
          <Txt text="허수 리드 자동 차단" fontSize={48} fill={colors.textMuted} fontFamily={fonts.main} y={30} />
          <Node y={260}>
            <Rect width={600} height={120} radius={20} fill={colors.wireframe}>
              <Txt text="010-****-1234" fontSize={40} fill={colors.error} fontFamily={fonts.main} x={-100} />
              <Rect width={120} height={65} radius={12} fill={colors.error} x={180}>
                <Txt text="차단" fontSize={32} fontWeight={600} fill={colors.white} fontFamily={fonts.main} />
              </Rect>
            </Rect>
          </Node>
        </Rect>
      </Node>

      {/* 카드 2: 수집정보 설정 */}
      <Node ref={card2} x={startX} y={180} opacity={0} scale={0.8}>
        <Rect width={cardWidth} height={cardHeight} radius={40} fill={colors.white} shadowColor={'#00000030'} shadowBlur={80} shadowOffsetY={20}>
          <Node y={-240}>
            <Circle width={140} height={140} fill={colors.primary + '20'} x={-420}>
              <Txt text="📝" fontSize={64} fontFamily={fonts.main} />
            </Circle>
            <Txt text="수집정보 설정" fontSize={80} fontWeight={800} fill={colors.text} fontFamily={fonts.main} x={0} />
          </Node>
          <Txt text="필요한 필드만 선택" fontSize={48} fill={colors.textMuted} fontFamily={fonts.main} y={30} />
          <Node y={260}>
            <Rect width={600} height={120} radius={20} fill={colors.wireframe}>
              <Node x={-150}>
                <Rect width={36} height={36} radius={8} fill={colors.primary} />
                <Txt text="이름" fontSize={34} fill={colors.text} fontFamily={fonts.main} x={70} />
              </Node>
              <Node x={100}>
                <Rect width={36} height={36} radius={8} fill={colors.primary} />
                <Txt text="연락처" fontSize={34} fill={colors.text} fontFamily={fonts.main} x={80} />
              </Node>
            </Rect>
          </Node>
        </Rect>
      </Node>

      {/* 카드 3: 메시지 설정 */}
      <Node ref={card3} x={startX} y={180} opacity={0} scale={0.8}>
        <Rect width={cardWidth} height={cardHeight} radius={40} fill={colors.white} shadowColor={'#00000030'} shadowBlur={80} shadowOffsetY={20}>
          <Node y={-240}>
            <Circle width={140} height={140} fill={colors.success + '20'} x={-400}>
              <Txt text="💬" fontSize={64} fontFamily={fonts.main} />
            </Circle>
            <Txt text="메시지 설정" fontSize={80} fontWeight={800} fill={colors.text} fontFamily={fonts.main} x={-20} />
          </Node>
          <Txt text="알림 문구 자유롭게 커스텀" fontSize={48} fill={colors.textMuted} fontFamily={fonts.main} y={30} />
          <Node y={260}>
            <Rect width={600} height={120} radius={20} fill={colors.wireframe}>
              <Rect width={460} height={85} radius={16} fill={colors.success}>
                <Txt text="감사합니다! 🎉" fontSize={36} fontWeight={500} fill={colors.white} fontFamily={fonts.main} />
              </Rect>
            </Rect>
          </Node>
        </Rect>
      </Node>

      {/* 하단 키포인트 */}
      <Rect ref={keypoint} width={850} height={120} radius={24} fill={colors.warning + '20'} stroke={colors.warning} lineWidth={3} y={900} opacity={0}>
        <Txt text="🛠️ 필요한 기능만 골라 사용" fontSize={fontSize.lg} fontWeight={600} fill={colors.warning} fontFamily={fonts.main} />
      </Rect>
    </Node>
  );

  // === 애니메이션 (45초 버전) ===

  // 타이틀 동시 등장
  yield* all(
    stepLabel().opacity(1, 0.25),
    title().opacity(1, 0.3),
    title().y(140, 0.3, easeOutCubic),
    subtitle().opacity(1, 0.3),
    subtitle().y(320, 0.3, easeOutCubic),
  );

  // 카드 1 (블랙리스트): 오른쪽 → 가운데 → 왼쪽
  yield* all(
    card1().opacity(1, 0.25),
    card1().x(centerX, 0.35, easeOutCubic),
    card1().scale(1, 0.35, easeOutBack),
  );
  yield* waitFor(0.6);
  yield* all(
    card1().x(endX, 0.3, easeInCubic),
    card1().opacity(0, 0.25),
    card1().scale(0.8, 0.3),
  );

  // 카드 2 (수집정보): 오른쪽 → 가운데 → 왼쪽
  yield* all(
    card2().opacity(1, 0.25),
    card2().x(centerX, 0.35, easeOutCubic),
    card2().scale(1, 0.35, easeOutBack),
  );
  yield* waitFor(0.6);
  yield* all(
    card2().x(endX, 0.3, easeInCubic),
    card2().opacity(0, 0.25),
    card2().scale(0.8, 0.3),
  );

  // 카드 3 (메시지): 오른쪽 → 가운데 (마지막이라 잠시 유지)
  yield* all(
    card3().opacity(1, 0.25),
    card3().x(centerX, 0.35, easeOutCubic),
    card3().scale(1, 0.35, easeOutBack),
  );
  yield* waitFor(0.6);

  // 키포인트 등장
  yield* all(
    keypoint().opacity(1, 0.25),
    keypoint().y(850, 0.25, easeOutCubic),
  );

  yield* waitFor(0.8);

  // 페이드 아웃
  yield* all(
    root().opacity(0, 0.25),
  );

});
