"use client";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">개인정보처리방침</h1>
          <p className="text-sm text-gray-500 mb-8">시행일: 2025년 1월 1일</p>

          <div className="prose prose-gray max-w-none text-sm leading-relaxed">
            <p className="text-gray-700 mb-6">
              폴라애드(이하 &quot;회사&quot;)는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고
              이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을
              수립·공개합니다.
            </p>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제1조 (개인정보의 수집 항목)</h2>
              <p className="text-gray-700 mb-2">회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>
              <div className="bg-gray-50 rounded-lg p-4 mt-2">
                <p className="font-medium text-gray-800 mb-2">필수 항목</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>이름, 연락처(휴대전화번호)</li>
                </ul>
                <p className="font-medium text-gray-800 mb-2 mt-4">선택 항목</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>이메일 주소, 회사/사업자명, 주소, 생년월일, 기타 상담에 필요한 정보</li>
                </ul>
                <p className="font-medium text-gray-800 mb-2 mt-4">자동 수집 항목</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>IP 주소, 접속 일시, 서비스 이용 기록, 기기 정보</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제2조 (개인정보의 수집 및 이용 목적)</h2>
              <p className="text-gray-700 mb-2">회사는 수집한 개인정보를 다음의 목적을 위해 이용합니다.</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2">
                <li>상담 신청 접수 및 처리</li>
                <li>서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산</li>
                <li>고객 문의 응대 및 불만 처리</li>
                <li>서비스 개선 및 신규 서비스 개발</li>
                <li>부정 이용 방지 및 비인가 사용 방지</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제3조 (개인정보의 보유 및 이용 기간)</h2>
              <p className="text-gray-700 mb-2">
                회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은
                개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-2">
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>상담 신청 정보: <strong>수집일로부터 3년</strong></li>
                  <li>단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제4조 (개인정보의 제3자 제공)</h2>
              <p className="text-gray-700 mb-2">
                회사는 정보주체의 개인정보를 제2조에서 명시한 범위 내에서만 처리하며,
                정보주체의 동의가 있는 경우에 한하여 제3자에게 제공합니다.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-2">
                <p className="font-medium text-gray-800 mb-2">제공받는 자</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>상담 신청 시 선택한 서비스 제공 업체(클라이언트)</li>
                </ul>
                <p className="font-medium text-gray-800 mb-2 mt-3">제공 목적</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>상담 진행 및 서비스 제공</li>
                </ul>
                <p className="font-medium text-gray-800 mb-2 mt-3">제공 항목</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>이름, 연락처, 이메일 등 상담 신청 시 입력한 정보</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제5조 (개인정보 처리의 위탁)</h2>
              <p className="text-gray-700 mb-2">
                회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-800">수탁업체</p>
                    <p className="text-gray-600">Amazon Web Services, Inc.</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">위탁 업무</p>
                    <p className="text-gray-600">데이터 보관 및 서버 운영</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제6조 (정보주체의 권리·의무 및 행사방법)</h2>
              <p className="text-gray-700 mb-2">정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2">
                <li>개인정보 열람 요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제 요구</li>
                <li>처리정지 요구</li>
              </ul>
              <p className="text-gray-700 mt-3">
                권리 행사는 서면, 전자우편, FAX 등을 통하여 하실 수 있으며, 회사는 이에 대해 지체없이 조치하겠습니다.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제7조 (개인정보의 파기)</h2>
              <p className="text-gray-700 mb-2">
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
                지체없이 해당 개인정보를 파기합니다.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-2">
                <p className="font-medium text-gray-800 mb-2">파기 방법</p>
                <ul className="list-disc list-inside text-gray-600 space-y-1">
                  <li>전자적 파일: 복구 불가능한 방법으로 영구 삭제</li>
                  <li>종이 문서: 분쇄기로 분쇄하거나 소각</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제8조 (개인정보의 안전성 확보조치)</h2>
              <p className="text-gray-700 mb-2">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 mt-2">
                <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육</li>
                <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화</li>
                <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제9조 (개인정보 보호책임자)</h2>
              <p className="text-gray-700 mb-2">
                회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의
                불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mt-2 border border-blue-200">
                <p className="font-semibold text-blue-900 mb-3">개인정보 보호책임자</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p className="text-blue-800">성명: 이재호</p>
                  <p className="text-blue-800">직책: 대표</p>
                  <p className="text-blue-800">연락처: 032-345-9834</p>
                  <p className="text-blue-800">이메일: mkt@polarad.co.kr</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제10조 (권익침해 구제방법)</h2>
              <p className="text-gray-700 mb-2">
                정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회,
                한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mt-2 text-sm">
                <ul className="space-y-2 text-gray-600">
                  <li>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</li>
                  <li>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</li>
                  <li>대검찰청: (국번없이) 1301 (www.spo.go.kr)</li>
                  <li>경찰청: (국번없이) 182 (ecrm.cyber.go.kr)</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">제11조 (개인정보 처리방침 변경)</h2>
              <p className="text-gray-700">
                이 개인정보처리방침은 2025년 1월 1일부터 적용됩니다.
                이전의 개인정보처리방침은 아래에서 확인할 수 있습니다.
              </p>
            </section>

            <section className="pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">사업자 정보</h2>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>상호:</strong> 폴라애드</p>
                <p><strong>대표:</strong> 이재호</p>
                <p><strong>사업자등록번호:</strong> 808-03-00327</p>
                <p><strong>통신판매업:</strong> 제2025-서울금천-1908호</p>
                <p><strong>주소:</strong> 서울특별시 금천구 가산디지털2로 98, 롯데 IT 캐슬 2동 11층 1107</p>
                <p><strong>전화:</strong> 032-345-9834</p>
                <p><strong>이메일:</strong> mkt@polarad.co.kr</p>
              </div>
            </section>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          © {new Date().getFullYear()} PolarAd. All rights reserved.
        </p>
      </div>
    </div>
  );
}
