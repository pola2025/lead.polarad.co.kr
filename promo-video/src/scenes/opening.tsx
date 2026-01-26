import { makeScene2D, Rect, Txt, Node } from '@motion-canvas/2d';
import { all, waitFor, createRef, easeOutCubic } from '@motion-canvas/core';
import { colors, fonts, fontSize, canvas } from '../components/styles';

export default makeScene2D(function* (view) {
  // 4K 설정
  view.fill(colors.bgDark);
  view.size([canvas.width, canvas.height]);

  const root = createRef<Node>();
  const logo = createRef<Txt>();
  const title1 = createRef<Txt>();
  const title2 = createRef<Txt>();
  const tag1 = createRef<Rect>();
  const tag2 = createRef<Rect>();
  const tag3 = createRef<Rect>();
  const subtitle = createRef<Txt>();

  view.add(
    <Node ref={root}>
      {/* 로고 */}
      <Txt
        ref={logo}
        text="POLALEAD"
        fontSize={fontSize.xl}
        fontWeight={600}
        fill={colors.primary}
        fontFamily={fonts.main}
        y={-500}
        opacity={0}
      />

      {/* 메인 타이틀 */}
      <Txt
        ref={title1}
        text="고객 접수에 최적화된"
        fontSize={fontSize.hero}
        fontWeight={900}
        fill={colors.white}
        fontFamily={fonts.main}
        y={-200}
        opacity={0}
      />

      <Txt
        ref={title2}
        text="모바일 랜딩 서비스"
        fontSize={fontSize.hero}
        fontWeight={900}
        fill={colors.white}
        fontFamily={fonts.main}
        y={100}
        opacity={0}
      />

      {/* 서브타이틀 */}
      <Txt
        ref={subtitle}
        text="광고 리드 수집부터 관리까지, 원스톱 솔루션"
        fontSize={fontSize['2xl']}
        fill={colors.textLight}
        fontFamily={fonts.main}
        y={350}
        opacity={0}
      />

      {/* 태그들 */}
      <Node y={550}>
        <Rect
          ref={tag1}
          width={400}
          height={100}
          radius={50}
          fill={colors.primary}
          x={-500}
          opacity={0}
          scale={0.8}
        >
          <Txt
            text="모바일 최적화"
            fontSize={fontSize.lg}
            fontWeight={600}
            fill={colors.white}
            fontFamily={fonts.main}
          />
        </Rect>

        <Rect
          ref={tag2}
          width={400}
          height={100}
          radius={50}
          fill={colors.purple}
          x={0}
          opacity={0}
          scale={0.8}
        >
          <Txt
            text="실시간 알림"
            fontSize={fontSize.lg}
            fontWeight={600}
            fill={colors.white}
            fontFamily={fonts.main}
          />
        </Rect>

        <Rect
          ref={tag3}
          width={400}
          height={100}
          radius={50}
          fill={colors.success}
          x={500}
          opacity={0}
          scale={0.8}
        >
          <Txt
            text="간편 관리"
            fontSize={fontSize.lg}
            fontWeight={600}
            fill={colors.white}
            fontFamily={fonts.main}
          />
        </Rect>
      </Node>
    </Node>
  );

  // === 애니메이션 (45초 버전 - 순차 유지) ===

  // 로고 등장
  yield* all(
    logo().opacity(1, 0.25),
    logo().y(-450, 0.25, easeOutCubic),
  );

  // 타이틀 순차 등장
  yield* all(
    title1().opacity(1, 0.3),
    title1().y(-180, 0.3, easeOutCubic),
  );
  yield* all(
    title2().opacity(1, 0.3),
    title2().y(120, 0.3, easeOutCubic),
  );

  yield* waitFor(0.1);

  // 서브타이틀 등장
  yield* subtitle().opacity(1, 0.25);

  yield* waitFor(0.15);

  // 태그 순차 등장 (빠르게)
  yield* all(
    tag1().opacity(1, 0.15),
    tag1().scale(1, 0.15, easeOutCubic),
  );
  yield* all(
    tag2().opacity(1, 0.15),
    tag2().scale(1, 0.15, easeOutCubic),
  );
  yield* all(
    tag3().opacity(1, 0.15),
    tag3().scale(1, 0.15, easeOutCubic),
  );

  yield* waitFor(0.8);

  // 페이드 아웃
  yield* root().opacity(0, 0.25);

});
