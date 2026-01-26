import { makeScene2D, Rect, Txt, Circle, Node } from '@motion-canvas/2d';
import { all, waitFor, createRef, easeOutCubic, easeInCubic, easeOutBack } from '@motion-canvas/core';
import { colors, fonts, fontSize, canvas } from '../components/styles-mobile';

export default makeScene2D(function* (view) {
  view.fill(colors.bgDark);
  view.size([canvas.width, canvas.height]);

  const root = createRef<Node>();
  const stepLabel = createRef<Txt>();
  const title = createRef<Txt>();

  // 카드들
  const card1 = createRef<Node>();
  const card2 = createRef<Node>();
  const card3 = createRef<Node>();

  // 카드 위치
  const startY = 1200;
  const centerY = 100;
  const endY = -1200;

  // 키포인트
  const keypoint = createRef<Rect>();

  view.add(
    <Node ref={root}>
      {/* 상단 타이틀 */}
      <Txt
        ref={stepLabel}
        text="STEP 06"
        fontSize={fontSize.lg}
        fontWeight={600}
        fill={colors.warning}
        fontFamily={fonts.main}
        y={-850}
        opacity={0}
      />

      <Txt
        ref={title}
        text="주요 기능"
        fontSize={fontSize['3xl']}
        fontWeight={900}
        fill={colors.white}
        fontFamily={fonts.main}
        y={-770}
        opacity={0}
      />

      {/* 카드 1: 블랙리스트 */}
      <Node ref={card1} y={startY} opacity={0} scale={0.85}>
        <Rect width={900} height={500} radius={32} fill={colors.white} shadowColor={'#00000025'} shadowBlur={50} shadowOffsetY={15}>
          <Node y={-150}>
            <Circle width={100} height={100} fill={colors.text + '15'} x={-220}>
              <Txt text="🚫" fontSize={52} fontFamily={fonts.main} />
            </Circle>
            <Txt text="블랙리스트" fontSize={56} fontWeight={800} fill={colors.text} fontFamily={fonts.main} x={60} />
          </Node>

          <Txt text="허수 리드 자동 차단" fontSize={36} fill={colors.textMuted} fontFamily={fonts.main} y={0} />

          <Node y={140}>
            <Rect width={700} height={100} radius={16} fill={colors.wireframe}>
              <Txt text="010-****-1234" fontSize={32} fill={colors.error} fontFamily={fonts.main} x={-120} />
              <Rect width={120} height={60} radius={12} fill={colors.error} x={220}>
                <Txt text="차단" fontSize={26} fontWeight={600} fill={colors.white} fontFamily={fonts.main} />
              </Rect>
            </Rect>
          </Node>
        </Rect>
      </Node>

      {/* 카드 2: 수집정보 설정 */}
      <Node ref={card2} y={startY} opacity={0} scale={0.85}>
        <Rect width={900} height={500} radius={32} fill={colors.white} shadowColor={'#00000025'} shadowBlur={50} shadowOffsetY={15}>
          <Node y={-150}>
            <Circle width={100} height={100} fill={colors.primary + '20'} x={-240}>
              <Txt text="📝" fontSize={52} fontFamily={fonts.main} />
            </Circle>
            <Txt text="수집정보 설정" fontSize={56} fontWeight={800} fill={colors.text} fontFamily={fonts.main} x={40} />
          </Node>

          <Txt text="필요한 필드만 선택" fontSize={36} fill={colors.textMuted} fontFamily={fonts.main} y={0} />

          <Node y={140}>
            <Rect width={700} height={100} radius={16} fill={colors.wireframe}>
              <Node x={-160}>
                <Rect width={40} height={40} radius={8} fill={colors.primary} />
                <Txt text="이름" fontSize={30} fill={colors.text} fontFamily={fonts.main} x={70} />
              </Node>
              <Node x={120}>
                <Rect width={40} height={40} radius={8} fill={colors.primary} />
                <Txt text="연락처" fontSize={30} fill={colors.text} fontFamily={fonts.main} x={85} />
              </Node>
            </Rect>
          </Node>
        </Rect>
      </Node>

      {/* 카드 3: 메시지 설정 */}
      <Node ref={card3} y={startY} opacity={0} scale={0.85}>
        <Rect width={900} height={500} radius={32} fill={colors.white} shadowColor={'#00000025'} shadowBlur={50} shadowOffsetY={15}>
          <Node y={-150}>
            <Circle width={100} height={100} fill={colors.success + '20'} x={-230}>
              <Txt text="💬" fontSize={52} fontFamily={fonts.main} />
            </Circle>
            <Txt text="메시지 설정" fontSize={56} fontWeight={800} fill={colors.text} fontFamily={fonts.main} x={30} />
          </Node>

          <Txt text="알림 문구 자유롭게 커스텀" fontSize={36} fill={colors.textMuted} fontFamily={fonts.main} y={0} />

          <Node y={140}>
            <Rect width={700} height={100} radius={16} fill={colors.wireframe}>
              <Rect width={500} height={70} radius={14} fill={colors.success}>
                <Txt text="감사합니다! 🎉" fontSize={32} fontWeight={500} fill={colors.white} fontFamily={fonts.main} />
              </Rect>
            </Rect>
          </Node>
        </Rect>
      </Node>

      {/* 키포인트 */}
      <Rect
        ref={keypoint}
        width={900}
        height={120}
        radius={20}
        fill={colors.warning + '20'}
        stroke={colors.warning}
        lineWidth={3}
        y={780}
        opacity={0}
      >
        <Txt
          text="🛠️ 필요한 기능만 골라 사용"
          fontSize={48}
          fontWeight={700}
          fill={colors.warning}
          fontFamily={fonts.main}
        />
      </Rect>
    </Node>
  );

  // === 애니메이션 ===

  // 타이틀 등장
  yield* all(
    stepLabel().opacity(1, 0.25),
    stepLabel().y(-830, 0.25, easeOutCubic),
    title().opacity(1, 0.3),
    title().y(-750, 0.3, easeOutCubic),
  );

  // 카드 1: 아래 → 가운데 → 위로 사라짐
  yield* all(
    card1().opacity(1, 0.25),
    card1().y(centerY, 0.35, easeOutCubic),
    card1().scale(1, 0.35, easeOutBack),
  );
  yield* waitFor(0.5);
  yield* all(
    card1().y(endY, 0.3, easeInCubic),
    card1().opacity(0, 0.25),
    card1().scale(0.85, 0.3),
  );

  // 카드 2
  yield* all(
    card2().opacity(1, 0.25),
    card2().y(centerY, 0.35, easeOutCubic),
    card2().scale(1, 0.35, easeOutBack),
  );
  yield* waitFor(0.5);
  yield* all(
    card2().y(endY, 0.3, easeInCubic),
    card2().opacity(0, 0.25),
    card2().scale(0.85, 0.3),
  );

  // 카드 3
  yield* all(
    card3().opacity(1, 0.25),
    card3().y(centerY, 0.35, easeOutCubic),
    card3().scale(1, 0.35, easeOutBack),
  );
  yield* waitFor(0.5);

  // 키포인트 등장
  yield* all(
    keypoint().opacity(1, 0.25),
    keypoint().y(760, 0.25, easeOutCubic),
  );

  yield* waitFor(0.8);

  // 페이드 아웃
  yield* root().opacity(0, 0.25);
});
