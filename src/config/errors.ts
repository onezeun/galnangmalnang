/**
 * 🌐 HTTP 상태 코드 기반 표준 에러 정의
 * - code: HTTP status code
 * - type: RFC 명칭 기반 영문 코드 (대문자 스네이크 케이스)
 */
export const ERR = {
  /** 400 — Bad Request (잘못된 요청 형식, 유효하지 않은 파라미터 등) */
  BAD_REQUEST: { code: 400, type: 'BAD_REQUEST' },

  /** 401 — Unauthorized (인증 필요, 로그인 안 됨) */
  UNAUTHORIZED: { code: 401, type: 'UNAUTHORIZED' },

  /** 403 — Forbidden (인증은 되었으나 권한 없음) */
  FORBIDDEN: { code: 403, type: 'FORBIDDEN' },

  /** 404 — Not Found (요청한 자원이 존재하지 않음) */
  NOT_FOUND: { code: 404, type: 'NOT_FOUND' },

  /** 405 — Method Not Allowed (허용되지 않은 HTTP 메서드 사용) */
  METHOD_NOT_ALLOWED: { code: 405, type: 'METHOD_NOT_ALLOWED' },

  /** 409 — Conflict (중복 데이터, 제약 조건 위반 등) */
  CONFLICT: { code: 409, type: 'CONFLICT' },

  /** 422 — Unprocessable Entity (입력값 검증 실패, 형식 오류 등) */
  UNPROCESSABLE_ENTITY: { code: 422, type: 'UNPROCESSABLE_ENTITY' },

  /** 429 — Too Many Requests (요청 제한 초과, rate limiting 등) */
  TOO_MANY_REQUESTS: { code: 429, type: 'TOO_MANY_REQUESTS' },

  /** 500 — Internal Server Error (서버 내부 예외, 알 수 없는 오류) */
  INTERNAL_SERVER_ERROR: { code: 500, type: 'INTERNAL_SERVER_ERROR' },

  /** 502 — Bad Gateway (외부 API/업스트림 서비스 연동 실패) */
  BAD_GATEWAY: { code: 502, type: 'BAD_GATEWAY' },

  /** 503 — Service Unavailable (서비스 불가, 유지보수/과부하 등) */
  SERVICE_UNAVAILABLE: { code: 503, type: 'SERVICE_UNAVAILABLE' },
} as const;
