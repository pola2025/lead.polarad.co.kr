import { makeScene2D, Rect, Txt, Circle, Node } from '@motion-canvas/2d';
import { all, chain, waitFor, createRef, createSignal, easeOutCubic, easeInOutCubic, easeOutBack } from '@motion-canvas/core';
import { colors, fonts, fontSize, canvas, spacing, mobile, layout } from '../components/styles';

export default makeScene2D(function* (view) {
  view.fill(colors.bgDark);
  view.size([canvas.width, canvas.height]);

  const root = createRef<Node>();
  const stepLabel = createRef<Txt>();
  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();

  // 카카오 혜택 박스
  const benefitBox = createRef<Rect>();
  const benefit1 = createRef<Node>();
  const benefit2 = createRef<Node>();
  const benefit3 = createRef<Node>();
  const benefit4 = createRef<Node>();

  // 키포인트
  const keypoint = createRef<Rect>();

  // 스마트폰
  const phone = createRef<Node>();
  const phoneFrame = createRef<Rect>();
  const screenOffset = createSignal(0);

  // 화면들
  const landingScreen = createRef<Node>();
  const formScreen = createRef<Node>();
  const doneScreen = createRef<Node>();

  // 클릭 인디케이터
  const click1 = createRef<Circle>();
  const click2 = createRef<Circle>();

  view.add(
    <Node ref={root}>
      {/* 왼쪽: 텍스트 영역 */}
      <Node x={-950}>
        <Txt
          ref={stepLabel}
          text="STEP 02"
          fontSize={fontSize.lg}
          fontWeight={600}
          fill={colors.success}
          fontFamily={fonts.main}
          y={-550}
          opacity={0}
        />

        <Txt
          ref={title}
          text={"고객 신청\n플로우"}
          fontSize={fontSize['4xl']}
          fontWeight={900}
          fill={colors.white}
          fontFamily={fonts.main}
          y={-300}
          opacity={0}
          lineHeight={'120%'}
        />

        {/* 플로우 스텝 - 세로 타임라인 */}
        <Node ref={subtitle} y={50} opacity={0}>
          {/* Step 1 */}
          <Node y={-60}>
            <Circle width={40} height={40} fill={colors.kakao} x={-320}>
              <Txt text="1" fontSize={fontSize.base} fontWeight={700} fill={colors.kakaoDark} fontFamily={fonts.main} />
            </Circle>
            <Txt text="카카오 로그인" fontSize={fontSize.lg} fontWeight={600} fill={colors.white} fontFamily={fonts.main} x={-120} />
          </Node>

          {/* 연결선 */}
          <Rect width={4} height={40} fill={colors.textMuted} x={-320} y={0} />

          {/* Step 2 */}
          <Node y={60}>
            <Circle width={40} height={40} fill={colors.primary} x={-320}>
              <Txt text="2" fontSize={fontSize.base} fontWeight={700} fill={colors.white} fontFamily={fonts.main} />
            </Circle>
            <Txt text="폼 작성" fontSize={fontSize.lg} fontWeight={600} fill={colors.white} fontFamily={fonts.main} x={-180} />
          </Node>

          {/* 연결선 */}
          <Rect width={4} height={40} fill={colors.textMuted} x={-320} y={120} />

          {/* Step 3 */}
          <Node y={180}>
            <Circle width={40} height={40} fill={colors.success} x={-320}>
              <Txt text="3" fontSize={fontSize.base} fontWeight={700} fill={colors.white} fontFamily={fonts.main} />
            </Circle>
            <Txt text="접수 완료" fontSize={fontSize.lg} fontWeight={600} fill={colors.white} fontFamily={fonts.main} x={-155} />
          </Node>
        </Node>

        {/* 카카오 혜택 박스 */}
        <Rect
          ref={benefitBox}
          width={850}
          height={450}
          radius={32}
          fill={colors.kakao + '15'}
          stroke={colors.kakao + '40'}
          lineWidth={3}
          y={620}
          opacity={0}
        >
          {/* 헤더 */}
          <Node y={-160}>
            <Circle width={44} height={44} fill={colors.kakaoDark} x={-320}>
              <Circle width={12} height={12} fill={colors.kakao} y={-4} />
            </Circle>
            <Txt text="카카오 로그인 혜택" fontSize={fontSize.lg} fontWeight={700} fill={colors.kakao} fontFamily={fonts.main} x={-130} />
          </Node>

          {/* 혜택 목록 - 왼쪽 정렬 */}
          <Node ref={benefit1} y={-70} opacity={0}>
            <Txt text="✓" fontSize={fontSize.xl} fill={colors.success} fontFamily={fonts.main} x={-370} />
            <Txt text="실제 고객 검증 & 반복접수 차단" fontSize={fontSize.base} fill={colors.white} fontFamily={fonts.main} x={-320} offsetX={-1} />
          </Node>

          <Node ref={benefit2} y={10} opacity={0}>
            <Txt text="✓" fontSize={fontSize.xl} fill={colors.success} fontFamily={fonts.main} x={-370} />
            <Txt text="블랙리스트 설정 가능" fontSize={fontSize.base} fill={colors.white} fontFamily={fonts.main} x={-320} offsetX={-1} />
          </Node>

          <Node ref={benefit3} y={90} opacity={0}>
            <Txt text="✓" fontSize={fontSize.xl} fill={colors.success} fontFamily={fonts.main} x={-370} />
            <Txt text="Meta 외 모든 광고 영역 URL 추가 가능" fontSize={fontSize.base} fill={colors.white} fontFamily={fonts.main} x={-320} offsetX={-1} />
          </Node>

          <Node ref={benefit4} y={170} opacity={0}>
            <Txt text="✓" fontSize={fontSize.xl} fill={colors.success} fontFamily={fonts.main} x={-370} />
            <Txt text="복잡한 홈페이지보다 빠른 접수 최적화" fontSize={fontSize.base} fill={colors.white} fontFamily={fonts.main} x={-320} offsetX={-1} />
          </Node>
        </Rect>
      </Node>

      {/* 오른쪽: 스마트폰 */}
      <Node ref={phone} x={650} y={0} opacity={0} scale={1.4}>
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
          <Node x={() => screenOffset()}>
            {/* 랜딩 화면 */}
            <Node ref={landingScreen} x={0}>
              <Rect width={mobile.width} height={mobile.height} fill={colors.bgLight} />

              <Rect width={140} height={44} radius={10} fill={colors.wireframe} y={-400}>
                <Txt text="LOGO" fontSize={22} fill={colors.textMuted} fontFamily={fonts.main} />
              </Rect>

              <Txt text="무료 상담 신청" fontSize={44} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-280} />
              <Txt text="지금 바로 전문가와 상담하세요" fontSize={26} fill={colors.textMuted} fontFamily={fonts.main} y={-220} />

              {/* 특징 박스 */}
              <Rect width={440} height={200} radius={20} fill={colors.white} stroke={colors.wireframe} lineWidth={2} y={-50}>
                <Txt text="서비스 특징" fontSize={24} fontWeight={600} fill={colors.text} fontFamily={fonts.main} y={-70} />
                <Node y={-20}>
                  <Circle width={12} height={12} fill={colors.primary} x={-180} />
                  <Txt text="실시간 접수 알림" fontSize={22} fill={colors.textMuted} fontFamily={fonts.main} x={-50} />
                </Node>
                <Node y={20}>
                  <Circle width={12} height={12} fill={colors.primary} x={-180} />
                  <Txt text="간편한 모바일 신청" fontSize={22} fill={colors.textMuted} fontFamily={fonts.main} x={-40} />
                </Node>
                <Node y={60}>
                  <Circle width={12} height={12} fill={colors.primary} x={-180} />
                  <Txt text="빠른 상담 연결" fontSize={22} fill={colors.textMuted} fontFamily={fonts.main} x={-60} />
                </Node>
              </Rect>

              {/* 카카오 버튼 */}
              <Rect width={440} height={76} radius={12} fill={colors.kakao} y={150}>
                <Node x={-140}>
                  <Circle width={32} height={32} fill={colors.kakaoDark} />
                  <Circle width={9} height={9} fill={colors.kakao} y={-4} />
                </Node>
                <Txt text="카카오 로그인" fontSize={28} fontWeight={600} fill={colors.kakaoDark} fontFamily={fonts.main} x={10} />
              </Rect>

              <Txt text="카카오 로그인 후 상담접수가 가능합니다" fontSize={20} fill={colors.textMuted} fontFamily={fonts.main} y={230} />
            </Node>

            {/* 폼 화면 */}
            <Node ref={formScreen} x={mobile.width}>
              <Rect width={mobile.width} height={mobile.height} fill={colors.bgLight} />

              <Txt text="← 이전으로" fontSize={22} fill={colors.textMuted} fontFamily={fonts.main} x={-180} y={-480} />
              <Txt text="상담 신청" fontSize={40} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-380} />

              {/* 카카오 인증 완료 */}
              <Rect width={440} height={60} radius={12} fill={'#fef9c3'} stroke={'#fde047'} lineWidth={2} y={-300}>
                <Circle width={24} height={24} fill={colors.kakao} x={-180} />
                <Txt text="카카오 계정으로 이메일 입력됨" fontSize={20} fill={'#854d0e'} fontFamily={fonts.main} x={20} />
              </Rect>

              {/* 폼 */}
              <Rect width={440} height={400} radius={20} fill={colors.white} stroke={colors.wireframe} lineWidth={2} y={-20}>
                {/* 이름 */}
                <Node y={-140}>
                  <Txt text="이름 *" fontSize={20} fontWeight={500} fill={colors.text} fontFamily={fonts.main} x={-170} y={-50} />
                  <Rect width={380} height={60} radius={10} fill={colors.white} stroke={colors.wireframeDark} lineWidth={2}>
                    <Txt text="홍**" fontSize={24} fill={colors.text} fontFamily={fonts.main} x={-150} />
                  </Rect>
                </Node>

                {/* 연락처 */}
                <Node y={-20}>
                  <Txt text="연락처 *" fontSize={20} fontWeight={500} fill={colors.text} fontFamily={fonts.main} x={-163} y={-50} />
                  <Rect width={380} height={60} radius={10} fill={colors.white} stroke={colors.wireframeDark} lineWidth={2}>
                    <Txt text="010-0000-0000" fontSize={24} fill={colors.text} fontFamily={fonts.main} x={-95} />
                  </Rect>
                </Node>

                {/* 이메일 */}
                <Node y={100}>
                  <Txt text="이메일 *" fontSize={20} fontWeight={500} fill={colors.text} fontFamily={fonts.main} x={-163} y={-50} />
                  <Rect width={380} height={60} radius={10} fill={'#fef9c3'} stroke={'#fde047'} lineWidth={2}>
                    <Txt text="user@kakao.com" fontSize={24} fill={'#854d0e'} fontFamily={fonts.main} x={-80} />
                  </Rect>
                </Node>
              </Rect>

              {/* 제출 버튼 */}
              <Rect width={440} height={72} radius={16} fill={colors.primary} y={280}>
                <Txt text="신청 완료" fontSize={28} fontWeight={600} fill={colors.white} fontFamily={fonts.main} />
              </Rect>
            </Node>

            {/* 완료 화면 */}
            <Node ref={doneScreen} x={mobile.width * 2}>
              <Rect width={mobile.width} height={mobile.height} fill={'#f0fdf4'} />

              <Circle width={140} height={140} fill={'#dcfce7'} y={-100}>
                <Txt text="✓" fontSize={80} fill={colors.success} fontFamily={fonts.main} />
              </Circle>

              <Txt text="신청이 완료되었습니다" fontSize={40} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={60} />
              <Txt text="빠른 시일 내에 연락드리겠습니다" fontSize={26} fill={colors.textMuted} fontFamily={fonts.main} y={120} />
            </Node>
          </Node>
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

      {/* 클릭 인디케이터 */}
      <Circle
        ref={click1}
        width={100}
        height={100}
        fill={colors.primary + '4d'}
        stroke={colors.primary}
        lineWidth={4}
        x={680}
        y={220}
        scale={0}
        opacity={0}
      />

      <Circle
        ref={click2}
        width={100}
        height={100}
        fill={colors.primary + '4d'}
        stroke={colors.primary}
        lineWidth={4}
        x={680}
        y={400}
        scale={0}
        opacity={0}
      />

      {/* 키포인트 */}
      <Rect
        ref={keypoint}
        width={650}
        height={80}
        radius={20}
        fill={colors.success + '20'}
        stroke={colors.success}
        lineWidth={3}
        x={600}
        y={620}
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

  // === 애니메이션 (45초 버전 - 순차 유지) ===

  // 텍스트 순차 등장
  yield* all(
    stepLabel().opacity(1, 0.2),
    stepLabel().y(-530, 0.2, easeOutCubic),
  );
  yield* all(
    title().opacity(1, 0.25),
    title().y(-280, 0.25, easeOutCubic),
  );
  yield* subtitle().opacity(1, 0.2);

  yield* waitFor(0.1);

  // 스마트폰 등장
  yield* all(
    phone().opacity(1, 0.3),
    phone().scale(1.5, 0.3, easeOutCubic),
    phone().x(600, 0.3, easeOutCubic),
  );

  yield* waitFor(0.15);

  // 카카오 혜택 박스 등장
  yield* benefitBox().opacity(1, 0.2);

  // 혜택 순차 등장 (빠르게)
  yield* benefit1().opacity(1, 0.12);
  yield* benefit2().opacity(1, 0.12);
  yield* benefit3().opacity(1, 0.12);
  yield* benefit4().opacity(1, 0.12);

  yield* waitFor(0.15);

  // 스마트폰 확대
  yield* phone().scale(1.7, 0.2, easeInOutCubic);

  yield* waitFor(0.1);

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
  yield* screenOffset(-mobile.width, 0.3, easeInOutCubic);

  yield* waitFor(0.3);

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
  yield* screenOffset(-mobile.width * 2, 0.3, easeInOutCubic);

  // 스마트폰 원래 크기로
  yield* phone().scale(1.5, 0.2, easeInOutCubic);

  yield* waitFor(0.15);

  // 키포인트 등장
  yield* all(
    keypoint().opacity(1, 0.2),
    keypoint().y(580, 0.2, easeOutCubic),
  );

  yield* waitFor(0.8);

  // 페이드 아웃
  yield* root().opacity(0, 0.25);

});
