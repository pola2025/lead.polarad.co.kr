export default function DensuranceGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 bg-blue-600 rounded-full" />
            <span className="text-xs font-semibold text-blue-600 tracking-widest uppercase">
              PolarLead
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            서비스 사용 가이드
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            덴슈런스 · 처음 사용하시는 분을 위한 안내
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-12">
        {/* 전체 흐름 */}
        <section>
          <SectionLabel number="01" label="전체 흐름" />
          <p className="text-sm text-gray-600 mb-6">
            PolarLead는 광고를 통해 유입된 고객(리드)을 수집하고, 포털에서
            확인·관리할 수 있는 서비스입니다.
          </p>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <FlowBox icon="📣" label="광고 집행" sub="Meta / Google 등" />
              <Arrow />
              <FlowBox icon="📋" label="랜딩 페이지" sub="상담 신청 폼" />
              <Arrow />
              <FlowBox icon="📩" label="리드 접수" sub="자동 저장 + 알림" />
              <Arrow />
              <FlowBox
                icon="📊"
                label="포털 확인"
                sub="접수내역 관리"
                highlight
              />
            </div>
            <p className="text-xs text-gray-400 mt-5 text-center">
              ※ 고객이 랜딩 페이지 폼을 제출하면 즉시 텔레그램으로 알림이
              발송되고 포털에 기록됩니다
            </p>
          </div>
        </section>

        {/* 랜딩 페이지 */}
        <section>
          <SectionLabel number="02" label="랜딩 페이지" />
          <p className="text-sm text-gray-600 mb-6">
            광고에 연결되는 상담 신청 페이지입니다. 고객이 이름·연락처를
            입력하면 리드로 자동 수집됩니다.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* 폰 목업 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-semibold text-gray-500 mb-4">
                랜딩 페이지 구성
              </p>
              <div className="border-2 border-gray-300 rounded-2xl p-3 max-w-[180px] mx-auto">
                <div className="bg-gray-100 rounded-lg p-2 mb-2">
                  <div className="h-2 bg-gray-300 rounded w-3/4 mb-1" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                </div>
                <div className="space-y-1.5">
                  <WireInput label="이름" />
                  <WireInput label="연락처" />
                  <WireInput label="이메일 (선택)" />
                </div>
                <div className="mt-2 bg-blue-500 rounded-lg py-1.5 text-center">
                  <span className="text-xs text-white font-medium">
                    상담 신청하기
                  </span>
                </div>
                <div className="mt-1.5 flex justify-center">
                  <span className="text-[9px] text-gray-400">
                    개인정보 수집 동의
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <InfoCard icon="🔗" title="랜딩 페이지 URL">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1 break-all">
                  lead.polarad.co.kr/l/densurance
                </code>
                <p className="text-xs text-gray-500 mt-1">
                  이 URL을 광고 랜딩 주소로 사용하세요
                </p>
              </InfoCard>
              <InfoCard icon="🔔" title="리드 접수 알림">
                <p className="text-xs text-gray-600 mt-1">
                  고객 제출 즉시 텔레그램으로 실시간 알림 발송
                </p>
              </InfoCard>
              <InfoCard icon="⚙️" title="폼 항목 커스텀">
                <p className="text-xs text-gray-600 mt-1">
                  이름·연락처 외 추가 항목은 포털 → 수집 정보 설정에서 조정 가능
                </p>
              </InfoCard>
            </div>
          </div>
        </section>

        {/* 포털 로그인 */}
        <section>
          <SectionLabel number="03" label="포털 접속 방법" />
          <p className="text-sm text-gray-600 mb-6">
            포털은 별도 비밀번호 없이 텔레그램 인증코드(OTP)로 로그인합니다.
          </p>
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              {/* 단계 */}
              <div className="flex-1 space-y-4">
                <Step n={1} title="포털 URL 접속">
                  <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                    lead.polarad.co.kr/portal/densurance
                  </code>
                </Step>
                <Step n={2} title="인증코드 요청">
                  <p className="text-xs text-gray-500">
                    &apos;인증코드 발송&apos; 버튼 클릭
                  </p>
                </Step>
                <Step n={3} title="텔레그램 확인">
                  <p className="text-xs text-gray-500">
                    등록된 텔레그램 채널로 6자리 코드 수신
                  </p>
                </Step>
                <Step n={4} title="코드 입력 후 로그인">
                  <p className="text-xs text-gray-500">
                    5분 이내 입력 → 포털 메인으로 이동
                  </p>
                </Step>
              </div>
              {/* 로그인 목업 */}
              <div className="border border-gray-200 rounded-xl p-4 w-full sm:w-48 bg-gray-50">
                <p className="text-[10px] text-gray-400 text-center mb-3">
                  포털 로그인 화면
                </p>
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-sm">🔑</span>
                  </div>
                  <div className="text-[10px] font-medium text-gray-700 mb-2">
                    텔레그램 인증
                  </div>
                  <div className="bg-gray-100 rounded h-7 mb-2" />
                  <div className="bg-blue-500 rounded h-7 flex items-center justify-center">
                    <span className="text-[10px] text-white">
                      인증코드 발송
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
              <p className="text-xs text-amber-700">
                ⚠️ 텔레그램 채팅 ID가 등록되어 있어야 OTP를 수신할 수 있습니다.
                미설정 시 관리자에게 문의하세요.
              </p>
            </div>
          </div>
        </section>

        {/* 포털 탭 기능 */}
        <section>
          <SectionLabel number="04" label="포털 주요 기능" />
          <p className="text-sm text-gray-600 mb-6">
            로그인 후 하단 탭 메뉴에서 5가지 기능을 사용할 수 있습니다.
          </p>

          {/* 탭 네비게이션 목업 */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
            <p className="text-xs text-gray-400 mb-3">포털 하단 탭 메뉴</p>
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              {[
                { icon: "📊", label: "방문통계" },
                { icon: "📋", label: "접수내역" },
                { icon: "⚙️", label: "수집정보" },
                { icon: "💬", label: "응답설정" },
                { icon: "🔔", label: "고객알림" },
              ].map((tab, i) => (
                <div
                  key={i}
                  className={`flex-1 py-2 text-center border-r last:border-r-0 border-gray-200 ${i === 0 ? "bg-blue-50" : "bg-white"}`}
                >
                  <div className="text-base">{tab.icon}</div>
                  <div
                    className={`text-[9px] mt-0.5 ${i === 0 ? "text-blue-600 font-semibold" : "text-gray-500"}`}
                  >
                    {tab.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <TabCard
              icon="📊"
              number="탭 1"
              title="방문 통계"
              items={[
                "오늘 / 이번 주 / 이번 달 방문자 수 확인",
                "일별 방문 추이 그래프",
                "광고별 리드 성과 (UTM 추적)",
                "유입 경로 TOP 5 (검색 / SNS / 직접 등)",
                "접속 지역 분포",
              ]}
            />
            <TabCard
              icon="📋"
              number="탭 2"
              title="접수내역 관리"
              items={[
                "전체 상담 신청 목록 조회",
                "신규 / 연락완료 / 전환 / 블랙리스트 상태 변경",
                "고객 이름·연락처·이메일 확인",
                "메모 입력 및 수정",
                "블랙리스트 등록 (스팸 차단)",
              ]}
              highlight
            />
            <TabCard
              icon="⚙️"
              number="탭 3"
              title="수집 정보 설정"
              items={[
                "폼에서 수집할 항목 켜기/끄기",
                "이름·연락처 외 이메일·주소·생년월일 등 추가",
                "필수 여부 설정",
                "변경 즉시 랜딩 페이지에 반영",
              ]}
            />
            <TabCard
              icon="💬"
              number="탭 4"
              title="응답 메시지 설정"
              items={[
                "신청 완료 후 표시되는 문구 변경",
                "완료 페이지 제목 / 본문 내용 수정",
                "CTA 버튼 텍스트 설정",
              ]}
            />
            <TabCard
              icon="🔔"
              number="탭 5"
              title="고객 알림 설정"
              items={[
                "SMS 자동 발송 설정 (접수 시 고객에게 안내 문자)",
                "이메일 자동 발송 설정",
                "알림 문구 템플릿 수정",
              ]}
            />
          </div>
        </section>

        {/* 비용 안내 */}
        <section>
          <SectionLabel number="05" label="비용 안내" />
          <div className="space-y-3">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    기본 서비스 이용료
                  </p>
                  <p className="text-xs text-gray-500">
                    랜딩 페이지 + 포털 관리 + 텔레그램 알림 포함
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">360,000원</p>
                  <p className="text-xs text-gray-400">연간 · VAT 별도</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {[
                    "랜딩 페이지 제작",
                    "리드 수집 자동화",
                    "텔레그램 실시간 알림",
                    "포털 접수내역 관리",
                    "방문 통계 분석",
                  ].map((item) => (
                    <span
                      key={item}
                      className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    카카오 로그인 연동{" "}
                    <span className="text-xs font-normal text-gray-400">
                      (선택)
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    자체 카카오 채널로 로그인 연동 시 별도 개발 필요
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-yellow-500">
                    +300,000원
                  </p>
                  <p className="text-xs text-gray-400">1회 · VAT 포함</p>
                </div>
              </div>
              <div className="mt-3 bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2">
                <p className="text-xs text-yellow-700">
                  카카오 비즈니스 채널 보유 시 고객이 카카오 계정으로 랜딩
                  페이지에 로그인 후 신청하는 방식으로 구현 가능합니다.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 문의 */}
        <section className="pb-10">
          <div className="bg-gray-100 border border-gray-200 rounded-xl px-6 py-5 text-center">
            <p className="text-sm text-gray-600">
              사용 중 문의사항은 담당자에게 연락해 주세요
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PolarAd · mkt@polarad.co.kr
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── 공통 컴포넌트 ──────────────────────────────────────────────

function SectionLabel({ number, label }: { number: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
        {number}
      </span>
      <h2 className="text-base font-bold text-gray-900">{label}</h2>
    </div>
  );
}

function FlowBox({
  icon,
  label,
  sub,
  highlight,
}: {
  icon: string;
  label: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex-1 border-2 rounded-xl p-3 text-center ${highlight ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-gray-50"}`}
    >
      <div className="text-2xl mb-1">{icon}</div>
      <p
        className={`text-xs font-semibold ${highlight ? "text-blue-700" : "text-gray-700"}`}
      >
        {label}
      </p>
      <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="text-gray-300 font-bold text-lg sm:rotate-0 rotate-90">
      →
    </div>
  );
}

function WireInput({ label }: { label: string }) {
  return (
    <div className="border border-gray-300 rounded px-2 py-1 bg-white">
      <span className="text-[9px] text-gray-400">{label}</span>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-sm font-semibold text-gray-800">
        {icon} {title}
      </p>
      {children}
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
        {n}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        {children}
      </div>
    </div>
  );
}

function TabCard({
  icon,
  number,
  title,
  items,
  highlight,
}: {
  icon: string;
  number: string;
  title: string;
  items: string[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white border rounded-xl p-5 ${highlight ? "border-blue-200 ring-1 ring-blue-100" : "border-gray-200"}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{icon}</span>
        <div>
          <span className="text-[10px] text-gray-400">{number}</span>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        </div>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
            <span className="text-gray-300 mt-0.5">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
