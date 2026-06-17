import StickyHeader from '@/components/StickyHeader';

export const metadata = {
  title: '이용약관 및 개인정보처리방침 | RebornBiz'
};

export default function PolicyPage() {
  return (
    <div className="custom-main">
      <StickyHeader>
        <div className="pc-only" style={{ alignItems: 'center', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '0.5rem', backgroundColor: '#ffffff', marginBottom: '2rem' }}>
          <div style={{ flexShrink: 0, marginRight: '2rem' }}>
            <img src="/rebornBiz_logo.png" alt="RebornBiz Logo" style={{ width: '200px', height: 'auto' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1E3A8A' }}>📜 이용약관 및 개인정보처리방침</h1>
            <p style={{ fontSize: '1.05rem', marginBottom: '0', lineHeight: '1.6', color: '#64748b' }}>RebornBiz(이하 '본 사이트')의 이용약관 및 개인정보처리방침을 안내해 드립니다.</p>
          </div>
        </div>
        <div className="mobile-only">
          <div style={{ paddingLeft: '3rem', marginBottom: '1rem', minHeight: '40px' }}>
            <img src="/images/rebornbiz_main.jpg" alt="RebornBiz Banner" style={{ width: '100%', height: 'auto', maxHeight: '40px', objectFit: 'contain', objectPosition: 'left center' }} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#1E3A8A' }}>📜 이용약관 및 개인정보처리방침</h1>
          <p style={{ fontSize: '0.95rem', marginBottom: '1rem', lineHeight: '1.5', color: '#64748b' }}>RebornBiz(이하 '본 사이트')의 이용약관 및 개인정보처리방침을 안내해 드립니다.</p>
        </div>
      </StickyHeader>

      <hr style={{ borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '1.5rem 0' }} />

      <div style={{ lineHeight: '1.8', fontSize: '1.05rem', color: '#31333F' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: '2rem 0 1rem 0', color: '#1E3A8A' }}>이용약관</h2>
        <p style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}>시행일 2026-06-10 · 최종 개정 2026-06-10</p>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>제1조 (목적)</h3>
          <p>본 약관은 RebornBiz(rebornbiz.co.kr, 이하 “본 사이트”)가 제공하는 상권 분석, 폐업 및 업종 변경 시뮬레이션, 지원사업 가이드 서비스(이하 “서비스”)의 이용과 관련하여 본 사이트와 이용자 간의 권리·의무 및 책임사항 등을 규정함을 목적으로 합니다.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>제2조 (서비스의 내용)</h3>
          <p>본 사이트는 공공데이터 및 자체 분석 로직을 활용하여 이용자에게 다음과 같은 도구와 정보를 제공합니다.</p>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            <li>주변 상권 분석 및 상업용 부동산 실거래가 조회</li>
            <li>폐업 비용(철거, 위약금 등) 및 업종 변경 예상 비용 시뮬레이션</li>
            <li>정부·공공기관 지원사업 공고 요약 및 해설 가이드</li>
            <li>기타 소상공인 창업·폐업 관련 정보 제공</li>
          </ol>
          <p>본 사이트의 정보와 시뮬레이션 결과는 참고용이며 법적 효력이 없습니다. 최종적인 행정 절차, 자격 여부, 지원 금액 및 실거래가 확인은 반드시 공식 발행 기관 및 관련 전문가의 안내가 기준이 됩니다.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>제3조 (서비스의 이용)</h3>
          <p>본 서비스는 별도의 회원가입 절차 없이 누구나 무료로 이용할 수 있습니다.<br/>
          본 사이트는 서비스의 내용, 제공 방식, 운영 시간 등을 운영상·기술상의 필요에 따라 변경할 수 있으며, 변경 시 사전 또는 사후에 공지합니다.<br/>
          본 사이트는 설비의 보수·점검, 공공 API 연동 장애, 천재지변, 통신 장애 등 불가항력적 사유가 있는 경우 서비스 제공을 일시 중단할 수 있습니다.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>제4조 (이용자의 의무)</h3>
          <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>허위 정보를 유포하거나 타인을 사칭하는 행위</li>
            <li>본 사이트의 콘텐츠, 분석 결과, 시뮬레이션 데이터를 무단으로 복제·배포하여 상업적으로 이용하는 행위</li>
            <li>자동화된 수단으로 과도한 트래픽을 발생시키거나 공공 API 수집 및 서비스 운영을 방해하는 행위</li>
            <li>기타 본 사이트의 운영을 방해하거나 관련 법령에 위반되는 행위</li>
          </ol>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>제5조 (면책 조항)</h3>
          <p>본 사이트가 제공하는 상권 분석 데이터, 상가 실거래가, 폐업 비용 계산 결과, 지원사업 정보 등은 공공데이터를 기반으로 가공한 참고용 자료이며, 실제 지표나 공식 기관의 공지와 다를 수 있습니다. 최종 판단 및 의사결정은 반드시 원천 데이터 및 관련 기관의 안내를 기준으로 하시기 바랍니다.<br/>
          비용 계산기 및 시뮬레이션 기능은 보조 도구이며, 실제 소요되는 비용이나 행정 심사 결과를 보장하지 않습니다.<br/>
          제공되는 데이터, 조건, 금액 등은 사전 고지 없이 변경될 수 있으며, 이로 인한 직접적·간접적 손해에 대하여 본 사이트는 어떠한 법적 책임도 지지 않습니다.<br/>
          본 사이트는 세무·노무·법률·부동산 중개 상담을 대체하지 않습니다. 개별 사안의 구체적인 실행은 반드시 해당 분야 전문가(세무사, 공인중개사 등)의 상담을 받으시기 바랍니다.<br/>
          본 사이트에 게재된 외부 링크를 통해 접속한 제3자 사이트의 내용 및 정책에 대해서는 본 사이트가 책임지지 않습니다.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>제6조 (저작권·무단 복제 금지)</h3>
          <p>본 사이트가 자체적으로 구축한 상권 분석 및 비용 시뮬레이션 로직, 데이터 가공 방식, 쉬운 말 요약, UI/UX 디자인 및 코드 일체의 저작권은 본 사이트 운영자에게 귀속됩니다.<br/>
          이용자는 개인적·비영리적 목적의 열람·출력만 허용되며, 사전 서면 동의 없이 다음 행위를 엄격히 금지합니다:</p>
          <ol style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
            <li>콘텐츠 및 분석 결과의 상업적 복제·배포·재가공·전송·공중 송신</li>
            <li>자동화된 수단(봇·스크래퍼·크롤러)을 이용한 대량의 데이터 수집</li>
            <li>본 사이트의 UI/UX·디자인·코드 구조를 모방한 유사 프롭테크/정보 서비스 운영</li>
            <li>본 사이트 콘텐츠를 AI 학습 및 파인튜닝 데이터로 활용하는 행위</li>
          </ol>
          <p>공공데이터포털 API 및 지원사업 공고 원문 자체의 저작권은 해당 발행 기관에 있으며, 본 사이트는 이를 공익적 정보 제공 및 분석 목적으로 재구성해 안내합니다.<br/>
          위 조항을 위반하는 경우 민사상 손해배상 청구, 저작권법에 따른 형사 처벌 대상이 될 수 있으며, 본 사이트는 국내외 구제 절차를 통해 즉시 대응합니다.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>제7조 (광고)</h3>
          <p>본 사이트는 서비스의 무료 운영 유지를 위해 제3자 광고 네트워크(Google AdSense 등)를 통한 광고를 게재할 수 있습니다. 광고 클릭으로 인해 발생하는 제3자 서비스 이용 및 거래에 대해서는 본 사이트가 책임지지 않습니다.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>제8조 (분쟁 해결)</h3>
          <p>본 약관의 해석 및 적용은 대한민국 법령에 따릅니다.<br/>
          서비스 이용과 관련하여 본 사이트와 이용자 간에 분쟁이 발생한 경우, 당사자 간 협의로 해결함을 원칙으로 하며, 협의가 이루어지지 않을 때에는 민사소송법상의 관할 법원에 제소할 수 있습니다.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>제9조 (약관의 변경)</h3>
          <p>본 약관은 관련 법령 또는 서비스 운영 정책의 변경에 따라 개정될 수 있으며, 변경 시 시행일 최소 7일 전부터 본 페이지를 통해 공지합니다.</p>
        </section>

        <section style={{ marginBottom: '4rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>부칙</h3>
          <p>본 약관은 2026년 06월 10일부터 시행됩니다.</p>
        </section>


        <hr style={{ borderTop: '1px solid rgba(49, 51, 63, 0.2)', margin: '2rem 0' }} />


        <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: '2rem 0 1rem 0', color: '#1E3A8A' }}>개인정보처리방침</h2>
        <p style={{ fontWeight: 'bold', marginBottom: '1.5rem' }}>시행일 2026-06-10 · 최종 개정 2026-06-10</p>
        
        <p style={{ marginBottom: '2rem' }}>RebornBiz(rebornbiz.co.kr, 이하 “본 사이트”)는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 및 「위치정보의 보호 및 이용 등에 관한 법률」 등 관련 법령을 준수합니다. 본 개인정보처리방침은 본 사이트가 수집·이용하는 개인정보의 항목, 목적, 보유 기간, 제3자 제공 여부, 쿠키 및 분석 도구 운영, 이용자의 권리 등을 안내합니다.</p>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>1. 수집하는 개인정보 항목</h3>
          <p>본 사이트는 회원가입·로그인 기능을 제공하지 않으며, 이용자로부터 직접 이름·전화번호·주소 등 식별 가능한 고유 개인정보를 수집하지 않습니다.<br/>
          다만, 서비스 이용 및 품질 개선을 위해 다음 정보가 자동으로 수집되거나 일시적으로 처리될 수 있습니다.</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>위치 정보: '내 주변 상권 분석' 기능 이용 시 이용자의 현재 위치 좌표(GPS)를 일시적으로 수집합니다. (서버에 저장되지 않으며, 해당 세션의 지도 중심점 이동 및 상권 데이터 조회용으로만 사용 후 즉시 파기됩니다.)</li>
            <li>서비스 이용 기록: 접속 로그, 접속 IP, 접속 시간, 브라우저 종류·운영체제</li>
            <li>유입 정보: 방문 페이지 및 유입 경로(레퍼러)</li>
            <li>쿠키 및 유사 기술에 의해 생성된 식별자</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>2. 개인정보의 이용 목적</h3>
          <ul style={{ paddingLeft: '1.5rem' }}>
            <li>주변 상권 및 상가 실거래가 등 위치 기반 맞춤형 데이터 시각화 제공</li>
            <li>사이트 이용 통계 분석 및 서비스 UI/UX 개선</li>
            <li>오류 및 장애 대응, 보안 사고 예방</li>
            <li>이용자의 관심사에 맞는 콘텐츠 추천 및 맞춤형 광고 노출</li>
            <li>관련 법령상 의무 이행</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>3. 개인정보의 보유 및 이용 기간</h3>
          <p>수집된 접속 로그·쿠키 정보는 수집 목적 달성 후 또는 아래 기간이 경과한 시점에 지체 없이 파기됩니다.</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>접속 기록·접속 IP 정보: 「통신비밀보호법」에 따라 3개월</li>
            <li>위치 정보: 위치 기반 서비스(상권 분석) 제공 즉시 파기 (별도 저장 안 함)</li>
            <li>쿠키 및 분석 도구 식별자: 쿠키 만료 시 또는 이용자 삭제 시까지</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>4. 제3자 제공</h3>
          <p>본 사이트는 이용자의 개인정보를 제3자에게 판매·제공하지 않습니다. 단, 다음 경우는 예외입니다.</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사·조사 등 공공기관의 적법한 요청이 있는 경우</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>5. 처리 위탁 및 분석·광고 도구</h3>
          <p>본 사이트는 원활한 정보 제공을 위해 다음 외부 서비스를 이용하며, 해당 서비스 제공자들은 각사의 개인정보처리방침에 따라 정보를 처리합니다.</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Amazon Web Services (AWS) (인프라/호스팅) — 사이트 서버 운영 및 데이터 보안.</li>
            <li>카카오맵 API (지도/위치) — 상권 분석 시각화를 위한 지도 렌더링.</li>
            <li>네이버 애널리틱스 (분석) — 접속 통계 및 사이트 이용 패턴 분석. IP 주소 및 쿠키 기반 식별자를 이용합니다.</li>
            <li>Google AdSense (광고) — 맞춤형 광고 노출. 이용자의 방문 이력·쿠키·식별자를 기반으로 개인 맞춤 광고를 제공할 수 있습니다. 이용자는 Google의 광고 설정에서 맞춤 광고를 차단할 수 있습니다.</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>6. 쿠키(Cookie) 운영</h3>
          <p>본 사이트는 이용자 경험 개선 및 통계 분석을 위해 쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정에서 쿠키 저장을 거부하거나 삭제할 수 있으며, 이 경우 일부 기능이 제한될 수 있습니다.</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Chrome: 설정 → 개인정보 보호 및 보안 → 쿠키 및 기타 사이트 데이터</li>
            <li>Safari: 환경설정 → 개인정보 보호 → 쿠키 및 웹사이트 데이터</li>
            <li>Edge: 설정 → 쿠키 및 사이트 권한</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>7. 이용자의 권리</h3>
          <p>이용자는 언제든지 본인의 개인정보 관련 사항에 대해 열람·정정·삭제·처리정지를 요청할 수 있습니다. 다만 본 사이트는 식별 가능한 개인정보(이름, 연락처 등)를 직접 수집 및 보관하지 않으므로, 관련 요청은 브라우저 쿠키·접속 로그 등 자동 수집 정보에 한정됩니다. 요청은 아래 연락처로 주시면 관련 법령이 정한 기간 내에 처리합니다.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>8. 아동의 개인정보 보호</h3>
          <p>본 사이트는 만 14세 미만 아동을 주요 이용 대상으로 하지 않으며, 상업 시설 분석 및 폐업·창업을 준비하는 자영업·소상공인 사장님을 대상으로 운영됩니다.</p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>9. 개인정보 보호책임자 및 문의처</h3>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', listStyle: 'none' }}>
            <li>- 운영자: RebornBiz 운영팀</li>
            <li>- 문의 이메일: csh238ml@gmail.com</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>개인정보 침해 관련 신고나 상담은 아래 기관에 문의하실 수 있습니다.</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>개인정보분쟁조정위원회: 1833-6972 / www.kopico.go.kr</li>
            <li>개인정보침해신고센터: 118 / privacy.kisa.or.kr</li>
            <li>경찰청 사이버수사국: 182 / cyberbureau.police.go.kr</li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>10. 개정 및 고지</h3>
          <p>본 개인정보처리방침은 법령·정책 또는 서비스 내용(신규 API 도입 등) 변경에 따라 개정될 수 있으며, 변경 시 본 페이지를 통해 공지합니다. 중요한 변경 사항이 있을 경우 시행일 최소 7일 전부터 공지합니다.</p>
        </section>
      </div>
    </div>
  );
}
