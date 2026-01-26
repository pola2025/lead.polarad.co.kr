import { makeScene2D, Rect, Txt, Circle, Node, Img } from '@motion-canvas/2d';
import metaLogo from '../assets/meta-logo.svg';
import naverLogo from '../assets/naver-logo.svg';
import googleLogo from '../assets/google-logo.svg';
import { all, waitFor, createRef, easeOutCubic, easeOutBack, easeInOutCubic } from '@motion-canvas/core';
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
  const adIcons = createRef<Node>();

  // Phase 2: 스마트폰 (크게)
  const phone = createRef<Node>();

  // 키포인트
  const keypoint = createRef<Rect>();

  view.add(
    <Node ref={root}>
      {/* === Phase 1: 텍스트 영역 === */}
      <Node ref={textArea}>
        <Txt
          ref={stepLabel}
          text="STEP 01"
          fontSize={fontSize.xl}
          fontWeight={600}
          fill={colors.primary}
          fontFamily={fonts.main}
          y={-400}
          opacity={0}
        />

        <Txt
          ref={title}
          text={"광고에서\n랜딩으로"}
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
          text={"Meta, 네이버, 구글 등\n어디서든 URL로 연결"}
          fontSize={fontSize.xl}
          fill={colors.textLight}
          fontFamily={fonts.main}
          y={80}
          opacity={0}
          lineHeight={'150%'}
        />

        {/* 광고 아이콘 - 가로 배치 */}
        <Node ref={adIcons} y={280}>
          <Node x={-150} opacity={0} scale={0.5}>
            <Img src={metaLogo} height={70} />
          </Node>
          <Node x={0} opacity={0} scale={0.5}>
            <Img src={naverLogo} width={90} height={90} radius={18} />
          </Node>
          <Node x={150} opacity={0} scale={0.5}>
            <Img src={googleLogo} width={90} height={90} radius={18} />
          </Node>
        </Node>
      </Node>

      {/* === Phase 2: 스마트폰 (크게 꽉 참) === */}
      <Node ref={phone} y={0} opacity={0} scale={2.2}>
        {/* 디바이스 프레임 */}
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
          <Rect width={mobile.width} height={mobile.height} fill={colors.bgLight} />

          {/* 로고 */}
          <Rect width={80} height={26} radius={6} fill={colors.wireframe} y={-250}>
            <Txt text="LOGO" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} />
          </Rect>

          {/* 타이틀 */}
          <Txt text="무료 상담 신청" fontSize={24} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-180} />
          <Txt text="지금 바로 전문가와 상담하세요" fontSize={14} fill={colors.textMuted} fontFamily={fonts.main} y={-145} />

          {/* 특징 */}
          <Rect width={260} height={100} radius={12} fill={colors.white} stroke={colors.wireframe} lineWidth={1} y={-30}>
            <Node y={-25}>
              <Circle width={8} height={8} fill={colors.primary} x={-100} />
              <Txt text="실시간 접수 알림" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} x={0} />
            </Node>
            <Node y={5}>
              <Circle width={8} height={8} fill={colors.primary} x={-100} />
              <Txt text="간편한 모바일 신청" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} x={5} />
            </Node>
            <Node y={35}>
              <Circle width={8} height={8} fill={colors.primary} x={-100} />
              <Txt text="빠른 상담 연결" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} x={-10} />
            </Node>
          </Rect>

          {/* 카카오 버튼 */}
          <Rect width={260} height={48} radius={8} fill={colors.kakao} y={100}>
            <Node x={-80}>
              <Circle width={22} height={22} fill={colors.kakaoDark} />
              <Circle width={6} height={6} fill={colors.kakao} y={-2} />
            </Node>
            <Txt text="카카오 로그인" fontSize={18} fontWeight={600} fill={colors.kakaoDark} fontFamily={fonts.main} x={15} />
          </Rect>

          <Txt text="카카오 로그인 후 상담접수가 가능합니다" fontSize={11} fill={colors.textMuted} fontFamily={fonts.main} y={160} />
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

      {/* 키포인트 */}
      <Rect
        ref={keypoint}
        width={400}
        height={60}
        radius={16}
        fill={colors.primary + '20'}
        stroke={colors.primary}
        lineWidth={2}
        y={700}
        opacity={0}
      >
        <Txt
          text="💡 URL로 어디든 연결"
          fontSize={fontSize.lg}
          fontWeight={600}
          fill={colors.primary}
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
    subtitle().y(100, 0.3, easeOutCubic),
  );

  // 광고 아이콘 등장
  const icons = adIcons().children() as Node[];
  yield* all(
    ...icons.map(icon => icon.opacity(1, 0.2)),
    ...icons.map(icon => icon.scale(1, 0.2)),
  );

  yield* waitFor(0.6);

  // Phase 2: 텍스트 페이드아웃
  yield* textArea().opacity(0, 0.3, easeInOutCubic);

  yield* waitFor(0.1);

  // Phase 3: 스마트폰 크게 등장
  yield* all(
    phone().opacity(1, 0.4),
    phone().scale(2.5, 0.4, easeOutCubic),
  );

  yield* waitFor(0.8);

  // 키포인트 등장
  yield* all(
    keypoint().opacity(1, 0.25),
    keypoint().y(680, 0.25, easeOutCubic),
  );

  yield* waitFor(0.8);

  // 페이드 아웃
  yield* root().opacity(0, 0.3);
});
