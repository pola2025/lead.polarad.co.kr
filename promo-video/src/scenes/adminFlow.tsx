import { makeScene2D, Rect, Txt, Circle, Node, Line } from '@motion-canvas/2d';
import { all, chain, waitFor, createRef, createSignal, easeOutCubic, easeInOutCubic } from '@motion-canvas/core';
import { colors, desktop, fonts } from '../components/styles';

export default makeScene2D(function* (view) {
  view.fill('#0f172a');

  // Root 컨테이너
  const root = createRef<Node>();

  const desktopFrame = createRef<Rect>();
  const screenContent = createRef<Node>();

  const titleText = createRef<Txt>();
  const subtitleText = createRef<Txt>();

  // 하이라이트 요소들
  const filterHighlight = createRef<Rect>();
  const rowHighlight = createRef<Rect>();
  const menuHighlight = createRef<Node>();

  // 클릭 인디케이터
  const moreClick = createRef<Circle>();
  const statusClick = createRef<Circle>();

  // 브라우저 크기
  const browserWidth = 1100;
  const browserHeight = 650;

  view.add(
    <Node ref={root}>
      {/* 타이틀 */}
      <Txt
        ref={titleText}
        text="클라이언트 포털 (PC)"
        fontSize={48}
        fontWeight={700}
        fill={'#ffffff'}
        fontFamily={fonts.main}
        y={-420}
        opacity={0}
      />

      <Txt
        ref={subtitleText}
        text="대시보드 → 접수내역 조회 → 상태 확인"
        fontSize={24}
        fill={'#94a3b8'}
        fontFamily={fonts.main}
        y={-370}
        opacity={0}
      />

      {/* PC 브라우저 프레임 */}
      <Node y={50}>
        <Rect
          ref={desktopFrame}
          width={browserWidth + 20}
          height={browserHeight + 60}
          radius={12}
          fill={'#1f2937'}
          shadowColor={'#00000080'}
          shadowBlur={50}
          shadowOffsetY={20}
          scale={0}
        >
          {/* 브라우저 탑바 */}
          <Rect width={browserWidth + 20} height={40} fill={'#374151'} radius={[12, 12, 0, 0]} y={-browserHeight / 2 - 10}>
            <Circle width={12} height={12} fill={'#ef4444'} x={-browserWidth / 2 + 30} />
            <Circle width={12} height={12} fill={'#f59e0b'} x={-browserWidth / 2 + 55} />
            <Circle width={12} height={12} fill={'#10b981'} x={-browserWidth / 2 + 80} />

            <Rect width={500} height={26} radius={6} fill={'#1f2937'}>
              <Txt text="🔒 portal.polarad.co.kr" fontSize={12} fill={'#9ca3af'} fontFamily={fonts.main} x={-165} />
            </Rect>
          </Rect>

          {/* 화면 영역 */}
          <Rect width={browserWidth} height={browserHeight} fill={'#f8fafc'} y={20} clip>
            <Node ref={screenContent}>
              {/* 사이드바 */}
              <Rect width={220} height={browserHeight} fill={'#ffffff'} x={-browserWidth / 2 + 110}>
                <Rect width={160} height={40} radius={8} fill={colors.wireframe} y={-browserHeight / 2 + 50}>
                  <Txt text="폴라리드" fontSize={16} fontWeight={700} fill={colors.text} fontFamily={fonts.main} />
                </Rect>

                <Node y={-browserHeight / 2 + 130}>
                  <Rect width={180} height={44} radius={8} fill={'#dbeafe'}>
                    <Txt text="📊 대시보드" fontSize={14} fontWeight={600} fill={colors.primary} fontFamily={fonts.main} />
                  </Rect>
                </Node>
                <Node y={-browserHeight / 2 + 185}>
                  <Rect width={180} height={44} radius={8} fill={colors.wireframe}>
                    <Txt text="📋 접수내역" fontSize={14} fill={colors.textMuted} fontFamily={fonts.main} />
                  </Rect>
                </Node>
                <Node y={-browserHeight / 2 + 240}>
                  <Rect width={180} height={44} radius={8} fill={colors.wireframe}>
                    <Txt text="📝 수집정보 설정" fontSize={14} fill={colors.textMuted} fontFamily={fonts.main} />
                  </Rect>
                </Node>
                <Node y={-browserHeight / 2 + 295}>
                  <Rect width={180} height={44} radius={8} fill={colors.wireframe}>
                    <Txt text="💬 메시지 설정" fontSize={14} fill={colors.textMuted} fontFamily={fonts.main} />
                  </Rect>
                </Node>
                <Node y={-browserHeight / 2 + 350}>
                  <Rect width={180} height={44} radius={8} fill={colors.wireframe}>
                    <Txt text="⚙️ 설정" fontSize={14} fill={colors.textMuted} fontFamily={fonts.main} />
                  </Rect>
                </Node>
              </Rect>

              {/* 메인 콘텐츠 영역 */}
              <Node x={130}>
                {/* 헤더 */}
                <Node y={-browserHeight / 2 + 50}>
                  <Txt text="대시보드" fontSize={24} fontWeight={700} fill={colors.text} fontFamily={fonts.main} x={-300} />
                  <Txt text="랜딩 페이지 성과와 접수 현황을 확인하세요" fontSize={14} fill={colors.textMuted} fontFamily={fonts.main} x={-218} y={35} />
                </Node>

                {/* 전환율 히어로 카드 */}
                <Rect width={820} height={120} radius={16} fill={'#10b981'} y={-browserHeight / 2 + 150}>
                  <Node x={-280}>
                    <Txt text="30일 전환율" fontSize={14} fill={'#ffffffcc'} fontFamily={fonts.main} y={-25} />
                    <Txt text="23%" fontSize={48} fontWeight={700} fill={'#ffffff'} fontFamily={fonts.main} y={20} />
                  </Node>
                  <Node x={-50}>
                    <Txt text="방문자" fontSize={12} fill={'#ffffffcc'} fontFamily={fonts.main} y={-20} />
                    <Txt text="1,234명" fontSize={24} fontWeight={700} fill={'#ffffff'} fontFamily={fonts.main} y={10} />
                  </Node>
                  <Node x={100}>
                    <Txt text="로그인" fontSize={12} fill={'#ffffffcc'} fontFamily={fonts.main} y={-20} />
                    <Txt text="395명" fontSize={24} fontWeight={700} fill={'#ffffff'} fontFamily={fonts.main} y={10} />
                  </Node>
                  <Node x={250}>
                    <Txt text="접수완료" fontSize={12} fill={'#ffffffcc'} fontFamily={fonts.main} y={-20} />
                    <Txt text="284명" fontSize={24} fontWeight={700} fill={'#ffffff'} fontFamily={fonts.main} y={10} />
                  </Node>
                </Rect>

                {/* 상태별 현황 */}
                <Node y={-browserHeight / 2 + 250}>
                  <Rect width={195} height={80} radius={12} fill={'#ffffff'} stroke={colors.wireframe} lineWidth={1} x={-310}>
                    <Rect width={40} height={40} radius={8} fill={colors.warningLight} x={-55}>
                      <Txt text="⏳" fontSize={18} fontFamily={fonts.main} />
                    </Rect>
                    <Node x={25}>
                      <Txt text="카카오만" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} y={-10} />
                      <Txt text="3건" fontSize={20} fontWeight={700} fill={colors.warning} fontFamily={fonts.main} y={15} />
                    </Node>
                  </Rect>

                  <Rect width={195} height={80} radius={12} fill={'#ffffff'} stroke={colors.wireframe} lineWidth={1} x={-100}>
                    <Rect width={40} height={40} radius={8} fill={'#dbeafe'} x={-55}>
                      <Txt text="🆕" fontSize={18} fontFamily={fonts.main} />
                    </Rect>
                    <Node x={25}>
                      <Txt text="신규" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} y={-10} />
                      <Txt text="12건" fontSize={20} fontWeight={700} fill={colors.primary} fontFamily={fonts.main} y={15} />
                    </Node>
                  </Rect>

                  <Rect width={195} height={80} radius={12} fill={'#ffffff'} stroke={colors.wireframe} lineWidth={1} x={110}>
                    <Rect width={40} height={40} radius={8} fill={colors.purpleLight} x={-55}>
                      <Txt text="📞" fontSize={18} fontFamily={fonts.main} />
                    </Rect>
                    <Node x={25}>
                      <Txt text="연락완료" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} y={-10} />
                      <Txt text="8건" fontSize={20} fontWeight={700} fill={colors.purple} fontFamily={fonts.main} y={15} />
                    </Node>
                  </Rect>

                  <Rect width={195} height={80} radius={12} fill={'#ffffff'} stroke={colors.wireframe} lineWidth={1} x={320}>
                    <Rect width={40} height={40} radius={8} fill={colors.successLight} x={-55}>
                      <Txt text="✅" fontSize={18} fontFamily={fonts.main} />
                    </Rect>
                    <Node x={25}>
                      <Txt text="전환" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} y={-10} />
                      <Txt text="5건" fontSize={20} fontWeight={700} fill={colors.success} fontFamily={fonts.main} y={15} />
                    </Node>
                  </Rect>
                </Node>

                {/* 최근 접수 테이블 */}
                <Rect width={820} height={280} radius={12} fill={'#ffffff'} stroke={colors.wireframe} lineWidth={1} y={100}>
                  <Txt text="최근 접수내역" fontSize={16} fontWeight={600} fill={colors.text} fontFamily={fonts.main} y={-115} x={-330} />

                  {/* 테이블 헤더 */}
                  <Rect width={780} height={40} fill={'#f8fafc'} radius={[8, 8, 0, 0]} y={-80}>
                    <Txt text="상태" fontSize={12} fontWeight={600} fill={colors.textMuted} fontFamily={fonts.main} x={-330} />
                    <Txt text="이름" fontSize={12} fontWeight={600} fill={colors.textMuted} fontFamily={fonts.main} x={-230} />
                    <Txt text="연락처" fontSize={12} fontWeight={600} fill={colors.textMuted} fontFamily={fonts.main} x={-100} />
                    <Txt text="이메일" fontSize={12} fontWeight={600} fill={colors.textMuted} fontFamily={fonts.main} x={60} />
                    <Txt text="접수일시" fontSize={12} fontWeight={600} fill={colors.textMuted} fontFamily={fonts.main} x={220} />
                    <Txt text="액션" fontSize={12} fontWeight={600} fill={colors.textMuted} fontFamily={fonts.main} x={340} />
                  </Rect>

                  {/* 행 1 */}
                  <Node y={-30}>
                    <Rect
                      ref={rowHighlight}
                      width={780}
                      height={45}
                      radius={4}
                      fill={null}
                    />
                    <Rect width={50} height={24} radius={12} fill={'#dbeafe'} x={-330}>
                      <Txt text="신규" fontSize={11} fontWeight={600} fill={colors.primary} fontFamily={fonts.main} />
                    </Rect>
                    <Txt text="김**" fontSize={13} fill={colors.text} fontFamily={fonts.main} x={-230} />
                    <Txt text="010-0000-0000" fontSize={13} fill={colors.text} fontFamily={fonts.main} x={-100} />
                    <Txt text="user1@kakao.com" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} x={60} />
                    <Txt text="01/24 14:32" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} x={220} />
                    <Rect width={70} height={28} radius={6} fill={colors.purpleLight} x={340}>
                      <Txt text="연락완료" fontSize={11} fill={colors.purple} fontFamily={fonts.main} />
                    </Rect>
                  </Node>

                  {/* 행 2 */}
                  <Node y={20}>
                    <Rect width={60} height={24} radius={12} fill={colors.purpleLight} x={-325}>
                      <Txt text="연락완료" fontSize={11} fontWeight={600} fill={colors.purple} fontFamily={fonts.main} />
                    </Rect>
                    <Txt text="이**" fontSize={13} fill={colors.text} fontFamily={fonts.main} x={-230} />
                    <Txt text="010-0000-0000" fontSize={13} fill={colors.text} fontFamily={fonts.main} x={-100} />
                    <Txt text="user2@gmail.com" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} x={60} />
                    <Txt text="01/24 10:15" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} x={220} />
                    <Rect width={50} height={28} radius={6} fill={colors.successLight} x={340}>
                      <Txt text="전환" fontSize={11} fill={colors.success} fontFamily={fonts.main} />
                    </Rect>
                  </Node>

                  {/* 행 3 */}
                  <Node y={70}>
                    <Rect width={50} height={24} radius={12} fill={colors.successLight} x={-330}>
                      <Txt text="전환" fontSize={11} fontWeight={600} fill={colors.success} fontFamily={fonts.main} />
                    </Rect>
                    <Txt text="박**" fontSize={13} fill={colors.text} fontFamily={fonts.main} x={-230} />
                    <Txt text="010-0000-0000" fontSize={13} fill={colors.text} fontFamily={fonts.main} x={-100} />
                    <Txt text="user3@naver.com" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} x={60} />
                    <Txt text="01/23 16:45" fontSize={12} fill={colors.textMuted} fontFamily={fonts.main} x={220} />
                    <Txt text="—" fontSize={13} fill={colors.textMuted} fontFamily={fonts.main} x={340} />
                  </Node>
                </Rect>
              </Node>

              {/* 드롭다운 메뉴 (초기에 숨김) */}
              <Node ref={menuHighlight} x={500} y={40} opacity={0}>
                <Rect width={140} height={120} radius={8} fill={'#ffffff'} shadowColor={'#00000026'} shadowBlur={10} shadowOffsetY={4}>
                  <Node y={-35}>
                    <Txt text="상태 변경" fontSize={11} fill={colors.textMuted} fontFamily={fonts.main} x={-30} />
                  </Node>
                  <Node y={-5}>
                    <Rect width={55} height={24} radius={12} fill={colors.purpleLight} x={-30}>
                      <Txt text="연락완료" fontSize={10} fill={colors.purple} fontFamily={fonts.main} />
                    </Rect>
                    <Rect width={45} height={24} radius={12} fill={colors.successLight} x={35}>
                      <Txt text="전환" fontSize={10} fill={colors.success} fontFamily={fonts.main} />
                    </Rect>
                  </Node>
                  <Line stroke={colors.wireframe} lineWidth={1} points={[[-60, 25], [60, 25]]} />
                  <Node y={45}>
                    <Txt text="↩️ 신규로 되돌리기" fontSize={12} fill={colors.text} fontFamily={fonts.main} x={0} />
                  </Node>
                </Rect>
              </Node>
            </Node>
          </Rect>
        </Rect>
      </Node>

      {/* 클릭 인디케이터 */}
      <Circle
        ref={moreClick}
        width={40}
        height={40}
        fill={'#3b82f64d'}
        stroke={colors.primary}
        lineWidth={2}
        x={470}
        y={50 + 20}
        scale={0}
        opacity={0}
      />

      <Circle
        ref={statusClick}
        width={40}
        height={40}
        fill={'#8b5cf64d'}
        stroke={colors.purple}
        lineWidth={2}
        x={470}
        y={50 + 35}
        scale={0}
        opacity={0}
      />
    </Node>
  );

  // === 애니메이션 시작 ===
  yield* all(
    titleText().opacity(1, 0.6),
    titleText().y(-400, 0.6, easeOutCubic),
  );

  yield* all(
    subtitleText().opacity(1, 0.4),
    subtitleText().y(-350, 0.4, easeOutCubic),
  );

  yield* waitFor(0.5);

  // 브라우저 등장
  yield* desktopFrame().scale(1, 0.8, easeOutCubic);

  yield* waitFor(1.5);

  // === 첫 번째 행 하이라이트 ===
  yield* rowHighlight().fill('#3b82f61a', 0.3);

  yield* waitFor(0.8);

  // === 상태 버튼 클릭 ===
  yield* all(
    moreClick().scale(1, 0.3),
    moreClick().opacity(1, 0.3),
  );

  yield* all(
    moreClick().scale(1.5, 0.4),
    moreClick().opacity(0, 0.4),
  );

  // === 드롭다운 메뉴 표시 ===
  yield* menuHighlight().opacity(1, 0.3);
  yield* menuHighlight().y(50, 0.2, easeOutCubic);

  yield* waitFor(1);

  // === 상태 변경 버튼 클릭 ===
  yield* all(
    statusClick().scale(1, 0.3),
    statusClick().opacity(1, 0.3),
  );

  yield* all(
    statusClick().scale(1.5, 0.4),
    statusClick().opacity(0, 0.4),
  );

  yield* waitFor(0.5);

  // 메뉴 닫기
  yield* menuHighlight().opacity(0, 0.2);

  yield* waitFor(1);

  // === 마무리 텍스트 ===
  const endText = createRef<Txt>();
  root().add(
    <Txt
      ref={endText}
      text="폴라리드 - 스마트 리드 관리 시스템"
      fontSize={32}
      fontWeight={700}
      fill={'#ffffff'}
      fontFamily={fonts.main}
      y={380}
      opacity={0}
    />
  );

  yield* endText().opacity(1, 0.5);

  yield* waitFor(2);

  // === 씬 종료 ===
  yield* all(
    desktopFrame().scale(0.95, 0.5),
    desktopFrame().opacity(0, 0.5),
    titleText().opacity(0, 0.4),
    subtitleText().opacity(0, 0.4),
    endText().opacity(0, 0.4),
  );

  yield* waitFor(0.3);

  // root 노드 제거
});
