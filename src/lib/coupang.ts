// Coupang Partners links (partner AF7289134), made 2026-11-14 in the dashboard's 간편 링크 만들기.
// Each opens a Coupang search results page, so links never point at a sold-out product.
// Korean pages only, and any screen that shows one must also show COUPANG_DISCLOSURE.
export const COUPANG = {
  powerBank: 'https://link.coupang.com/a/iFFJL7ENPw', // 보조배터리
  raincoat: 'https://link.coupang.com/a/iFFL0Opq7U', // 일회용 우비
  umbrella: 'https://link.coupang.com/a/iFFMaGbS3g', // 초경량 접이식 우산
  handWarmer: 'https://link.coupang.com/a/iFFMkPw63M', // 붙이는 핫팩
  waterproofPouch: 'https://link.coupang.com/a/iFFNRZHgKO', // 방수 휴대폰 파우치
  picnicMat: 'https://link.coupang.com/a/iFFN11CoKa', // 피크닉 돗자리
  phoneTripod: 'https://link.coupang.com/a/iFFOf6EgY8', // 휴대폰 삼각대
  wetWipes: 'https://link.coupang.com/a/iFFOuu47VY', // 휴대용 물티슈
  sunscreen: 'https://link.coupang.com/a/iFFOIykjZs', // 선크림
  carPhoneMount: 'https://link.coupang.com/a/iFFQapbgaa', // 차량용 휴대폰 거치대
  travelPouch: 'https://link.coupang.com/a/iFFQoTh5Ii', // 여행용 파우치
  kidsIdBracelet: 'https://link.coupang.com/a/iFFQCMfZRs', // 미아방지 팔찌
  handFan: 'https://link.coupang.com/a/iFFQQRn7XU', // 휴대용 선풍기
  touchGloves: 'https://link.coupang.com/a/iFFQ42ceFE', // 스마트폰 터치 장갑
} as const;

/** Required by Coupang Partners (Fair Trade Commission guideline) wherever a Coupang link appears. */
export const COUPANG_DISCLOSURE = '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';
