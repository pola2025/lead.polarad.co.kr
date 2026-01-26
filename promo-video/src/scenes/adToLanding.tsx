import { makeScene2D, Rect, Txt, Circle, Node, Line, Img } from '@motion-canvas/2d';
import metaLogo from '../assets/meta-logo.svg';
import naverLogo from '../assets/naver-logo.svg';
import googleLogo from '../assets/google-logo.svg';
import { all, chain, waitFor, createRef, easeOutCubic, easeInOutCubic, easeOutBack } from '@motion-canvas/core';
import { colors, fonts, fontSize, canvas, spacing, mobile, layout } from '../components/styles';

export default makeScene2D(function* (view) {
  view.fill(colors.bgDark);
  view.size([canvas.width, canvas.height]);

  const root = createRef<Node>();
  const stepLabel = createRef<Txt>();
  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();
  const keypoint = createRef<Rect>();

  // 광고 아이콘들
  const adMeta = createRef<Node>();
  const adNaver = createRef<Node>();
  const adGoogle = createRef<Node>();

  // 화살표
  const arrow = createRef<Node>();

  // 스마트폰
  const phone = createRef<Node>();
  const phoneFrame = createRef<Rect>();

  view.add(
    <Node ref={root}>
      {/* 왼쪽: 텍스트 영역 */}
      <Node x={-900}>
        <Txt
          ref={stepLabel}
          text="STEP 01"
          fontSize={fontSize.lg}
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
          y={-150}
          opacity={0}
          lineHeight={'120%'}
        />

        <Txt
          ref={subtitle}
          text={"Meta, 네이버, 구글 등\n어디서든 URL로 연결"}
          fontSize={fontSize.xl}
          fill={colors.textLight}
          fontFamily={fonts.main}
          y={150}
          opacity={0}
          lineHeight={'150%'}
        />

        {/* 키포인트 */}
        <Rect
          ref={keypoint}
          width={900}
          height={120}
          radius={20}
          fill={colors.primary + '20'}
          stroke={colors.primary}
          lineWidth={3}
          y={400}
          opacity={0}
        >
          <Txt
            text="💡 URL만 있으면 어디든 연결 가능"
            fontSize={fontSize.lg}
            fontWeight={600}
            fill={colors.primary}
            fontFamily={fonts.main}
          />
        </Rect>
      </Node>

      {/* 중앙: 광고 아이콘들 */}
      <Node x={0} y={-100}>
        {/* Meta */}
        <Node ref={adMeta} y={-250} opacity={0} scale={0.5}>
          <Img src={metaLogo} height={120} />
        </Node>

        {/* Naver */}
        <Node ref={adNaver} y={0} opacity={0} scale={0.5}>
          <Img src={naverLogo} width={200} height={200} radius={40} />
        </Node>

        {/* Google */}
        <Node ref={adGoogle} y={250} opacity={0} scale={0.5}>
          <Img src={googleLogo} width={200} height={200} radius={40} />
        </Node>
      </Node>

      {/* 화살표 */}
      <Node ref={arrow} x={350} y={-100} opacity={0}>
        <Rect width={200} height={8} radius={4} fill={colors.textLight} />
        <Rect width={40} height={8} radius={4} fill={colors.textLight} x={85} y={-15} rotation={45} />
        <Rect width={40} height={8} radius={4} fill={colors.textLight} x={85} y={15} rotation={-45} />
      </Node>

      {/* 오른쪽: 스마트폰 */}
      <Node ref={phone} x={1200} y={0} opacity={0} scale={1.2}>
        {/* 디바이스 프레임 */}
        <Rect
          ref={phoneFrame}
          width={mobile.frameWidth}
          height={mobile.frameHeight}
          radius={mobile.borderRadius}
          fill={colors.deviceFrame}
          shadowColor={'#00000066'}
          shadowBlur={60}
          shadowOffsetY={20}
        />

        {/* 화면 */}
        <Rect
          width={mobile.width}
          height={mobile.height}
          radius={mobile.borderRadius - 10}
          fill={colors.deviceScreen}
          clip
        >
          {/* 랜딩 페이지 내용 */}
          <Rect width={mobile.width} height={mobile.height} fill={colors.bgLight} />

          {/* 로고 */}
          <Rect width={160} height={50} radius={10} fill={colors.wireframe} y={-400}>
            <Txt text="LOGO" fontSize={24} fill={colors.textMuted} fontFamily={fonts.main} />
          </Rect>

          {/* 타이틀 */}
          <Txt text="무료 상담 신청" fontSize={48} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-280} />
          <Txt text="지금 바로 전문가와 상담하세요" fontSize={28} fill={colors.textMuted} fontFamily={fonts.main} y={-220} />

          {/* 카카오 버튼 */}
          <Rect width={440} height={80} radius={12} fill={colors.kakao} y={100}>
            <Node x={-130}>
              <Circle width={36} height={36} fill={colors.kakaoDark} />
              <Circle width={10} height={10} fill={colors.kakao} y={-4} />
            </Node>
            <Txt text="카카오 로그인" fontSize={32} fontWeight={600} fill={colors.kakaoDark} fontFamily={fonts.main} x={20} />
          </Rect>

          <Txt text="카카오 로그인 후 상담접수가 가능합니다" fontSize={22} fill={colors.textMuted} fontFamily={fonts.main} y={180} />
        </Rect>

        {/* 노치 */}
        <Rect
          width={mobile.notchWidth}
          height={mobile.notchHeight}
          radius={24}
          fill={colors.deviceFrame}
          y={-mobile.height / 2 + 30}
        />
      </Node>
    </Node>
  );

  // === 애니메이션 (45초 버전) ===

  // 1단계: 왼쪽 텍스트 영역 한번에 등장
  yield* all(
    stepLabel().opacity(1, 0.25),
    stepLabel().y(-380, 0.25, easeOutCubic),
    title().opacity(1, 0.25),
    title().y(-130, 0.25, easeOutCubic),
    subtitle().opacity(1, 0.25),
    subtitle().y(170, 0.25, easeOutCubic),
    keypoint().opacity(1, 0.25),
    keypoint().y(420, 0.25, easeOutCubic),
  );

  yield* waitFor(0.15);

  // 2단계: SNS 로고 + 화살표 한번에 등장
  yield* all(
    adMeta().opacity(1, 0.25),
    adMeta().scale(1, 0.25, easeOutBack),
    adNaver().opacity(1, 0.25),
    adNaver().scale(1, 0.25, easeOutBack),
    adGoogle().opacity(1, 0.25),
    adGoogle().scale(1, 0.25, easeOutBack),
    arrow().opacity(1, 0.25),
    arrow().x(400, 0.25, easeOutCubic),
  );

  yield* waitFor(0.15);

  // 3단계: 스마트폰 등장
  yield* all(
    phone().opacity(1, 0.3),
    phone().scale(1.5, 0.3, easeOutCubic),
    phone().x(1150, 0.3, easeOutCubic),
  );

  yield* waitFor(1);

  // 페이드 아웃
  yield* root().opacity(0, 0.3);

});
