// 카카오 주소검색 API
'use server';

import { KAKAO_API_KEY } from '@/config';
import { ERR } from '@/types/action';

export async function geocodeByAddress(address: string) {
  const url = new URL('https://dapi.kakao.com/v2/local/search/address.json');
  url.searchParams.set('query', address.trim());
  url.searchParams.set('analyze_type', 'exact');
  url.searchParams.set('page', '1');
  url.searchParams.set('size', '1');

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        ok: false,
        type: ERR.BAD_GATEWAY.type,
        message: `지오코딩 실패 (HTTP ${res.status})`,
      };
    }

    const json = await res.json();
    const doc = json?.documents?.[0];
    if (!doc) return { ok: false, type: ERR.NOT_FOUND.type, message: '주소 결과 없음' };

    const lat = Number(doc.y);
    const lng = Number(doc.x);
    if (!lat || !lng) {
      return { ok: false, type: ERR.INTERNAL_SERVER_ERROR.type, message: '좌표 파싱 실패' };
    }

    return { ok: true, lat, lng, doc };
  } catch (e: any) {
    return {
      ok: false,
      type: ERR.BAD_GATEWAY.type,
      message: '지오코딩 요청 오류',
      details: e?.message,
    };
  }
}
