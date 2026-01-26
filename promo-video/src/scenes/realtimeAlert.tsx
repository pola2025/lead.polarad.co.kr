import { makeScene2D, Rect, Txt, Circle, Node } from '@motion-canvas/2d';
import { all, chain, waitFor, createRef, easeOutCubic, easeInOutCubic, easeOutBack } from '@motion-canvas/core';
import { colors, fonts, fontSize, canvas, spacing, mobile } from '../components/styles';

export default makeScene2D(function* (view) {
  view.fill(colors.bgDark);
  view.size([canvas.width, canvas.height]);

  const root = createRef<Node>();
  const textArea = createRef<Node>();
  const stepLabel = createRef<Txt>();
  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();
  const keypoint = createRef<Rect>();

  // 스마트폰 (접수 완료 화면)
  const phoneLeft = createRef<Node>();

  // 화살표
  const arrow = createRef<Node>();

  // 텔레그램 알림
  const telegramPhone = createRef<Node>();
  const notification = createRef<Node>();
  const notifBadge = createRef<Circle>();

  view.add(
    <Node ref={root}>
      {/* 상단 텍스트 */}
      <Node ref={textArea} y={-300}>
        <Txt
          ref={stepLabel}
          text="STEP 03"
          fontSize={fontSize.lg}
          fontWeight={600}
          fill={colors.telegram}
          fontFamily={fonts.main}
          opacity={0}
        />

        <Txt
          ref={title}
          text="실시간 알림"
          fontSize={fontSize['4xl']}
          fontWeight={900}
          fill={colors.white}
          fontFamily={fonts.main}
          y={120}
          opacity={0}
        />

        <Txt
          ref={subtitle}
          text="접수 즉시 텔레그램으로 알림 전송"
          fontSize={fontSize.xl}
          fill={colors.textLight}
          fontFamily={fonts.main}
          y={250}
          opacity={0}
        />
      </Node>

      {/* 왼쪽: 접수 완료 화면 */}
      <Node ref={phoneLeft} x={-700} y={-50} opacity={0} scale={1.0}>
        <Rect
          width={mobile.frameWidth}
          height={mobile.frameHeight}
          radius={mobile.borderRadius}
          fill={colors.deviceFrame}
          shadowColor={'#00000066'}
          shadowBlur={60}
          shadowOffsetY={20}
        />

        <Rect
          width={mobile.width}
          height={mobile.height}
          radius={mobile.borderRadius - 10}
          fill={'#f0fdf4'}
          clip
        >
          <Circle width={140} height={140} fill={'#dcfce7'} y={-100}>
            <Txt text="✓" fontSize={80} fill={colors.success} fontFamily={fonts.main} />
          </Circle>

          <Txt text="신청이 완료되었습니다" fontSize={40} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={60} />
          <Txt text="빠른 시일 내에 연락드리겠습니다" fontSize={26} fill={colors.textMuted} fontFamily={fonts.main} y={120} />

          {/* 라벨 */}
          <Rect width={300} height={60} radius={30} fill={colors.success} y={400}>
            <Txt text="고객 접수 화면" fontSize={24} fontWeight={600} fill={colors.white} fontFamily={fonts.main} />
          </Rect>
        </Rect>

        <Rect
          width={mobile.notchWidth}
          height={mobile.notchHeight}
          radius={24}
          fill={colors.deviceFrame}
          y={-mobile.height / 2 + 30}
        />
      </Node>

      {/* 중앙: 화살표 + 알림 아이콘 */}
      <Node ref={arrow} y={-50} opacity={0}>
        {/* 화살표 */}
        <Rect width={300} height={10} radius={5} fill={colors.textLight} />
        <Rect width={50} height={10} radius={5} fill={colors.textLight} x={120} y={-20} rotation={45} />
        <Rect width={50} height={10} radius={5} fill={colors.textLight} x={120} y={20} rotation={-45} />

        {/* 실시간 텍스트 */}
        <Txt text="실시간" fontSize={fontSize.base} fontWeight={600} fill={colors.telegram} fontFamily={fonts.main} y={-80} />

        {/* 알림 아이콘 */}
        <Circle width={80} height={80} fill={colors.telegram} y={80}>
          <Txt text="🔔" fontSize={40} fontFamily={fonts.main} />
        </Circle>
      </Node>

      {/* 오른쪽: 텔레그램 알림 화면 */}
      <Node ref={telegramPhone} x={700} y={-50} opacity={0} scale={1.0}>
        <Rect
          width={mobile.frameWidth}
          height={mobile.frameHeight}
          radius={mobile.borderRadius}
          fill={colors.deviceFrame}
          shadowColor={'#00000066'}
          shadowBlur={60}
          shadowOffsetY={20}
        />

        <Rect
          width={mobile.width}
          height={mobile.height}
          radius={mobile.borderRadius - 10}
          fill={'#212121'}
          clip
        >
          {/* 상태바 영역 (노치 아래, 디스플레이 시작) */}
          <Rect width={mobile.width} height={40} fill={'#212121'} y={-mobile.height / 2 + 80}>
            <Txt text="9:41" fontSize={16} fontWeight={600} fill={colors.white} fontFamily={fonts.main} x={-200} />
            <Txt text="🔋" fontSize={14} fontFamily={fonts.main} x={200} />
          </Rect>

          {/* 텔레그램 헤더 - 상태바 아래 */}
          <Rect width={mobile.width} height={100} fill={'#212121'} y={-mobile.height / 2 + 150}>
            {/* 뒤로가기 */}
            <Txt text="←" fontSize={32} fill={colors.white} fontFamily={fonts.main} x={-210} />
            {/* 프로필 - 분홍색 원에 "폴" */}
            <Circle width={52} height={52} fill={'#e91e63'} x={-140}>
              <Txt text="폴" fontSize={24} fontWeight={700} fill={colors.white} fontFamily={fonts.main} />
            </Circle>
            <Node x={20}>
              <Txt text="폴라애드랜딩" fontSize={24} fontWeight={600} fill={colors.white} fontFamily={fonts.main} y={-12} />
              <Txt text="2 subscribers" fontSize={16} fill={colors.textMuted} fontFamily={fonts.main} y={14} />
            </Node>
            {/* 우측 아이콘 */}
            <Txt text="⋮" fontSize={28} fill={colors.textLight} fontFamily={fonts.main} x={210} />
          </Rect>

          {/* 채팅 배경 (어두운 배경) */}
          <Rect width={mobile.width} height={mobile.height - 160} fill={'#212121'} y={30} />

          {/* 알림 메시지 - 메인 (실제 UI 반영) */}
          <Node ref={notification} y={-80} opacity={0} scale={0.9}>
            <Rect width={420} height={280} radius={12} fill={'#2b2b2b'} x={-20}>
              {/* 제목 */}
              <Txt text="🔔 새로운 리드 접수" fontSize={22} fontWeight={600} fill={colors.white} fontFamily={fonts.main} y={-100} x={-180} offsetX={-1} />

              {/* 클라이언트 */}
              <Txt text="🏢 클라이언트: 폴라애드" fontSize={18} fill={colors.white} fontFamily={fonts.main} y={-55} x={-180} offsetX={-1} />

              {/* 이름 */}
              <Txt text="👤 이름: 홍**" fontSize={18} fill={colors.white} fontFamily={fonts.main} y={-20} x={-180} offsetX={-1} />

              {/* 연락처 - 파란색 링크 */}
              <Node y={15}>
                <Txt text="📞 연락처: " fontSize={18} fill={colors.white} fontFamily={fonts.main} x={-180} offsetX={-1} />
                <Txt text="010-0000-0000" fontSize={18} fill={'#3390ec'} fontFamily={fonts.main} x={-68} offsetX={-1} />
              </Node>

              {/* 시간 */}
              <Txt text="⏰ 시간: 01/24 오후 2:32:15" fontSize={18} fill={colors.white} fontFamily={fonts.main} y={50} x={-180} offsetX={-1} />

              {/* 접수내역확인 버튼 */}
              <Txt text="접수내역확인" fontSize={18} fill={'#3390ec'} fontFamily={fonts.main} y={90} x={-180} offsetX={-1} />

              {/* 시스템 서명 + 시간 */}
              <Node y={120}>
                <Txt text="-Polalead System-" fontSize={14} fill={colors.textMuted} fontFamily={fonts.main} x={-180} offsetX={-1} />
                <Txt text="2 ◎ 14:32" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} x={155} />
              </Node>
            </Rect>
          </Node>

          {/* 이전 메시지들 - 실제 형식 반영 */}
          <Rect width={400} height={100} radius={12} fill={'#2b2b2b'} x={-30} y={150}>
            <Txt text="🔔 새로운 리드 접수" fontSize={16} fontWeight={600} fill={colors.white} fontFamily={fonts.main} y={-25} x={-170} offsetX={-1} />
            <Node y={5}>
              <Txt text="👤 이름: 김**  📞 " fontSize={14} fill={colors.white} fontFamily={fonts.main} x={-170} offsetX={-1} />
              <Txt text="010-0000-0000" fontSize={14} fill={'#3390ec'} fontFamily={fonts.main} x={-30} offsetX={-1} />
            </Node>
            <Node y={35}>
              <Txt text="-Polalead System-" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} x={-170} offsetX={-1} />
              <Txt text="2 ◎ 14:28" fontSize={11} fill={colors.textMuted} fontFamily={fonts.main} x={155} />
            </Node>
          </Rect>

          <Rect width={400} height={100} radius={12} fill={'#2b2b2b'} x={-30} y={270}>
            <Txt text="🔔 새로운 리드 접수" fontSize={16} fontWeight={600} fill={colors.white} fontFamily={fonts.main} y={-25} x={-170} offsetX={-1} />
            <Node y={5}>
              <Txt text="👤 이름: 이**  📞 " fontSize={14} fill={colors.white} fontFamily={fonts.main} x={-170} offsetX={-1} />
              <Txt text="010-0000-0000" fontSize={14} fill={'#3390ec'} fontFamily={fonts.main} x={-30} offsetX={-1} />
            </Node>
            <Node y={35}>
              <Txt text="-Polalead System-" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} x={-170} offsetX={-1} />
              <Txt text="2 ◎ 14:25" fontSize={11} fill={colors.textMuted} fontFamily={fonts.main} x={155} />
            </Node>
          </Rect>

          {/* 하단 Broadcast 바 */}
          <Rect width={mobile.width} height={80} fill={'#212121'} y={mobile.height / 2 - 40}>
            <Rect width={mobile.width - 40} height={1} fill={'#333'} y={-35} />
            <Circle width={36} height={36} fill={'#21212100'} x={-180}>
              <Txt text="🔔" fontSize={22} fontFamily={fonts.main} />
            </Circle>
            <Txt text="Broadcast" fontSize={20} fill={colors.white} fontFamily={fonts.main} x={-70} />
            <Txt text="✏️" fontSize={20} fontFamily={fonts.main} x={130} />
            <Txt text="🎤" fontSize={20} fontFamily={fonts.main} x={180} />
          </Rect>
        </Rect>

        {/* 라벨 - 디스플레이 밖 */}
        <Rect width={300} height={50} radius={25} fill={colors.telegram} y={mobile.height / 2 + 80}>
          <Txt text="클라이언트 텔레그램" fontSize={22} fontWeight={600} fill={colors.white} fontFamily={fonts.main} />
        </Rect>

        <Rect
          width={mobile.notchWidth}
          height={mobile.notchHeight}
          radius={24}
          fill={colors.deviceFrame}
          y={-mobile.height / 2 + 30}
        />

        {/* 알림 뱃지 */}
        <Circle
          ref={notifBadge}
          width={60}
          height={60}
          fill={colors.error}
          x={230}
          y={-350}
          opacity={0}
          scale={0}
        >
          <Txt text="1" fontSize={32} fontWeight={700} fill={colors.white} fontFamily={fonts.main} />
        </Circle>
      </Node>

      {/* 키포인트 */}
      <Rect
        ref={keypoint}
        width={850}
        height={100}
        radius={20}
        fill={colors.telegram + '20'}
        stroke={colors.telegram}
        lineWidth={3}
        y={980}
        opacity={0}
      >
        <Txt
          text="🔔 놓치는 리드 없이 실시간 확인"
          fontSize={fontSize.lg}
          fontWeight={600}
          fill={colors.telegram}
          fontFamily={fonts.main}
        />
      </Rect>
    </Node>
  );

  // === 애니메이션 (45초 버전 - 순차 유지) ===

  // 1. 텍스트 순차 등장
  yield* stepLabel().opacity(1, 0.2);
  yield* all(
    title().opacity(1, 0.25),
    title().y(140, 0.25, easeOutCubic),
  );
  yield* all(
    subtitle().opacity(1, 0.2),
    subtitle().y(280, 0.2, easeOutCubic),
  );

  yield* waitFor(0.3);

  // 2. 텍스트 사라지면서 위로 이동
  yield* all(
    textArea().opacity(0, 0.25),
    textArea().y(-400, 0.25, easeInOutCubic),
  );

  // 3. 스마트폰들 등장
  yield* all(
    phoneLeft().opacity(1, 0.3),
    phoneLeft().scale(1.5, 0.3, easeOutCubic),
    telegramPhone().opacity(1, 0.3),
    telegramPhone().scale(1.5, 0.3, easeOutCubic),
  );

  yield* waitFor(0.15);

  // 화살표 등장
  yield* arrow().opacity(1, 0.2);

  yield* waitFor(0.15);

  // 알림 뱃지 등장
  yield* all(
    notifBadge().opacity(1, 0.15),
    notifBadge().scale(1, 0.15, easeOutBack),
  );

  yield* waitFor(0.1);

  // 알림 메시지 등장
  yield* all(
    notification().opacity(1, 0.25),
    notification().scale(1, 0.25, easeOutBack),
  );

  yield* waitFor(0.2);

  // 키포인트 등장
  yield* all(
    keypoint().opacity(1, 0.2),
    keypoint().y(950, 0.2, easeOutCubic),
  );

  yield* waitFor(1);

  // 페이드 아웃
  yield* root().opacity(0, 0.25);

});
