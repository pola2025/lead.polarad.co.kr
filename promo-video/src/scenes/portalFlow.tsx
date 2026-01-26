import { makeScene2D, Rect, Txt, Circle, Node, Line } from '@motion-canvas/2d';
import { all, chain, waitFor, createRef, createSignal, easeOutCubic, easeInOutCubic } from '@motion-canvas/core';
import { colors, mobile, fonts } from '../components/styles';

export default makeScene2D(function* (view) {
  view.fill('#0f172a');

  // Root 컨테이너
  const root = createRef<Node>();

  const deviceFrame = createRef<Rect>();
  const screenContent = createRef<Node>();
  const screenOffset = createSignal(0);

  const loginScreen = createRef<Node>();
  const statsScreen = createRef<Node>();
  const leadsScreen = createRef<Node>();

  const titleText = createRef<Txt>();
  const subtitleText = createRef<Txt>();

  // 클릭 인디케이터
  const loginClick = createRef<Circle>();
  const tabClick = createRef<Circle>();
  const statusClick = createRef<Circle>();

  view.add(
    <Node ref={root}>
      {/* 타이틀 */}
      <Txt
        ref={titleText}
        text="광고주 포털"
        fontSize={48}
        fontWeight={700}
        fill={'#ffffff'}
        fontFamily={fonts.main}
        y={-350}
        opacity={0}
      />

      <Txt
        ref={subtitleText}
        text="로그인 → 통계 대시보드 → 접수내역 관리"
        fontSize={24}
        fill={'#94a3b8'}
        fontFamily={fonts.main}
        y={-290}
        opacity={0}
      />

      {/* 모바일 디바이스 */}
      <Node y={60}>
        <Rect
          ref={deviceFrame}
          width={mobile.frameWidth}
          height={mobile.frameHeight}
          radius={mobile.borderRadius}
          fill={colors.deviceFrame}
          shadowColor={'#00000066'}
          shadowBlur={40}
          shadowOffsetY={15}
          scale={0}
        />

        <Rect
          width={mobile.width}
          height={mobile.height}
          radius={mobile.borderRadius - 10}
          fill={colors.deviceScreen}
          clip
          scale={() => deviceFrame().scale().x}
        >
          <Node ref={screenContent} x={() => screenOffset()}>
            {/* 로그인 화면 */}
            <Node ref={loginScreen} x={0}>
              <Rect width={mobile.width} height={mobile.height} fill={'#f8fafc'} />

              <Rect width={120} height={40} radius={8} fill={colors.wireframe} y={-200}>
                <Txt text="LOGO" fontSize={14} fill={colors.textMuted} fontFamily={fonts.main} />
              </Rect>

              <Txt text="광고주 포털 로그인" fontSize={24} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={-100} />

              <Rect width={340} height={200} radius={16} fill={'#ffffff'} stroke={colors.wireframe} lineWidth={1} y={50}>
                <Node y={-50}>
                  <Txt text="아이디" fontSize={13} fontWeight={500} fill={colors.text} fontFamily={fonts.main} x={-130} y={-20} />
                  <Rect width={300} height={44} radius={8} fill={'#ffffff'} stroke={colors.wireframeDark} lineWidth={1}>
                    <Txt text="advertiser" fontSize={15} fill={colors.text} fontFamily={fonts.main} x={-90} />
                  </Rect>
                </Node>

                <Node y={50}>
                  <Txt text="비밀번호" fontSize={13} fontWeight={500} fill={colors.text} fontFamily={fonts.main} x={-125} y={-20} />
                  <Rect width={300} height={44} radius={8} fill={'#ffffff'} stroke={colors.wireframeDark} lineWidth={1}>
                    <Txt text="••••••••" fontSize={15} fill={colors.text} fontFamily={fonts.main} x={-100} />
                  </Rect>
                </Node>
              </Rect>

              <Rect width={340} height={52} radius={12} fill={colors.primary} y={210}>
                <Txt text="로그인" fontSize={17} fontWeight={600} fill={'#ffffff'} fontFamily={fonts.main} />
              </Rect>
            </Node>

            {/* 통계 대시보드 */}
            <Node ref={statsScreen} x={mobile.width} opacity={0}>
              <Rect width={mobile.width} height={mobile.height} fill={'#f8fafc'} />

              <Rect width={mobile.width} height={70} fill={'#ffffff'} y={-387}>
                <Txt text="폴라리드" fontSize={18} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={15} x={-130} />
                <Txt text="↗️ 미리보기" fontSize={13} fill={colors.primary} fontFamily={fonts.main} y={15} x={130} />
              </Rect>

              <Node y={-330}>
                <Rect width={70} height={32} radius={16} fill={colors.primary} x={-140}>
                  <Txt text="통계" fontSize={13} fontWeight={600} fill={'#ffffff'} fontFamily={fonts.main} />
                </Rect>
                <Txt text="접수내역" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} x={-50} />
                <Txt text="수집정보" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} x={40} />
                <Txt text="메시지" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} x={120} />
              </Node>

              <Node y={-280}>
                <Rect width={50} height={28} radius={14} fill={colors.wireframe}>
                  <Txt text="7일" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} />
                </Rect>
                <Rect width={50} height={28} radius={14} fill={colors.primary} x={60}>
                  <Txt text="30일" fontSize={12} fill={'#ffffff'} fontFamily={fonts.main} />
                </Rect>
                <Rect width={50} height={28} radius={14} fill={colors.wireframe} x={120}>
                  <Txt text="90일" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} />
                </Rect>
              </Node>

              <Rect width={350} height={100} radius={16} fill={'#10b981'} y={-180}>
                <Node x={-100}>
                  <Txt text="30일 전환율" fontSize={12} fill={'#ffffffcc'} fontFamily={fonts.main} y={-25} />
                  <Txt text="23%" fontSize={40} fontWeight={700} fill={'#ffffff'} fontFamily={fonts.main} y={15} />
                </Node>
                <Node x={80}>
                  <Txt text="32%" fontSize={20} fontWeight={700} fill={'#ffffff'} fontFamily={fonts.main} y={-15} x={-30} />
                  <Txt text="로그인율" fontSize={10} fill={'#ffffffb3'} fontFamily={fonts.main} y={5} x={-30} />
                  <Txt text="72%" fontSize={20} fontWeight={700} fill={'#ffffff'} fontFamily={fonts.main} y={-15} x={50} />
                  <Txt text="접수율" fontSize={10} fill={'#ffffffb3'} fontFamily={fonts.main} y={5} x={50} />
                </Node>
              </Rect>

              <Rect width={350} height={150} radius={16} fill={'#ffffff'} stroke={colors.wireframe} lineWidth={1} y={-30}>
                <Txt text="전환 퍼널" fontSize={14} fontWeight={600} fill={colors.text} fontFamily={fonts.main} y={-55} x={-120} />

                <Node y={-15}>
                  <Txt text="방문" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} x={-140} />
                  <Rect width={220} height={10} radius={5} fill={colors.primary} x={30} />
                  <Txt text="1,234명" fontSize={11} fontWeight={600} fill={colors.text} fontFamily={fonts.main} x={150} />
                </Node>

                <Node y={15}>
                  <Txt text="로그인" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} x={-135} />
                  <Rect width={220} height={10} radius={5} fill={colors.wireframe} x={30}>
                    <Rect width={70} height={10} radius={5} fill={colors.warning} x={-75} />
                  </Rect>
                  <Txt text="395명" fontSize={11} fontWeight={600} fill={colors.text} fontFamily={fonts.main} x={150} />
                </Node>

                <Node y={45}>
                  <Txt text="접수완료" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} x={-132} />
                  <Rect width={220} height={10} radius={5} fill={colors.wireframe} x={30}>
                    <Rect width={50} height={10} radius={5} fill={colors.success} x={-85} />
                  </Rect>
                  <Txt text="284명" fontSize={11} fontWeight={600} fill={colors.text} fontFamily={fonts.main} x={150} />
                </Node>
              </Rect>

              <Rect width={350} height={100} radius={16} fill={'#ffffff'} stroke={colors.wireframe} lineWidth={1} y={100}>
                <Txt text="기기별 방문자" fontSize={14} fontWeight={600} fill={colors.text} fontFamily={fonts.main} y={-30} x={-105} />
                <Node y={15}>
                  <Node x={-100}>
                    <Txt text="📱 모바일" fontSize={13} fill={colors.text} fontFamily={fonts.main} x={-10} />
                    <Txt text="78%" fontSize={16} fontWeight={700} fill={colors.text} fontFamily={fonts.main} x={60} />
                  </Node>
                  <Node x={80}>
                    <Txt text="💻 데스크톱" fontSize={13} fill={colors.text} fontFamily={fonts.main} x={-5} />
                    <Txt text="22%" fontSize={16} fontWeight={700} fill={colors.text} fontFamily={fonts.main} x={70} />
                  </Node>
                </Node>
              </Rect>

              <Rect width={350} height={70} radius={16} fill={'#6366f1'} y={210}>
                <Txt text="클릭 히트맵" fontSize={16} fontWeight={600} fill={'#ffffff'} fontFamily={fonts.main} x={-100} />
                <Rect width={80} height={32} radius={8} fill={'#8b8bf5'} x={110}>
                  <Txt text="전체보기" fontSize={12} fill={'#ffffff'} fontFamily={fonts.main} />
                </Rect>
              </Rect>
            </Node>

            {/* 접수내역 화면 */}
            <Node ref={leadsScreen} x={mobile.width * 2} opacity={0}>
              <Rect width={mobile.width} height={mobile.height} fill={'#f8fafc'} />

              <Rect width={mobile.width} height={70} fill={'#ffffff'} y={-387}>
                <Txt text="폴라리드" fontSize={18} fontWeight={700} fill={colors.text} fontFamily={fonts.main} y={15} x={-130} />
              </Rect>

              <Node y={-330}>
                <Txt text="통계" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} x={-140} />
                <Rect width={80} height={32} radius={16} fill={colors.primary} x={-50}>
                  <Txt text="접수내역" fontSize={13} fontWeight={600} fill={'#ffffff'} fontFamily={fonts.main} />
                </Rect>
                <Txt text="수집정보" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} x={40} />
                <Txt text="메시지" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} x={120} />
              </Node>

              <Node y={-275}>
                <Rect width={240} height={40} radius={8} fill={'#ffffff'} stroke={colors.wireframeDark} lineWidth={1} x={-50}>
                  <Txt text="🔍 검색..." fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} x={-80} />
                </Rect>
                <Rect width={80} height={40} radius={8} fill={'#ffffff'} stroke={colors.wireframeDark} lineWidth={1} x={135}>
                  <Txt text="전체 ▾" fontSize={13} fill={colors.text} fontFamily={fonts.main} />
                </Rect>
              </Node>

              <Node y={-215}>
                <Rect width={68} height={50} radius={8} fill={colors.warningLight} x={-138}>
                  <Txt text="3" fontSize={18} fontWeight={700} fill={colors.warning} fontFamily={fonts.main} y={-8} />
                  <Txt text="카카오만" fontSize={9} fill={colors.warning} fontFamily={fonts.main} y={12} />
                </Rect>
                <Rect width={68} height={50} radius={8} fill={'#dbeafe'} x={-62}>
                  <Txt text="12" fontSize={18} fontWeight={700} fill={colors.primary} fontFamily={fonts.main} y={-8} />
                  <Txt text="신규" fontSize={9} fill={colors.primary} fontFamily={fonts.main} y={12} />
                </Rect>
                <Rect width={68} height={50} radius={8} fill={colors.purpleLight} x={14}>
                  <Txt text="8" fontSize={18} fontWeight={700} fill={colors.purple} fontFamily={fonts.main} y={-8} />
                  <Txt text="연락완료" fontSize={9} fill={colors.purple} fontFamily={fonts.main} y={12} />
                </Rect>
                <Rect width={68} height={50} radius={8} fill={colors.successLight} x={90}>
                  <Txt text="5" fontSize={18} fontWeight={700} fill={colors.success} fontFamily={fonts.main} y={-8} />
                  <Txt text="전환" fontSize={9} fill={colors.success} fontFamily={fonts.main} y={12} />
                </Rect>
              </Node>

              {/* 리드 카드 1 */}
              <Rect width={350} height={130} radius={12} fill={'#ffffff'} stroke={colors.wireframe} lineWidth={1} y={-100}>
                <Rect width={45} height={22} radius={11} fill={'#dbeafe'} x={-130} y={-40}>
                  <Txt text="신규" fontSize={10} fontWeight={600} fill={colors.primary} fontFamily={fonts.main} />
                </Rect>
                <Txt text="1월 24일 14:32" fontSize={11} fill={colors.textMuted} fontFamily={fonts.main} x={50} y={-40} />

                <Txt text="김**" fontSize={15} fontWeight={600} fill={colors.text} fontFamily={fonts.main} x={-135} y={-10} />
                <Txt text="📞 010-0000-0000" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} x={-88} y={15} />

                <Node y={45}>
                  <Rect width={70} height={30} radius={6} fill={colors.purpleLight} stroke={colors.purple} lineWidth={1} x={-100}>
                    <Txt text="📞 연락완료" fontSize={10} fontWeight={500} fill={colors.purple} fontFamily={fonts.main} />
                  </Rect>
                  <Rect width={60} height={30} radius={6} fill={colors.successLight} stroke={colors.success} lineWidth={1} x={-15}>
                    <Txt text="✅ 전환" fontSize={10} fontWeight={500} fill={colors.success} fontFamily={fonts.main} />
                  </Rect>
                  <Txt text="⋮" fontSize={20} fill={colors.textMuted} fontFamily={fonts.main} x={140} />
                </Node>
              </Rect>

              {/* 리드 카드 2 */}
              <Rect width={350} height={130} radius={12} fill={'#ffffff'} stroke={colors.wireframe} lineWidth={1} y={50}>
                <Rect width={55} height={22} radius={11} fill={colors.purpleLight} x={-128} y={-40}>
                  <Txt text="연락완료" fontSize={10} fontWeight={600} fill={colors.purple} fontFamily={fonts.main} />
                </Rect>
                <Txt text="1월 24일 10:15" fontSize={11} fill={colors.textMuted} fontFamily={fonts.main} x={50} y={-40} />

                <Txt text="이**" fontSize={15} fontWeight={600} fill={colors.text} fontFamily={fonts.main} x={-135} y={-10} />
                <Txt text="📞 010-0000-0000" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} x={-88} y={15} />

                <Node y={45}>
                  <Rect width={60} height={30} radius={6} fill={'#dbeafe'} stroke={colors.primary} lineWidth={1} x={-108}>
                    <Txt text="↩️ 신규" fontSize={10} fontWeight={500} fill={colors.primary} fontFamily={fonts.main} />
                  </Rect>
                  <Rect width={60} height={30} radius={6} fill={colors.successLight} stroke={colors.success} lineWidth={1} x={-35}>
                    <Txt text="✅ 전환" fontSize={10} fontWeight={500} fill={colors.success} fontFamily={fonts.main} />
                  </Rect>
                  <Txt text="⋮" fontSize={20} fill={colors.textMuted} fontFamily={fonts.main} x={140} />
                </Node>
              </Rect>

              {/* 리드 카드 3 */}
              <Rect width={350} height={130} radius={12} fill={'#ffffff'} stroke={colors.wireframe} lineWidth={1} y={200}>
                <Rect width={45} height={22} radius={11} fill={colors.successLight} x={-130} y={-40}>
                  <Txt text="전환" fontSize={10} fontWeight={600} fill={colors.success} fontFamily={fonts.main} />
                </Rect>
                <Txt text="1월 23일 16:45" fontSize={11} fill={colors.textMuted} fontFamily={fonts.main} x={50} y={-40} />

                <Txt text="박**" fontSize={15} fontWeight={600} fill={colors.text} fontFamily={fonts.main} x={-135} y={-10} />
                <Txt text="📞 010-0000-0000" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} x={-88} y={15} />

                <Node y={45}>
                  <Rect width={60} height={30} radius={6} fill={'#dbeafe'} stroke={colors.primary} lineWidth={1} x={-108}>
                    <Txt text="↩️ 신규" fontSize={10} fontWeight={500} fill={colors.primary} fontFamily={fonts.main} />
                  </Rect>
                  <Txt text="⋮" fontSize={20} fill={colors.textMuted} fontFamily={fonts.main} x={140} />
                </Node>
              </Rect>
            </Node>
          </Node>
        </Rect>

        {/* 다이나믹 아일랜드 */}
        <Rect
          width={mobile.notchWidth}
          height={mobile.notchHeight}
          radius={17}
          fill={colors.deviceFrame}
          y={-mobile.height / 2 + 24}
          scale={() => deviceFrame().scale().x}
        />
      </Node>

      {/* 클릭 인디케이터들 */}
      <Circle
        ref={loginClick}
        width={60}
        height={60}
        fill={'#3b82f64d'}
        stroke={colors.primary}
        lineWidth={3}
        y={60 + 210}
        scale={0}
        opacity={0}
      />

      <Circle
        ref={tabClick}
        width={50}
        height={50}
        fill={'#3b82f64d'}
        stroke={colors.primary}
        lineWidth={3}
        x={-50}
        y={60 - 330}
        scale={0}
        opacity={0}
      />

      <Circle
        ref={statusClick}
        width={50}
        height={50}
        fill={'#8b5cf64d'}
        stroke={colors.purple}
        lineWidth={3}
        x={-100}
        y={60 - 100 + 45}
        scale={0}
        opacity={0}
      />
    </Node>
  );

  // === 애니메이션 시작 ===
  yield* all(
    titleText().opacity(1, 0.6),
    titleText().y(-320, 0.6, easeOutCubic),
  );

  yield* all(
    subtitleText().opacity(1, 0.4),
    subtitleText().y(-270, 0.4, easeOutCubic),
  );

  yield* waitFor(0.5);

  // 디바이스 등장
  yield* deviceFrame().scale(1, 0.8, easeOutCubic);

  yield* waitFor(1);

  // === 로그인 버튼 클릭 ===
  yield* all(
    loginClick().scale(1, 0.3),
    loginClick().opacity(1, 0.3),
  );

  yield* all(
    loginClick().scale(1.5, 0.4),
    loginClick().opacity(0, 0.4),
  );

  // === 통계 대시보드로 전환 ===
  statsScreen().opacity(1);
  yield* screenOffset(-mobile.width, 0.6, easeInOutCubic);

  yield* waitFor(2);

  // === 접수내역 탭 클릭 ===
  yield* all(
    tabClick().scale(1, 0.3),
    tabClick().opacity(1, 0.3),
  );

  yield* all(
    tabClick().scale(1.5, 0.4),
    tabClick().opacity(0, 0.4),
  );

  // === 접수내역 화면으로 전환 ===
  leadsScreen().opacity(1);
  yield* screenOffset(-mobile.width * 2, 0.6, easeInOutCubic);

  yield* waitFor(1.5);

  // === 상태 버튼 클릭 ===
  yield* all(
    statusClick().scale(1, 0.3),
    statusClick().opacity(1, 0.3),
  );

  yield* all(
    statusClick().scale(1.5, 0.4),
    statusClick().opacity(0, 0.4),
  );

  yield* waitFor(1.5);

  // === 씬 종료 ===
  yield* all(
    deviceFrame().scale(0.9, 0.5),
    deviceFrame().opacity(0, 0.5),
    titleText().opacity(0, 0.4),
    subtitleText().opacity(0, 0.4),
  );

  yield* waitFor(0.3);

  // root 노드 제거
});
