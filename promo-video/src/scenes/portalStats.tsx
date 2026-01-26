import { makeScene2D, Rect, Txt, Circle, Node, Line } from '@motion-canvas/2d';
import { all, chain, waitFor, createRef, easeOutCubic, easeOutBack, easeInOutCubic } from '@motion-canvas/core';
import { colors, fonts, fontSize, canvas, spacing, desktop } from '../components/styles';

export default makeScene2D(function* (view) {
  view.fill(colors.bgDark);
  view.size([canvas.width, canvas.height]);

  const root = createRef<Node>();
  const stepLabel = createRef<Txt>();
  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();
  const keypoint = createRef<Rect>();

  // PC 브라우저
  const browser = createRef<Node>();
  const statCards = [createRef<Node>(), createRef<Node>(), createRef<Node>(), createRef<Node>()];
  const funnelBars = [createRef<Rect>(), createRef<Rect>(), createRef<Rect>()];
  const chartLine = createRef<Node>();

  view.add(
    <Node ref={root}>
      {/* 상단 텍스트 */}
      <Node y={-900}>
        <Txt
          ref={stepLabel}
          text="STEP 05"
          fontSize={fontSize.lg}
          fontWeight={600}
          fill={colors.success}
          fontFamily={fonts.main}
          opacity={0}
        />

        <Txt
          ref={title}
          text="통계 대시보드"
          fontSize={fontSize['4xl']}
          fontWeight={900}
          fill={colors.white}
          fontFamily={fonts.main}
          y={130}
          opacity={0}
        />

        <Txt
          ref={subtitle}
          text="광고 성과를 한눈에 파악"
          fontSize={fontSize.xl}
          fill={colors.textLight}
          fontFamily={fonts.main}
          y={260}
          opacity={0}
        />
      </Node>

      {/* PC 브라우저 */}
      <Node ref={browser} y={200} opacity={0} scale={0.85}>
        <Rect
          width={desktop.frameWidth}
          height={desktop.frameHeight}
          radius={desktop.borderRadius}
          fill={colors.deviceFrame}
          shadowColor={'#00000066'}
          shadowBlur={80}
          shadowOffsetY={30}
        />

        {/* 브라우저 툴바 */}
        <Rect
          width={desktop.width}
          height={desktop.toolbarHeight}
          radius={[desktop.borderRadius - 4, desktop.borderRadius - 4, 0, 0]}
          fill={colors.browserBar}
          y={-desktop.height / 2 - 30 + desktop.toolbarHeight / 2}
        >
          <Circle width={20} height={20} fill={'#ef4444'} x={-desktop.width / 2 + 60} />
          <Circle width={20} height={20} fill={'#f59e0b'} x={-desktop.width / 2 + 100} />
          <Circle width={20} height={20} fill={'#10b981'} x={-desktop.width / 2 + 140} />

          <Rect width={800} height={40} radius={8} fill={colors.deviceFrame} x={0}>
            <Txt text="📊 portal.polalead.com/stats" fontSize={22} fill={colors.textLight} fontFamily={fonts.main} />
          </Rect>
        </Rect>

        {/* 대시보드 내용 */}
        <Rect
          width={desktop.width}
          height={desktop.height - desktop.toolbarHeight}
          fill={colors.bgLight}
          y={30}
          clip
        >
          {/* 상단 통계 카드들 */}
          <Node y={-450}>
            {/* 총 리드 */}
            <Node ref={statCards[0]} x={-900} opacity={0}>
              <Rect width={420} height={180} radius={16} fill={colors.white} shadowColor={'#00000010'} shadowBlur={20}>
                <Txt text="총 리드" fontSize={24} fill={colors.textMuted} fontFamily={fonts.main} y={-55} />
                <Txt text="1,247" fontSize={52} fontWeight={800} fill={colors.text} fontFamily={fonts.main} y={15} x={-60} />
                <Txt text="▲ 12.5%" fontSize={20} fontWeight={600} fill={colors.success} fontFamily={fonts.main} x={90} y={15} />
              </Rect>
            </Node>

            {/* 전환율 */}
            <Node ref={statCards[1]} x={-420} opacity={0}>
              <Rect width={420} height={180} radius={16} fill={colors.white} shadowColor={'#00000010'} shadowBlur={20}>
                <Txt text="전환율" fontSize={24} fill={colors.textMuted} fontFamily={fonts.main} y={-55} />
                <Txt text="23.4%" fontSize={52} fontWeight={800} fill={colors.success} fontFamily={fonts.main} y={15} x={-60} />
                <Txt text="▲ 3.2%p" fontSize={20} fontWeight={600} fill={colors.success} fontFamily={fonts.main} x={90} y={15} />
              </Rect>
            </Node>

            {/* 평균 CPL */}
            <Node ref={statCards[2]} x={60} opacity={0}>
              <Rect width={420} height={180} radius={16} fill={colors.white} shadowColor={'#00000010'} shadowBlur={20}>
                <Txt text="평균 CPL" fontSize={24} fill={colors.textMuted} fontFamily={fonts.main} y={-55} />
                <Txt text="$12.50" fontSize={52} fontWeight={800} fill={colors.primary} fontFamily={fonts.main} y={15} x={-60} />
                <Txt text="▼ 8.3%" fontSize={20} fontWeight={600} fill={colors.success} fontFamily={fonts.main} x={90} y={15} />
              </Rect>
            </Node>

            {/* 이번 주 전환 */}
            <Node ref={statCards[3]} x={540} opacity={0}>
              <Rect width={420} height={180} radius={16} fill={colors.white} shadowColor={'#00000010'} shadowBlur={20}>
                <Txt text="이번 주 전환" fontSize={24} fill={colors.textMuted} fontFamily={fonts.main} y={-55} />
                <Txt text="89건" fontSize={52} fontWeight={800} fill={colors.purple} fontFamily={fonts.main} y={15} x={-60} />
                <Txt text="▲ 15%" fontSize={20} fontWeight={600} fill={colors.success} fontFamily={fonts.main} x={90} y={15} />
              </Rect>
            </Node>
          </Node>

          {/* 퍼널 차트 */}
          <Node x={-550} y={100}>
            <Rect width={800} height={500} radius={16} fill={colors.white} shadowColor={'#00000010'} shadowBlur={20}>
              <Txt text="전환 퍼널" fontSize={32} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-200} x={-280} />

              {/* 퍼널 바 - 왼쪽 정렬 */}
              <Node y={50} x={-350}>
                <Node y={-100}>
                  <Rect ref={funnelBars[0]} width={0} height={70} radius={8} fill={colors.primary} offsetX={-1} />
                  <Txt text="신규 1,247" fontSize={24} fontWeight={600} fill={colors.white} fontFamily={fonts.main} x={80} />
                </Node>

                <Node y={0}>
                  <Rect ref={funnelBars[1]} width={0} height={70} radius={8} fill={colors.success} offsetX={-1} />
                  <Txt text="연락완료 543" fontSize={24} fontWeight={600} fill={colors.white} fontFamily={fonts.main} x={80} />
                </Node>

                <Node y={100}>
                  <Rect ref={funnelBars[2]} width={0} height={70} radius={8} fill={colors.purple} offsetX={-1} />
                  <Txt text="전환 292" fontSize={24} fontWeight={600} fill={colors.white} fontFamily={fonts.main} x={80} />
                </Node>
              </Node>
            </Rect>
          </Node>

          {/* 라인 차트 */}
          <Node x={450} y={100}>
            <Rect width={800} height={500} radius={16} fill={colors.white} shadowColor={'#00000010'} shadowBlur={20}>
              <Txt text="일별 리드 추이" fontSize={32} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-200} x={-230} />

              <Node ref={chartLine} opacity={0}>
                {/* 차트 그리드 */}
                <Node y={30}>
                  <Rect width={680} height={2} fill={colors.wireframe} y={-100} />
                  <Rect width={680} height={2} fill={colors.wireframe} y={0} />
                  <Rect width={680} height={2} fill={colors.wireframe} y={100} />

                  {/* 라인 포인트들 */}
                  <Circle width={16} height={16} fill={colors.primary} x={-300} y={50} />
                  <Circle width={16} height={16} fill={colors.primary} x={-200} y={-20} />
                  <Circle width={16} height={16} fill={colors.primary} x={-100} y={30} />
                  <Circle width={16} height={16} fill={colors.primary} x={0} y={-60} />
                  <Circle width={16} height={16} fill={colors.primary} x={100} y={-30} />
                  <Circle width={16} height={16} fill={colors.primary} x={200} y={-80} />
                  <Circle width={16} height={16} fill={colors.primary} x={300} y={-100} />

                  {/* 라인 */}
                  <Line
                    points={[
                      [-300, 50],
                      [-200, -20],
                      [-100, 30],
                      [0, -60],
                      [100, -30],
                      [200, -80],
                      [300, -100],
                    ]}
                    stroke={colors.primary}
                    lineWidth={4}
                    radius={8}
                  />

                  {/* X축 라벨 */}
                  <Txt text="월" fontSize={20} fill={colors.textMuted} fontFamily={fonts.main} x={-300} y={150} />
                  <Txt text="화" fontSize={20} fill={colors.textMuted} fontFamily={fonts.main} x={-200} y={150} />
                  <Txt text="수" fontSize={20} fill={colors.textMuted} fontFamily={fonts.main} x={-100} y={150} />
                  <Txt text="목" fontSize={20} fill={colors.textMuted} fontFamily={fonts.main} x={0} y={150} />
                  <Txt text="금" fontSize={20} fill={colors.textMuted} fontFamily={fonts.main} x={100} y={150} />
                  <Txt text="토" fontSize={20} fill={colors.textMuted} fontFamily={fonts.main} x={200} y={150} />
                  <Txt text="일" fontSize={20} fill={colors.textMuted} fontFamily={fonts.main} x={300} y={150} />
                </Node>
              </Node>
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
        fill={colors.success + '20'}
        stroke={colors.success}
        lineWidth={3}
        y={1000}
        opacity={0}
      >
        <Txt
          text="📊 한눈에 보는 광고 성과"
          fontSize={fontSize.xl}
          fontWeight={600}
          fill={colors.success}
          fontFamily={fonts.main}
        />
      </Rect>
    </Node>
  );

  // === 애니메이션 (45초 버전 - 순차 유지) ===

  // 타이틀 순차 등장
  yield* stepLabel().opacity(1, 0.2);
  yield* all(
    title().opacity(1, 0.25),
    title().y(150, 0.25, easeOutCubic),
  );
  yield* all(
    subtitle().opacity(1, 0.2),
    subtitle().y(280, 0.2, easeOutCubic),
  );

  yield* waitFor(0.1);

  // 브라우저 등장
  yield* all(
    browser().opacity(1, 0.3),
    browser().scale(0.9, 0.3, easeOutCubic),
  );

  yield* waitFor(0.1);

  // 통계 카드들 순차 등장 (빠르게)
  yield* statCards[0]().opacity(1, 0.12);
  yield* statCards[1]().opacity(1, 0.12);
  yield* statCards[2]().opacity(1, 0.12);
  yield* statCards[3]().opacity(1, 0.12);

  yield* waitFor(0.1);

  // 퍼널 바 순차 애니메이션 (빠르게)
  yield* funnelBars[0]().width(600, 0.25, easeOutCubic);
  yield* funnelBars[1]().width(400, 0.25, easeOutCubic);
  yield* funnelBars[2]().width(220, 0.25, easeOutCubic);

  yield* waitFor(0.1);

  // 라인 차트 등장
  yield* chartLine().opacity(1, 0.25);

  yield* waitFor(0.15);

  // 키포인트 등장
  yield* all(
    keypoint().opacity(1, 0.2),
    keypoint().y(970, 0.2, easeOutCubic),
  );

  yield* waitFor(1);

  // 페이드 아웃
  yield* root().opacity(0, 0.25);

});
