import { makeScene2D, Rect, Txt, Node } from '@motion-canvas/2d';
import { all, waitFor, createRef, easeOutCubic, easeOutBack } from '@motion-canvas/core';
import { colors, fonts, fontSize, canvas } from '../components/styles';

export default makeScene2D(function* (view) {
  view.fill(colors.bgDark);
  view.size([canvas.width, canvas.height]);

  const root = createRef<Node>();

  // 핵심 수치들
  const stat1 = createRef<Node>();
  const stat2 = createRef<Node>();
  const stat3 = createRef<Node>();

  // 가격 섹션
  const priceSection = createRef<Node>();
  const priceTag = createRef<Rect>();

  // CTA
  const cta = createRef<Node>();

  view.add(
    <Node ref={root}>
      {/* 핵심 수치 섹션 */}
      <Node y={-550}>
        <Txt
          text="폴라애드와 함께"
          fontSize={fontSize['3xl']}
          fontWeight={600}
          fill={colors.textLight}
          fontFamily={fonts.main}
          y={-150}
        />

        <Node y={100}>
          {/* 수치 1: 10초 접수 */}
          <Node ref={stat1} x={-800} opacity={0} scale={0.8}>
            <Rect width={500} height={350} radius={24} fill={colors.primary + '15'}>
              <Txt text="⚡" fontSize={80} fontFamily={fonts.main} y={-100} />
              <Txt text="10초" fontSize={fontSize['3xl']} fontWeight={900} fill={colors.primary} fontFamily={fonts.main} y={20} />
              <Txt text="만에 접수 완료" fontSize={fontSize.lg} fill={colors.textMuted} fontFamily={fonts.main} y={130} />
            </Rect>
          </Node>

          {/* 수치 2: 실시간 알림 */}
          <Node ref={stat2} x={0} opacity={0} scale={0.8}>
            <Rect width={500} height={350} radius={24} fill={colors.telegram + '15'}>
              <Txt text="🔔" fontSize={80} fontFamily={fonts.main} y={-100} />
              <Txt text="실시간" fontSize={fontSize['3xl']} fontWeight={900} fill={colors.telegram} fontFamily={fonts.main} y={20} />
              <Txt text="텔레그램 알림" fontSize={fontSize.lg} fill={colors.textMuted} fontFamily={fonts.main} y={130} />
            </Rect>
          </Node>

          {/* 수치 3: 전환율 */}
          <Node ref={stat3} x={800} opacity={0} scale={0.8}>
            <Rect width={500} height={350} radius={24} fill={colors.success + '15'}>
              <Txt text="📈" fontSize={80} fontFamily={fonts.main} y={-100} />
              <Txt text="23%" fontSize={fontSize['3xl']} fontWeight={900} fill={colors.success} fontFamily={fonts.main} y={20} />
              <Txt text="평균 전환율" fontSize={fontSize.lg} fill={colors.textMuted} fontFamily={fonts.main} y={130} />
            </Rect>
          </Node>
        </Node>
      </Node>

      {/* 가격 섹션 */}
      <Node ref={priceSection} y={200} opacity={0}>
        <Txt
          text="이 모든 것을"
          fontSize={fontSize['2xl']}
          fill={colors.textLight}
          fontFamily={fonts.main}
          y={-80}
        />

        <Rect
          ref={priceTag}
          width={1800}
          height={380}
          radius={40}
          fill={colors.warning + '20'}
          stroke={colors.warning}
          lineWidth={4}
          y={220}
          scale={0.9}
        >
          <Txt text="하루" fontSize={fontSize['2xl']} fill={colors.textLight} fontFamily={fonts.main} x={-700} />
          <Txt text="1,000원" fontSize={fontSize.hero} fontWeight={900} fill={colors.warning} fontFamily={fonts.main} x={0} />
          <Txt text="으로" fontSize={fontSize['2xl']} fill={colors.textLight} fontFamily={fonts.main} x={680} />
        </Rect>

        <Txt
          text="* 월 30,000원 (VAT 별도)"
          fontSize={fontSize.xl}
          fill={colors.textMuted}
          fontFamily={fonts.main}
          y={480}
        />
      </Node>

      {/* CTA 버튼 - 화면 중앙 */}
      <Node ref={cta} y={50} opacity={0}>
        <Rect
          width={900}
          height={180}
          radius={90}
          fill={colors.primary}
          shadowColor={colors.primary + '60'}
          shadowBlur={60}
          shadowOffsetY={15}
        >
          <Txt
            text="지금 시작하기 →"
            fontSize={fontSize['3xl']}
            fontWeight={700}
            fill={colors.white}
            fontFamily={fonts.main}
          />
        </Rect>

        <Txt
          text="polarad.co.kr"
          fontSize={fontSize['2xl']}
          fill={colors.textLight}
          fontFamily={fonts.main}
          y={180}
        />
      </Node>
    </Node>
  );

  // === 애니메이션 (45초 버전 - 순차 유지) ===

  // 핵심 수치들 순차 등장 (빠르게)
  yield* waitFor(0.1);

  yield* all(
    stat1().opacity(1, 0.2),
    stat1().scale(1, 0.2, easeOutBack),
  );
  yield* all(
    stat2().opacity(1, 0.2),
    stat2().scale(1, 0.2, easeOutBack),
  );
  yield* all(
    stat3().opacity(1, 0.2),
    stat3().scale(1, 0.2, easeOutBack),
  );

  yield* waitFor(0.15);

  // 가격 섹션 등장
  yield* priceSection().opacity(1, 0.2);

  yield* waitFor(0.1);

  // 가격 태그 강조
  yield* priceTag().scale(1, 0.2, easeOutBack);

  yield* waitFor(0.25);

  // 이전 요소들 페이드 아웃 (CTA 등장 전)
  yield* all(
    stat1().opacity(0, 0.2),
    stat2().opacity(0, 0.2),
    stat3().opacity(0, 0.2),
    priceSection().opacity(0, 0.2),
  );

  yield* waitFor(0.1);

  // CTA 버튼 등장 (화면 중앙)
  yield* all(
    cta().opacity(1, 0.25),
    cta().y(0, 0.25, easeOutCubic),
  );

  yield* waitFor(1.5);

  // 페이드 아웃
  yield* root().opacity(0, 0.25);

});
