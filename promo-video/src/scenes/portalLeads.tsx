import { makeScene2D, Rect, Txt, Circle, Node, Line } from '@motion-canvas/2d';
import { all, chain, waitFor, createRef, easeOutCubic, easeOutBack, easeInOutCubic } from '@motion-canvas/core';
import { colors, fonts, fontSize, canvas, spacing, mobile } from '../components/styles';

export default makeScene2D(function* (view) {
  view.fill(colors.bgDark);
  view.size([canvas.width, canvas.height]);

  const root = createRef<Node>();
  const stepLabel = createRef<Txt>();
  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();
  const keypoint = createRef<Rect>();

  // 모바일 포털 화면
  const phone = createRef<Node>();
  const leadCards = [createRef<Node>(), createRef<Node>(), createRef<Node>()];
  const statusBtns = [createRef<Node>(), createRef<Node>()];
  const actionHighlight = createRef<Rect>();
  const infoPanel = createRef<Node>();

  view.add(
    <Node ref={root}>
      {/* 상단 텍스트 - 왼쪽 정렬 */}
      <Node x={-1550} y={-750}>
        <Txt
          ref={stepLabel}
          text="STEP 04"
          fontSize={fontSize.lg}
          fontWeight={600}
          fill={colors.purple}
          fontFamily={fonts.main}
          opacity={0}
          offsetX={-1}
        />

        <Txt
          ref={title}
          text="접수 관리"
          fontSize={fontSize['4xl']}
          fontWeight={900}
          fill={colors.white}
          fontFamily={fonts.main}
          y={130}
          opacity={0}
          offsetX={-1}
        />

        <Txt
          ref={subtitle}
          text="모바일에서 바로 리드 상태 변경"
          fontSize={fontSize.xl}
          fill={colors.textLight}
          fontFamily={fonts.main}
          y={260}
          opacity={0}
          offsetX={-1}
        />
      </Node>

      {/* 모바일 포털 화면 */}
      <Node ref={phone} x={500} y={100} opacity={0} scale={1.5}>
        <Rect
          width={mobile.frameWidth + 40}
          height={mobile.frameHeight + 40}
          radius={mobile.borderRadius + 5}
          fill={colors.deviceFrame}
          shadowColor={'#00000066'}
          shadowBlur={80}
          shadowOffsetY={30}
        />

        <Rect
          width={mobile.width + 20}
          height={mobile.height + 20}
          radius={mobile.borderRadius - 5}
          fill={colors.deviceScreen}
          clip
        >
          {/* 포털 헤더 */}
          <Rect width={mobile.width + 20} height={100} fill={colors.primary} y={-510}>
            <Txt text="📋 접수관리" fontSize={36} fontWeight={700} fill={colors.white} fontFamily={fonts.main} />
          </Rect>

          {/* 필터 탭 */}
          <Node y={-400}>
            <Rect width={120} height={50} radius={25} fill={colors.primary} x={-180}>
              <Txt text="전체" fontSize={22} fontWeight={600} fill={colors.white} fontFamily={fonts.main} />
            </Rect>
            <Rect width={120} height={50} radius={25} fill={colors.wireframe} x={-40}>
              <Txt text="신규" fontSize={22} fill={colors.textMuted} fontFamily={fonts.main} />
            </Rect>
            <Rect width={120} height={50} radius={25} fill={colors.wireframe} x={100}>
              <Txt text="연락완료" fontSize={22} fill={colors.textMuted} fontFamily={fonts.main} />
            </Rect>
          </Node>

          {/* 리드 카드 1 */}
          <Node ref={leadCards[0]} y={-230} opacity={0}>
            <Rect
              width={480}
              height={150}
              radius={16}
              fill={colors.white}
              stroke={colors.wireframe}
              lineWidth={2}
              shadowColor={'#00000015'}
              shadowBlur={10}
              shadowOffsetY={4}
            >
              <Node x={-160}>
                <Txt text="김**" fontSize={28} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-35} />
                <Txt text="010-0000-0000" fontSize={22} fill={colors.textMuted} fontFamily={fonts.main} y={5} />
                <Txt text="01/24 10:15" fontSize={18} fill={colors.textLight} fontFamily={fonts.main} y={40} />
              </Node>

              <Rect width={80} height={36} radius={8} fill={colors.primary + '20'} x={140} y={-30}>
                <Txt text="신규" fontSize={18} fontWeight={600} fill={colors.primary} fontFamily={fonts.main} />
              </Rect>

              {/* 상태 변경 버튼들 */}
              <Node ref={statusBtns[0]} x={140} y={30} opacity={0}>
                <Rect width={90} height={36} radius={8} fill={colors.success} x={-50}>
                  <Txt text="연락완료" fontSize={14} fontWeight={600} fill={colors.white} fontFamily={fonts.main} />
                </Rect>
                <Rect width={70} height={36} radius={8} fill={colors.purple} x={40}>
                  <Txt text="전환" fontSize={14} fontWeight={600} fill={colors.white} fontFamily={fonts.main} />
                </Rect>
              </Node>
            </Rect>
          </Node>

          {/* 리드 카드 2 */}
          <Node ref={leadCards[1]} y={-50} opacity={0}>
            <Rect
              width={480}
              height={150}
              radius={16}
              fill={colors.white}
              stroke={colors.wireframe}
              lineWidth={2}
              shadowColor={'#00000015'}
              shadowBlur={10}
              shadowOffsetY={4}
            >
              <Node x={-160}>
                <Txt text="이**" fontSize={28} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-35} />
                <Txt text="010-0000-0000" fontSize={22} fill={colors.textMuted} fontFamily={fonts.main} y={5} />
                <Txt text="01/24 09:42" fontSize={18} fill={colors.textLight} fontFamily={fonts.main} y={40} />
              </Node>

              <Rect width={100} height={36} radius={8} fill={colors.success + '20'} x={140} y={-30}>
                <Txt text="연락완료" fontSize={18} fontWeight={600} fill={colors.success} fontFamily={fonts.main} />
              </Rect>

              <Node ref={statusBtns[1]} x={140} y={30} opacity={0}>
                <Rect width={70} height={36} radius={8} fill={colors.purple} x={0}>
                  <Txt text="전환" fontSize={14} fontWeight={600} fill={colors.white} fontFamily={fonts.main} />
                </Rect>
              </Node>
            </Rect>
          </Node>

          {/* 리드 카드 3 */}
          <Node ref={leadCards[2]} y={130} opacity={0}>
            <Rect
              width={480}
              height={150}
              radius={16}
              fill={colors.white}
              stroke={colors.wireframe}
              lineWidth={2}
              shadowColor={'#00000015'}
              shadowBlur={10}
              shadowOffsetY={4}
            >
              <Node x={-160}>
                <Txt text="박**" fontSize={28} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-35} />
                <Txt text="010-0000-0000" fontSize={22} fill={colors.textMuted} fontFamily={fonts.main} y={5} />
                <Txt text="01/23 18:30" fontSize={18} fill={colors.textLight} fontFamily={fonts.main} y={40} />
              </Node>

              <Rect width={80} height={36} radius={8} fill={colors.purple + '20'} x={140}>
                <Txt text="전환" fontSize={18} fontWeight={600} fill={colors.purple} fontFamily={fonts.main} />
              </Rect>
            </Rect>
          </Node>

          {/* 하단 네비게이션 */}
          <Node y={480}>
            <Rect width={mobile.width + 20} height={100} fill={colors.wireframe}>
              <Txt text="📋" fontSize={36} x={-180} />
              <Txt text="📊" fontSize={36} x={-60} />
              <Txt text="⚙️" fontSize={36} x={60} />
              <Txt text="👤" fontSize={36} x={180} />
            </Rect>
          </Node>
        </Rect>

        <Rect
          width={mobile.notchWidth}
          height={mobile.notchHeight}
          radius={24}
          fill={colors.deviceFrame}
          y={-mobile.height / 2 - 5}
        />

        {/* 터치 액션 하이라이트 */}
        <Rect
          ref={actionHighlight}
          width={500}
          height={160}
          radius={20}
          stroke={colors.purple}
          lineWidth={6}
          y={-230}
          opacity={0}
        />
      </Node>

      {/* 왼쪽 설명 패널 - 접수관리와 아이콘 시작점 정렬 */}
      <Node ref={infoPanel} x={-1550} y={-250} opacity={0}>
        <Node y={0}>
          <Circle width={100} height={100} fill={colors.primary + '20'} x={50}>
            <Txt text="📱" fontSize={50} fontFamily={fonts.main} />
          </Circle>
          <Txt text="모바일 최적화" fontSize={fontSize.xl} fontWeight={700} fill={colors.white} fontFamily={fonts.main} x={130} offsetX={-1} />
          <Txt text="이동 중에도 바로 확인" fontSize={fontSize.lg} fill={colors.textLight} fontFamily={fonts.main} x={130} y={70} offsetX={-1} />
        </Node>

        <Node y={250}>
          <Circle width={100} height={100} fill={colors.success + '20'} x={50}>
            <Txt text="✅" fontSize={50} fontFamily={fonts.main} />
          </Circle>
          <Txt text="원터치 상태 변경" fontSize={fontSize.xl} fontWeight={700} fill={colors.white} fontFamily={fonts.main} x={130} offsetX={-1} />
          <Txt text="신규 → 연락완료 → 전환" fontSize={fontSize.lg} fill={colors.textLight} fontFamily={fonts.main} x={130} y={70} offsetX={-1} />
        </Node>

        <Node y={500}>
          <Circle width={100} height={100} fill={colors.purple + '20'} x={50}>
            <Txt text="📊" fontSize={50} fontFamily={fonts.main} />
          </Circle>
          <Txt text="전환율 자동 집계" fontSize={fontSize.xl} fontWeight={700} fill={colors.white} fontFamily={fonts.main} x={130} offsetX={-1} />
          <Txt text="광고 성과 한눈에" fontSize={fontSize.lg} fill={colors.textLight} fontFamily={fonts.main} x={130} y={70} offsetX={-1} />
        </Node>
      </Node>

      {/* 키포인트 - 왼쪽 정렬 */}
      <Rect
        ref={keypoint}
        width={1100}
        height={130}
        radius={24}
        fill={colors.purple + '20'}
        stroke={colors.purple}
        lineWidth={3}
        x={-1000}
        y={800}
        opacity={0}
      >
        <Txt
          text="📱 언제 어디서나 모바일로 관리"
          fontSize={fontSize.xl}
          fontWeight={600}
          fill={colors.purple}
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

  // 폰 등장
  yield* all(
    phone().opacity(1, 0.3),
    phone().scale(1.7, 0.3, easeOutCubic),
  );

  yield* waitFor(0.1);

  // 리드 카드들 순차 등장 (빠르게)
  yield* leadCards[0]().opacity(1, 0.15);
  yield* leadCards[1]().opacity(1, 0.15);
  yield* leadCards[2]().opacity(1, 0.15);

  yield* waitFor(0.1);

  // 정보 패널 등장
  yield* infoPanel().opacity(1, 0.2);

  yield* waitFor(0.1);

  // 하이라이트 등장
  yield* actionHighlight().opacity(1, 0.15);

  // 상태 버튼 순차
  yield* statusBtns[0]().opacity(1, 0.15, easeOutBack);
  yield* statusBtns[1]().opacity(1, 0.15, easeOutBack);

  yield* waitFor(0.15);

  // 키포인트 등장
  yield* all(
    keypoint().opacity(1, 0.2),
    keypoint().y(770, 0.2, easeOutCubic),
  );

  yield* waitFor(1);

  // 페이드 아웃
  yield* root().opacity(0, 0.25);

});
