"use client";

import { useState } from 'react';

const FAQ_DATA = [
  {
    id: 'faq-1',
    question: '폐업 비용 계산 결과는 실제 비용과 동일한가요?',
    answer: '아닙니다. 입력한 매장 조건을 기준으로 계산한 예상 금액입니다. 실제 철거비, 위약금, 원상복구 비용은 계약 조건과 업체 견적에 따라 달라질 수 있습니다.'
  },
  {
    id: 'faq-2',
    question: '폐업 시 모든 사업자가 부가세를 추가로 납부하나요?',
    answer: '모든 사업자에게 추가 부가세가 발생하는 것은 아닙니다. 매입세액 공제를 받은 자산의 보유 여부와 취득 시점 등 조건에 따라 달라질 수 있습니다.'
  },
  {
    id: 'faq-3',
    question: '주변 상권 데이터는 어디에서 가져오나요?',
    answer: 'RebornBiz는 프로젝트에서 연동된 공공데이터와 위치 기반 API를 활용해 주변 점포와 업종 정보를 분석합니다. 데이터 제공 시점에 따라 실제 현황과 차이가 있을 수 있습니다.'
  },
  {
    id: 'faq-4',
    question: '회원가입 없이 이용할 수 있나요?',
    answer: '네. 현재 RebornBiz의 주요 계산 및 분석 도구는 회원가입 없이 이용할 수 있습니다.'
  }
];

export default function HomeFaq() {
  const [openId, setOpenId] = useState(null);

  const toggleFaq = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="home-section bg-gray">
      <div className="section-header">
        <h2 style={{ textAlign: 'left' }}>자주 묻는 질문</h2>
      </div>
      <div className="faq-list" style={{ marginLeft: 0 }}>
        {FAQ_DATA.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div key={faq.id} className="faq-item">
              <h3>
                <button
                  type="button"
                  className="faq-button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  onClick={() => toggleFaq(faq.id)}
                >
                  {faq.question}
                  <svg
                    className={`faq-icon ${isOpen ? 'open' : ''}`}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              </h3>
              {isOpen && (
                <div id={`faq-answer-${faq.id}`} className="faq-answer">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
