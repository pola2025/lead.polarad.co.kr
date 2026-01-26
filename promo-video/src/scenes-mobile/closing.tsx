import { makeScene2D, Rect, Txt, Node } from '@motion-canvas/2d';
import { all, waitFor, createRef, easeOutCubic, easeOutBack } from '@motion-canvas/core';
import { colors, fonts, fontSize, canvas } from '../components/styles-mobile';

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
      {/* 상단 문구 */}
      <Txt
        text="폴라애드와 함께"
        fontSize={fontSize['2xl']}
        fontWeight={600}
        fill={colors.textLight}
        fontFamily={fonts.main}
        y={-800}
      />

      {/* 핵심 수치들 - 세로 배치 */}
      <Node y={-450}>
        {/* 수치 1: 10초 접수 */}
        <Node ref={stat1} y={-200} opacity={0} scale={0.8}>
          <Rect width={700} height={180} radius={24} fill={colors.primary + '15'}>
            <Txt text="⚡" fontSize={60} fontFamily={fonts.main} x={-240} />
            <Node x={40}>
              <Txt text="10초" fontSize={72} fontWeight={900} fill={colors.primary} fontFamily={fonts.main} y={-20} />
              <Txt text="만에 접수 완료" fontSize={32} fill={colors.textMuted} fontFamily={fonts.main} y={40} />
            </Node>
          </Rect>
        </Node>

        {/* 수치 2: 실시간 알림 */}
        <Node ref={stat2} y={0} opacity={0} scale={0.8}>
          <Rect width={700} height={180} radius={24} fill={colors.telegram + '15'}>
            <Txt text="🔔" fontSize={60} fontFamily={fonts.main} x={-240} />
            <Node x={40}>
              <Txt text="실시간" fontSize={72} fontWeight={900} fill={colors.telegram} fontFamily={fonts.main} y={-20} />
              <Txt text="텔레그램 알림" fontSize={32} fill={colors.textMuted} fontFamily={fonts.main} y={40} />
            </Node>
          </Rect>
        </Node>

        {/* 수치 3: 전환율 */}
        <Node ref={stat3} y={200} opacity={0} scale={0.8}>
          <Rect width={700} height={180} radius={24} fill={colors.success + '15'}>
            <Txt text="📈" fontSize={60} fontFamily={fonts.main} x={-240} />
            <Node x={40}>
              <Txt text="23%" fontSize={72} fontWeight={900} fill={colors.success} fontFamily={fonts.main} y={-20} />
              <Txt text="평균 전환율" fontSize={32} fill={colors.textMuted} fontFamily={fonts.main} y={40} />
            </Node>
          </Rect>
        </Node>
      </Node>

      {/* 가격 섹션 */}
      <Node ref={priceSection} y={200} opacity={0}>
        <Txt
          text="이 모든 것을"
          fontSize={56}
          fontWeight={600}
          fill={colors.textLight}
          fontFamily={fonts.main}
          y={-100}
        />

        <Rect
          ref={priceTag}
          width={900}
          height={200}
          radius={32}
          fill={colors.warning + '20'}
          stroke={colors.warning}
          lineWidth={4}
          y={60}
          scale={0.9}
        >
          <Txt text="하루" fontSize={48} fontWeight={500} fill={colors.textLight} fontFamily={fonts.main} x={-280} />
          <Txt text="1,000원" fontSize={100} fontWeight={900} fill={colors.warning} fontFamily={fonts.main} x={30} />
          <Txt text="으로" fontSize={48} fontWeight={500} fill={colors.textLight} fontFamily={fonts.main} x={300} />
        </Rect>

        <Txt
          text="* 월 30,000원 (VAT 별도)"
          fontSize={32}
          fill={colors.textMuted}
          fontFamily={fonts.main}
          y={220}
        />
      </Node>

      {/* CTA 버튼 */}
      <Node ref={cta} y={50} opacity={0}>
        <Rect
          width={700}
          height={140}
          radius={70}
          fill={colors.primary}
          shadowColor={colors.primary + '60'}
          shadowBlur={40}
          shadowOffsetY={12}
        >
          <Txt
            text="지금 시작하기 →"
            fontSize={56}
            fontWeight={700}
            fill={colors.white}
            fontFamily={fonts.main}
          />
        </Rect>

        <Txt
          text="polarad.co.kr"
          fontSize={48}
          fontWeight={500}
          fill={colors.textLight}
          fontFamily={fonts.main}
          y={120}
        />
      </Node>
    </Node>
  );

  // === 애니메이션 ===

  yield* waitFor(0.1);

  // 핵심 수치들 순차 등장
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

  // 이전 요소들 페이드 아웃
  yield* all(
    stat1().opacity(0, 0.2),
    stat2().opacity(0, 0.2),
    stat3().opacity(0, 0.2),
    priceSection().opacity(0, 0.2),
  );

  yield* waitFor(0.1);

  // CTA 버튼 등장
  yield* all(
    cta().opacity(1, 0.25),
    cta().y(0, 0.25, easeOutCubic),
  );

  yield* waitFor(1.5);

  // 페이드 아웃
  yield* root().opacity(0, 0.25);
});
