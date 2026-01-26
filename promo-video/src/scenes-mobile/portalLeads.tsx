import { makeScene2D, Rect, Txt, Circle, Node } from '@motion-canvas/2d';
import { all, waitFor, createRef, easeOutCubic, easeInOutCubic, easeOutBack } from '@motion-canvas/core';
import { colors, fonts, fontSize, canvas, mobile } from '../components/styles-mobile';

export default makeScene2D(function* (view) {
  view.fill(colors.bgDark);
  view.size([canvas.width, canvas.height]);

  const root = createRef<Node>();

  // Phase 1: 텍스트 영역
  const textArea = createRef<Node>();
  const stepLabel = createRef<Txt>();
  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();
  const features = createRef<Node>();

  // Phase 2: 포털 화면 (크게)
  const phone = createRef<Node>();
  const leadCards = [createRef<Node>(), createRef<Node>(), createRef<Node>()];
  const statusBtns = createRef<Node>();

  // 키포인트
  const keypoint = createRef<Rect>();

  view.add(
    <Node ref={root}>
      {/* === Phase 1: 텍스트 영역 === */}
      <Node ref={textArea}>
        <Txt
          ref={stepLabel}
          text="STEP 04"
          fontSize={fontSize.xl}
          fontWeight={600}
          fill={colors.purple}
          fontFamily={fonts.main}
          y={-400}
          opacity={0}
        />

        <Txt
          ref={title}
          text={"접수\n관리"}
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
          text={"모바일에서 바로\n리드 상태 변경"}
          fontSize={fontSize.xl}
          fill={colors.textLight}
          fontFamily={fonts.main}
          y={60}
          opacity={0}
          lineHeight={'150%'}
        />

        {/* 기능 아이콘 */}
        <Node ref={features} y={260} opacity={0}>
          <Node x={-120}>
            <Circle width={50} height={50} fill={colors.primary + '30'}>
              <Txt text="📱" fontSize={24} fontFamily={fonts.main} />
            </Circle>
            <Txt text="모바일" fontSize={14} fill={colors.white} fontFamily={fonts.main} y={40} />
          </Node>

          <Node x={0}>
            <Circle width={50} height={50} fill={colors.success + '30'}>
              <Txt text="✅" fontSize={24} fontFamily={fonts.main} />
            </Circle>
            <Txt text="원터치" fontSize={14} fill={colors.white} fontFamily={fonts.main} y={40} />
          </Node>

          <Node x={120}>
            <Circle width={50} height={50} fill={colors.purple + '30'}>
              <Txt text="📊" fontSize={24} fontFamily={fonts.main} />
            </Circle>
            <Txt text="자동집계" fontSize={14} fill={colors.white} fontFamily={fonts.main} y={40} />
          </Node>
        </Node>
      </Node>

      {/* === Phase 2: 포털 화면 (크게 꽉 참) === */}
      <Node ref={phone} y={0} opacity={0} scale={2.2}>
        <Rect
          width={mobile.frameWidth + 20}
          height={mobile.frameHeight + 20}
          radius={mobile.borderRadius + 4}
          fill={colors.deviceFrame}
          shadowColor={'#00000066'}
          shadowBlur={40}
          shadowOffsetY={15}
        />

        <Rect
          width={mobile.width + 10}
          height={mobile.height + 10}
          radius={mobile.borderRadius - 4}
          fill={colors.deviceScreen}
          clip
        >
          {/* 포털 헤더 */}
          <Rect width={mobile.width + 10} height={50} fill={colors.primary} y={-300}>
            <Txt text="📋 접수관리" fontSize={18} fontWeight={700} fill={colors.white} fontFamily={fonts.main} />
          </Rect>

          {/* 필터 탭 */}
          <Node y={-235}>
            <Rect width={60} height={28} radius={14} fill={colors.primary} x={-100}>
              <Txt text="전체" fontSize={12} fontWeight={600} fill={colors.white} fontFamily={fonts.main} />
            </Rect>
            <Rect width={60} height={28} radius={14} fill={colors.wireframe} x={-30}>
              <Txt text="신규" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} />
            </Rect>
            <Rect width={70} height={28} radius={14} fill={colors.wireframe} x={50}>
              <Txt text="연락완료" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} />
            </Rect>
          </Node>

          {/* 리드 카드 1 */}
          <Node ref={leadCards[0]} y={-140} opacity={0}>
            <Rect
              width={280}
              height={90}
              radius={12}
              fill={colors.white}
              stroke={colors.wireframe}
              lineWidth={1}
              shadowColor={'#00000010'}
              shadowBlur={8}
              shadowOffsetY={3}
            >
              <Node x={-90}>
                <Txt text="김**" fontSize={16} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-22} />
                <Txt text="010-0000-0000" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} y={2} />
                <Txt text="01/24 10:15" fontSize={10} fill={colors.textLight} fontFamily={fonts.main} y={22} />
              </Node>

              <Rect width={44} height={22} radius={6} fill={colors.primary + '20'} x={85} y={-20}>
                <Txt text="신규" fontSize={10} fontWeight={600} fill={colors.primary} fontFamily={fonts.main} />
              </Rect>

              <Node ref={statusBtns} x={85} y={15} opacity={0}>
                <Rect width={50} height={20} radius={5} fill={colors.success} x={-30}>
                  <Txt text="연락완료" fontSize={8} fontWeight={600} fill={colors.white} fontFamily={fonts.main} />
                </Rect>
                <Rect width={36} height={20} radius={5} fill={colors.purple} x={25}>
                  <Txt text="전환" fontSize={8} fontWeight={600} fill={colors.white} fontFamily={fonts.main} />
                </Rect>
              </Node>
            </Rect>
          </Node>

          {/* 리드 카드 2 */}
          <Node ref={leadCards[1]} y={-30} opacity={0}>
            <Rect
              width={280}
              height={90}
              radius={12}
              fill={colors.white}
              stroke={colors.wireframe}
              lineWidth={1}
              shadowColor={'#00000010'}
              shadowBlur={8}
              shadowOffsetY={3}
            >
              <Node x={-90}>
                <Txt text="이**" fontSize={16} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-22} />
                <Txt text="010-0000-0000" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} y={2} />
                <Txt text="01/24 09:42" fontSize={10} fill={colors.textLight} fontFamily={fonts.main} y={22} />
              </Node>

              <Rect width={56} height={22} radius={6} fill={colors.success + '20'} x={82} y={0}>
                <Txt text="연락완료" fontSize={10} fontWeight={600} fill={colors.success} fontFamily={fonts.main} />
              </Rect>
            </Rect>
          </Node>

          {/* 리드 카드 3 */}
          <Node ref={leadCards[2]} y={80} opacity={0}>
            <Rect
              width={280}
              height={90}
              radius={12}
              fill={colors.white}
              stroke={colors.wireframe}
              lineWidth={1}
              shadowColor={'#00000010'}
              shadowBlur={8}
              shadowOffsetY={3}
            >
              <Node x={-90}>
                <Txt text="박**" fontSize={16} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-22} />
                <Txt text="010-0000-0000" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} y={2} />
                <Txt text="01/23 18:30" fontSize={10} fill={colors.textLight} fontFamily={fonts.main} y={22} />
              </Node>

              <Rect width={44} height={22} radius={6} fill={colors.purple + '20'} x={85} y={0}>
                <Txt text="전환" fontSize={10} fontWeight={600} fill={colors.purple} fontFamily={fonts.main} />
              </Rect>
            </Rect>
          </Node>

          {/* 하단 네비게이션 */}
          <Node y={280}>
            <Rect width={mobile.width + 10} height={50} fill={colors.wireframe}>
              <Txt text="📋" fontSize={20} x={-100} />
              <Txt text="📊" fontSize={20} x={-30} />
              <Txt text="⚙️" fontSize={20} x={40} />
              <Txt text="👤" fontSize={20} x={100} />
            </Rect>
          </Node>
        </Rect>

        <Rect
          width={mobile.notchWidth}
          height={mobile.notchHeight}
          radius={14}
          fill={colors.deviceFrame}
          y={-mobile.height / 2 - 3}
        />
      </Node>

      {/* 키포인트 */}
      <Rect
        ref={keypoint}
        width={420}
        height={60}
        radius={16}
        fill={colors.purple + '20'}
        stroke={colors.purple}
        lineWidth={2}
        y={500}
        opacity={0}
      >
        <Txt
          text="📱 언제 어디서나 모바일로 관리"
          fontSize={fontSize.base}
          fontWeight={600}
          fill={colors.purple}
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

  yield* features().opacity(1, 0.3);

  yield* waitFor(0.6);

  // Phase 2: 텍스트 페이드아웃
  yield* textArea().opacity(0, 0.3, easeInOutCubic);

  yield* waitFor(0.1);

  // Phase 3: 포털 화면 크게 등장
  yield* all(
    phone().opacity(1, 0.4),
    phone().scale(2.5, 0.4, easeOutCubic),
  );

  yield* waitFor(0.15);

  // 리드 카드들 순차 등장
  yield* leadCards[0]().opacity(1, 0.15);
  yield* leadCards[1]().opacity(1, 0.15);
  yield* leadCards[2]().opacity(1, 0.15);

  yield* waitFor(0.15);

  // 상태 버튼 등장
  yield* statusBtns().opacity(1, 0.2, easeOutBack);

  yield* waitFor(0.3);

  // 키포인트 등장
  yield* all(
    keypoint().opacity(1, 0.25),
    keypoint().y(480, 0.25, easeOutCubic),
  );

  yield* waitFor(1);

  // 페이드 아웃
  yield* root().opacity(0, 0.25);
});
