import { makeScene2D, Rect, Txt, Circle, Node, Line } from '@motion-canvas/2d';
import { all, waitFor, createRef, easeOutCubic, easeInOutCubic } from '@motion-canvas/core';
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

  // Phase 2: 통계 대시보드 (크게)
  const dashboard = createRef<Node>();
  const statCards = [createRef<Node>(), createRef<Node>()];
  const funnelBars = [createRef<Rect>(), createRef<Rect>(), createRef<Rect>()];
  const chartLine = createRef<Node>();

  // 키포인트
  const keypoint = createRef<Rect>();

  view.add(
    <Node ref={root}>
      {/* === Phase 1: 텍스트 영역 === */}
      <Node ref={textArea}>
        <Txt
          ref={stepLabel}
          text="STEP 05"
          fontSize={fontSize.xl}
          fontWeight={600}
          fill={colors.success}
          fontFamily={fonts.main}
          y={-400}
          opacity={0}
        />

        <Txt
          ref={title}
          text={"통계\n대시보드"}
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
          text={"광고 성과를\n한눈에 파악"}
          fontSize={fontSize.xl}
          fill={colors.textLight}
          fontFamily={fonts.main}
          y={60}
          opacity={0}
          lineHeight={'150%'}
        />

        {/* 미리보기 수치 */}
        <Node y={250} opacity={0}>
          <Node x={-120}>
            <Txt text="1,247" fontSize={fontSize['2xl']} fontWeight={800} fill={colors.primary} fontFamily={fonts.main} />
            <Txt text="총 리드" fontSize={14} fill={colors.textLight} fontFamily={fonts.main} y={35} />
          </Node>

          <Node x={120}>
            <Txt text="23.4%" fontSize={fontSize['2xl']} fontWeight={800} fill={colors.success} fontFamily={fonts.main} />
            <Txt text="전환율" fontSize={14} fill={colors.textLight} fontFamily={fonts.main} y={35} />
          </Node>
        </Node>
      </Node>

      {/* === Phase 2: 통계 대시보드 (크게 꽉 참) === */}
      <Node ref={dashboard} y={0} opacity={0} scale={1.8}>
        {/* 배경 카드 */}
        <Rect
          width={520}
          height={900}
          radius={30}
          fill={colors.bgLight}
          shadowColor={'#00000030'}
          shadowBlur={50}
          shadowOffsetY={15}
        />

        {/* 통계 카드 - 상단 2열 */}
        <Node y={-350}>
          <Node ref={statCards[0]} x={-120} opacity={0}>
            <Rect width={200} height={90} radius={14} fill={colors.white} shadowColor={'#00000012'} shadowBlur={12}>
              <Txt text="총 리드" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} y={-25} />
              <Txt text="1,247" fontSize={28} fontWeight={800} fill={colors.text} fontFamily={fonts.main} y={10} x={-15} />
              <Txt text="▲12%" fontSize={10} fontWeight={600} fill={colors.success} fontFamily={fonts.main} x={50} y={10} />
            </Rect>
          </Node>

          <Node ref={statCards[1]} x={120} opacity={0}>
            <Rect width={200} height={90} radius={14} fill={colors.white} shadowColor={'#00000012'} shadowBlur={12}>
              <Txt text="전환율" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} y={-25} />
              <Txt text="23.4%" fontSize={28} fontWeight={800} fill={colors.success} fontFamily={fonts.main} y={10} x={-15} />
              <Txt text="▲3%p" fontSize={10} fontWeight={600} fill={colors.success} fontFamily={fonts.main} x={50} y={10} />
            </Rect>
          </Node>
        </Node>

        {/* 퍼널 차트 */}
        <Node y={-150}>
          <Rect width={440} height={200} radius={16} fill={colors.white} shadowColor={'#00000012'} shadowBlur={12}>
            <Txt text="전환 퍼널" fontSize={16} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-75} x={-150} />

            <Node y={10} x={-180}>
              <Node y={-40}>
                <Rect ref={funnelBars[0]} width={0} height={32} radius={5} fill={colors.primary} offsetX={-1} />
                <Txt text="신규 1,247" fontSize={12} fontWeight={600} fill={colors.white} fontFamily={fonts.main} x={40} />
              </Node>

              <Node y={5}>
                <Rect ref={funnelBars[1]} width={0} height={32} radius={5} fill={colors.success} offsetX={-1} />
                <Txt text="연락 543" fontSize={12} fontWeight={600} fill={colors.white} fontFamily={fonts.main} x={40} />
              </Node>

              <Node y={50}>
                <Rect ref={funnelBars[2]} width={0} height={32} radius={5} fill={colors.purple} offsetX={-1} />
                <Txt text="전환 292" fontSize={12} fontWeight={600} fill={colors.white} fontFamily={fonts.main} x={40} />
              </Node>
            </Node>
          </Rect>
        </Node>

        {/* 라인 차트 */}
        <Node y={110}>
          <Rect width={440} height={220} radius={16} fill={colors.white} shadowColor={'#00000012'} shadowBlur={12}>
            <Txt text="일별 리드 추이" fontSize={16} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-85} x={-125} />

            <Node ref={chartLine} opacity={0} y={15}>
              {/* 그리드 */}
              <Rect width={360} height={1} fill={colors.wireframe} y={-40} />
              <Rect width={360} height={1} fill={colors.wireframe} y={0} />
              <Rect width={360} height={1} fill={colors.wireframe} y={40} />

              {/* 포인트 */}
              <Circle width={8} height={8} fill={colors.primary} x={-150} y={25} />
              <Circle width={8} height={8} fill={colors.primary} x={-90} y={-5} />
              <Circle width={8} height={8} fill={colors.primary} x={-30} y={12} />
              <Circle width={8} height={8} fill={colors.primary} x={30} y={-30} />
              <Circle width={8} height={8} fill={colors.primary} x={90} y={-12} />
              <Circle width={8} height={8} fill={colors.primary} x={150} y={-38} />

              {/* 라인 */}
              <Line
                points={[
                  [-150, 25],
                  [-90, -5],
                  [-30, 12],
                  [30, -30],
                  [90, -12],
                  [150, -38],
                ]}
                stroke={colors.primary}
                lineWidth={2}
                radius={5}
              />

              {/* X축 라벨 */}
              <Txt text="월" fontSize={10} fill={colors.textMuted} fontFamily={fonts.main} x={-150} y={65} />
              <Txt text="화" fontSize={10} fill={colors.textMuted} fontFamily={fonts.main} x={-90} y={65} />
              <Txt text="수" fontSize={10} fill={colors.textMuted} fontFamily={fonts.main} x={-30} y={65} />
              <Txt text="목" fontSize={10} fill={colors.textMuted} fontFamily={fonts.main} x={30} y={65} />
              <Txt text="금" fontSize={10} fill={colors.textMuted} fontFamily={fonts.main} x={90} y={65} />
              <Txt text="토" fontSize={10} fill={colors.textMuted} fontFamily={fonts.main} x={150} y={65} />
            </Node>
          </Rect>
        </Node>

        {/* 추가 통계 */}
        <Node y={320}>
          <Node x={-120}>
            <Rect width={200} height={70} radius={12} fill={colors.primary + '15'}>
              <Txt text="평균 CPL" fontSize={10} fill={colors.textMuted} fontFamily={fonts.main} y={-15} />
              <Txt text="$12.50" fontSize={20} fontWeight={700} fill={colors.primary} fontFamily={fonts.main} y={12} />
            </Rect>
          </Node>

          <Node x={120}>
            <Rect width={200} height={70} radius={12} fill={colors.purple + '15'}>
              <Txt text="이번 주 전환" fontSize={10} fill={colors.textMuted} fontFamily={fonts.main} y={-15} />
              <Txt text="89건" fontSize={20} fontWeight={700} fill={colors.purple} fontFamily={fonts.main} y={12} />
            </Rect>
          </Node>
        </Node>
      </Node>

      {/* 키포인트 */}
      <Rect
        ref={keypoint}
        width={380}
        height={60}
        radius={16}
        fill={colors.success + '20'}
        stroke={colors.success}
        lineWidth={2}
        y={800}
        opacity={0}
      >
        <Txt
          text="📊 한눈에 보는 광고 성과"
          fontSize={fontSize.lg}
          fontWeight={600}
          fill={colors.success}
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

  yield* waitFor(0.6);

  // Phase 2: 텍스트 페이드아웃
  yield* textArea().opacity(0, 0.3, easeInOutCubic);

  yield* waitFor(0.1);

  // Phase 3: 대시보드 크게 등장
  yield* all(
    dashboard().opacity(1, 0.4),
    dashboard().scale(2.0, 0.4, easeOutCubic),
  );

  yield* waitFor(0.15);

  // 통계 카드 등장
  yield* all(
    statCards[0]().opacity(1, 0.15),
    statCards[1]().opacity(1, 0.15),
  );

  yield* waitFor(0.1);

  // 퍼널 바 애니메이션
  yield* funnelBars[0]().width(280, 0.3, easeOutCubic);
  yield* funnelBars[1]().width(190, 0.3, easeOutCubic);
  yield* funnelBars[2]().width(100, 0.3, easeOutCubic);

  yield* waitFor(0.1);

  // 라인 차트 등장
  yield* chartLine().opacity(1, 0.3);

  yield* waitFor(0.2);

  // 키포인트 등장
  yield* all(
    keypoint().opacity(1, 0.25),
    keypoint().y(780, 0.25, easeOutCubic),
  );

  yield* waitFor(1);

  // 페이드 아웃
  yield* root().opacity(0, 0.25);
});
