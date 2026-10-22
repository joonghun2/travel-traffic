/**
 * Maps spot IDs to Seoul real-time population data places (서울시 실시간 인구데이터, OA-21778),
 * by official area code (AREA_CD) from "서울시 주요 121장소 목록.xlsx" (2026-04 revision).
 *
 * Only spots that sit inside (or directly on) an official place are mapped. Spots without a
 * matching place are left out on purpose and show time-of-day estimates instead of another
 * area's live numbers.
 */
export const SEOUL_AREA_MAPPING: Record<number, string> = {
  1: 'POI007', // 홍대 관광특구
  2: 'POI003', // 명동 관광특구
  3: 'POI008', // 경복궁
  4: 'POI068', // 성수카페거리
  5: 'POI066', // 북촌한옥마을
  6: 'POI014', // 강남역
  7: 'POI105', // 여의도한강공원
  8: 'POI083', // DDP(동대문디자인플라자)
  9: 'POI091', // 남산공원
  10: 'POI120', // 잠실롯데타워·석촌호수
  11: 'POI116', // 익선동
  12: 'POI060', // 광장(전통)시장
  13: 'POI001', // 강남 MICE 관광특구 (코엑스)
  14: 'POI095', // 반포한강공원
  15: 'POI078', // 인사동
  16: 'POI004', // 이태원 관광특구
  17: 'POI071', // 압구정로데오거리
  18: 'POI073', // 연남동
  19: 'POI067', // 서촌
  20: 'POI009', // 광화문·덕수궁
  21: 'POI115', // 남대문시장
  22: 'POI101', // 서울숲공원
  24: 'POI089', // 국립중앙박물관·용산가족공원
  25: 'POI092', // 노들섬
  26: 'POI127', // 올림픽공원
  28: 'POI054', // 혜화역 (대학로)
  29: 'POI040', // 신촌·이대역
  30: 'POI046', // 용산역
  31: 'POI006', // 종로·청계 관광특구 (을지로)
  32: 'POI012', // 창덕궁·종묘
  33: 'POI012', // 창덕궁·종묘
  35: 'POI059', // 가로수길
  36: 'POI006', // 종로·청계 관광특구 (청계천)
  37: 'POI032', // 서울식물원·마곡나루역
  38: 'POI005', // 잠실 관광특구 (롯데월드)
  39: 'POI100', // 서울대공원
  42: 'POI093', // 뚝섬한강공원
  43: 'POI094', // 망원한강공원
  44: 'POI104', // 어린이대공원
  45: 'POI102', // 아차산
  46: 'POI121', // 송리단길·호수단길
  49: 'POI080', // 청담동 명품거리
  51: 'POI033', // 서울역 (서울로7017)
  52: 'POI034', // 선릉역 (선릉과 정릉)
  // No official place: 23 청와대, 27 망원시장, 34 남산골한옥마을, 40 북한산,
  // 41 인왕산, 47 문래창작촌, 48 창경궁, 50 경희궁 -> estimates.
};
