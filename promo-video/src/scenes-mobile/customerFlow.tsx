import { makeScene2D, Rect, Txt, Circle, Node } from '@motion-canvas/2d';
import { all, waitFor, createRef, createSignal, easeOutCubic, easeInOutCubic, easeOutBack } from '@motion-canvas/core';
import { colors, fonts, fontSize, canvas, mobile } from '../components/styles-mobile';

export default makeScene2D(function* (view) {
  view.fill(colors.bgDark);
  view.size([canvas.width, canvas.height]);

  const root = createRef<Node>();

  // Phase 1: 텍스트 영역
  const textArea = createRef<Node>();
  const stepLabel = createRef<Txt>();
  const title = createRef<Txt>();
  const flowSteps = createRef<Node>();

  // Phase 2: 스마트폰 (크게)
  const phone = createRef<Node>();
  const screenOffset = createSignal(0);

  // 클릭 인디케이터
  const click1 = createRef<Circle>();
  const click2 = createRef<Circle>();

  // 키포인트
  const keypoint = createRef<Rect>();

  view.add(
    <Node ref={root}>
      {/* === Phase 1: 텍스트 영역 === */}
      <Node ref={textArea}>
        <Txt
          ref={stepLabel}
          text="STEP 02"
          fontSize={fontSize.xl}
          fontWeight={600}
          fill={colors.success}
          fontFamily={fonts.main}
          y={-400}
          opacity={0}
        />

        <Txt
          ref={title}
          text={"고객 신청\n플로우"}
          fontSize={fontSize['4xl']}
          fontWeight={900}
          fill={colors.white}
          fontFamily={fonts.main}
          y={-180}
          opacity={0}
          lineHeight={'120%'}
        />

        {/* 플로우 스텝 - 가로 배치 */}
        <Node ref={flowSteps} y={100} opacity={0}>
          <Node x={-180}>
            <Circle width={50} height={50} fill={colors.kakao}>
              <Txt text="1" fontSize={24} fontWeight={700} fill={colors.kakaoDark} fontFamily={fonts.main} />
            </Circle>
            <Txt text="카카오" fontSize={18} fill={colors.white} fontFamily={fonts.main} y={50} />
            <Txt text="로그인" fontSize={18} fill={colors.white} fontFamily={fonts.main} y={75} />
          </Node>

          <Rect width={50} height={4} fill={colors.textMuted} x={-90} />

          <Node x={0}>
            <Circle width={50} height={50} fill={colors.primary}>
              <Txt text="2" fontSize={24} fontWeight={700} fill={colors.white} fontFamily={fonts.main} />
            </Circle>
            <Txt text="폼" fontSize={18} fill={colors.white} fontFamily={fonts.main} y={50} />
            <Txt text="작성" fontSize={18} fill={colors.white} fontFamily={fonts.main} y={75} />
          </Node>

          <Rect width={50} height={4} fill={colors.textMuted} x={90} />

          <Node x={180}>
            <Circle width={50} height={50} fill={colors.success}>
              <Txt text="3" fontSize={24} fontWeight={700} fill={colors.white} fontFamily={fonts.main} />
            </Circle>
            <Txt text="접수" fontSize={18} fill={colors.white} fontFamily={fonts.main} y={50} />
            <Txt text="완료" fontSize={18} fill={colors.white} fontFamily={fonts.main} y={75} />
          </Node>
        </Node>

        {/* 혜택 문구 */}
        <Txt
          text="카카오 로그인으로 실제 고객만 접수"
          fontSize={fontSize.base}
          fill={colors.textLight}
          fontFamily={fonts.main}
          y={280}
          opacity={0}
        />
      </Node>

      {/* === Phase 2: 스마트폰 (크게 꽉 참) === */}
      <Node ref={phone} y={0} opacity={0} scale={2.2}>
        <Rect
          width={mobile.frameWidth}
          height={mobile.frameHeight}
          radius={mobile.borderRadius}
          fill={colors.deviceFrame}
          shadowColor={'#00000066'}
          shadowBlur={30}
          shadowOffsetY={10}
        />

        {/* 화면 */}
        <Rect
          width={mobile.width}
          height={mobile.height}
          radius={mobile.borderRadius - 6}
          fill={colors.deviceScreen}
          clip
        >
          <Node x={() => screenOffset()}>
            {/* 랜딩 화면 */}
            <Node x={0}>
              <Rect width={mobile.width} height={mobile.height} fill={colors.bgLight} />

              <Rect width={70} height={22} radius={6} fill={colors.wireframe} y={-250}>
                <Txt text="LOGO" fontSize={11} fill={colors.textMuted} fontFamily={fonts.main} />
              </Rect>

              <Txt text="무료 상담 신청" fontSize={22} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-180} />
              <Txt text="전문가와 상담하세요" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} y={-150} />

              {/* 특징 박스 */}
              <Rect width={260} height={100} radius={12} fill={colors.white} stroke={colors.wireframe} lineWidth={1} y={-40}>
                <Txt text="서비스 특징" fontSize={14} fontWeight={600} fill={colors.text} fontFamily={fonts.main} y={-35} />
                <Node y={0}>
                  <Circle width={8} height={8} fill={colors.primary} x={-100} />
                  <Txt text="실시간 접수 알림" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} x={0} />
                </Node>
                <Node y={25}>
                  <Circle width={8} height={8} fill={colors.primary} x={-100} />
                  <Txt text="간편한 모바일 신청" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} x={5} />
                </Node>
              </Rect>

              {/* 카카오 버튼 */}
              <Rect width={260} height={44} radius={8} fill={colors.kakao} y={80}>
                <Node x={-85}>
                  <Circle width={20} height={20} fill={colors.kakaoDark} />
                  <Circle width={5} height={5} fill={colors.kakao} y={-2} />
                </Node>
                <Txt text="카카오 로그인" fontSize={16} fontWeight={600} fill={colors.kakaoDark} fontFamily={fonts.main} x={10} />
              </Rect>
            </Node>

            {/* 폼 화면 */}
            <Node x={mobile.width}>
              <Rect width={mobile.width} height={mobile.height} fill={colors.bgLight} />

              <Txt text="상담 신청" fontSize={20} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-250} />

              {/* 카카오 인증 완료 */}
              <Rect width={260} height={36} radius={8} fill={'#fef9c3'} stroke={'#fde047'} lineWidth={1} y={-195}>
                <Circle width={14} height={14} fill={colors.kakao} x={-105} />
                <Txt text="카카오 계정 연동됨" fontSize={12} fill={'#854d0e'} fontFamily={fonts.main} x={10} />
              </Rect>

              {/* 폼 */}
              <Rect width={260} height={220} radius={12} fill={colors.white} stroke={colors.wireframe} lineWidth={1} y={-20}>
                <Node y={-70}>
                  <Txt text="이름 *" fontSize={11} fontWeight={500} fill={colors.text} fontFamily={fonts.main} x={-100} y={-22} />
                  <Rect width={220} height={34} radius={6} fill={colors.white} stroke={colors.wireframeDark} lineWidth={1}>
                    <Txt text="홍**" fontSize={14} fill={colors.text} fontFamily={fonts.main} x={-85} />
                  </Rect>
                </Node>

                <Node y={10}>
                  <Txt text="연락처 *" fontSize={11} fontWeight={500} fill={colors.text} fontFamily={fonts.main} x={-95} y={-22} />
                  <Rect width={220} height={34} radius={6} fill={colors.white} stroke={colors.wireframeDark} lineWidth={1}>
                    <Txt text="010-0000-0000" fontSize={14} fill={colors.text} fontFamily={fonts.main} x={-55} />
                  </Rect>
                </Node>

                <Node y={90}>
                  <Txt text="이메일 *" fontSize={11} fontWeight={500} fill={colors.text} fontFamily={fonts.main} x={-95} y={-22} />
                  <Rect width={220} height={34} radius={6} fill={'#fef9c3'} stroke={'#fde047'} lineWidth={1}>
                    <Txt text="user@kakao.com" fontSize={14} fill={'#854d0e'} fontFamily={fonts.main} x={-45} />
                  </Rect>
                </Node>
              </Rect>

              {/* 제출 버튼 */}
              <Rect width={260} height={44} radius={10} fill={colors.primary} y={170}>
                <Txt text="신청 완료" fontSize={16} fontWeight={600} fill={colors.white} fontFamily={fonts.main} />
              </Rect>
            </Node>

            {/* 완료 화면 */}
            <Node x={mobile.width * 2}>
              <Rect width={mobile.width} height={mobile.height} fill={'#f0fdf4'} />

              <Circle width={80} height={80} fill={'#dcfce7'} y={-60}>
                <Txt text="✓" fontSize={44} fill={colors.success} fontFamily={fonts.main} />
              </Circle>

              <Txt text="신청이 완료되었습니다" fontSize={20} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={40} />
              <Txt text="빠른 시일 내에 연락드리겠습니다" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} y={75} />
            </Node>
          </Node>
        </Rect>

        {/* 노치 */}
        <Rect
          width={mobile.notchWidth}
          height={mobile.notchHeight}
          radius={14}
          fill={colors.deviceFrame}
          y={-mobile.height / 2 + 18}
        />
      </Node>

      {/* 클릭 인디케이터 */}
      <Circle
        ref={click1}
        width={80}
        height={80}
        fill={colors.primary + '4d'}
        stroke={colors.primary}
        lineWidth={3}
        y={180}
        scale={0}
        opacity={0}
      />

      <Circle
        ref={click2}
        width={80}
        height={80}
        fill={colors.primary + '4d'}
        stroke={colors.primary}
        lineWidth={3}
        y={380}
        scale={0}
        opacity={0}
      />

      {/* 키포인트 */}
      <Rect
        ref={keypoint}
        width={380}
        height={60}
        radius={16}
        fill={colors.success + '20'}
        stroke={colors.success}
        lineWidth={2}
        y={700}
        opacity={0}
      >
        <Txt
          text="⚡ 10초 만에 접수 완료"
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

  yield* flowSteps().opacity(1, 0.3);

  yield* waitFor(0.6);

  // Phase 2: 텍스트 페이드아웃
  yield* textArea().opacity(0, 0.3, easeInOutCubic);

  yield* waitFor(0.1);

  // Phase 3: 스마트폰 크게 등장
  yield* all(
    phone().opacity(1, 0.4),
    phone().scale(2.5, 0.4, easeOutCubic),
  );

  yield* waitFor(0.3);

  // 카카오 버튼 클릭
  yield* all(
    click1().scale(1, 0.12),
    click1().opacity(1, 0.12),
  );
  yield* all(
    click1().scale(1.5, 0.15),
    click1().opacity(0, 0.15),
  );

  // 폼 화면으로 전환
  yield* screenOffset(-mobile.width, 0.4, easeInOutCubic);

  yield* waitFor(0.4);

  // 제출 버튼 클릭
  yield* all(
    click2().scale(1, 0.12),
    click2().opacity(1, 0.12),
  );
  yield* all(
    click2().scale(1.5, 0.15),
    click2().opacity(0, 0.15),
  );

  // 완료 화면으로 전환
  yield* screenOffset(-mobile.width * 2, 0.4, easeInOutCubic);

  yield* waitFor(0.3);

  // 키포인트 등장
  yield* all(
    keypoint().opacity(1, 0.25),
    keypoint().y(680, 0.25, easeOutCubic),
  );

  yield* waitFor(0.8);

  // 페이드 아웃
  yield* root().opacity(0, 0.25);
});
