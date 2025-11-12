'use server';

import { createServerSupabaseClient } from '@/utils/supabase/server';
import { ActionResultType, ERR } from '@/types/action';

// 필터 랜덤 뽑기
export async function pickPlaceAction(formData: FormData): Promise<ActionResultType> {
  const region = String(formData.get('region') ?? '');
  const category = String(formData.get('category') ?? '');
  const lat = Number(formData.get('lat'));
  const lng = Number(formData.get('lng'));
  const radius = Number(formData.get('radius') ?? 2000); // 반경(m), 기본 2km

  const supabase = await createServerSupabaseClient();
  try {
    // 1) 현재위치 근처(nearby): 좌표가 있어야 동작
    if (region === 'nearby') {
      if (!lat || !lng) {
        return {
          ok: false,
          type: ERR.BAD_REQUEST.type,
          message: '현재 위치 좌표가 필요합니다.',
        };
      }
      //  rpc
      //  Supabase의 PostgreSQL 함수(RPC, Remote Procedure Call)를 호출하여
      //  사용자의 현재 좌표(user_lat, user_lng) 주변에서
      //   지정 반경(radius_m) 내의 장소 중 하나를 랜덤으로 선택함.
      //  이 로직은 DB 내부에서 실행되므로 거리 계산 및 필터링이 빠르고 안전함.
      /* pick_one_nearby 함수
        SELECT p.id, p.name,
          ST_Distance(
            ST_SetSRID(ST_MakePoint(p.lng, p.lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
          ) AS distance_m
        FROM places AS p
        WHERE
          ST_DWithin(
            ST_SetSRID(ST_MakePoint(p.lng, p.lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            radius_m
          )
          AND (p_category IS NULL OR p.category = p_category)
        ORDER BY RANDOM()
        LIMIT 1;
    */
      const { data: nearbyData, error: nearbyError } = await supabase.rpc('pick_one_nearby', {
        user_lat: lat,
        user_lng: lng,
        radius_m: radius,
        p_category: category,
      });

      if (nearbyError) {
        return {
          ok: false,
          type: ERR.INTERNAL_SERVER_ERROR.type,
          message: '랜덤 선택 중 오류가 발생했습니다.',
          details: nearbyError.message,
        };
      }
      if (!nearbyData?.[0]?.id) {
        return {
          ok: false,
          type: ERR.NOT_FOUND.type,
          message: '조건에 맞는 결과가 없습니다.',
        };
      }

      return { ok: true, data: { id: nearbyData?.[0]?.id } };
    }

    // 2) 그 외(전체/특정 지역): 기존 랜덤
    // 필터 조건에 맞는 장소 리스트 함수 pick_one_random
    /*
  SELECT id FROM places
  WHERE
    (region IS NULL OR places.region = region)
    AND (category IS NULL OR places.category = category)
  ORDER BY RANDOM() LIMIT 1;
  */
    const { data: randomData, error: randomError } = await supabase.rpc('pick_one_random', {
      region,
      category,
    });
    if (randomError) {
      return {
        ok: false,
        type: ERR.INTERNAL_SERVER_ERROR.type,
        message: '랜덤 선택 중 오류가 발생했습니다.',
        details: randomError.message,
      };
    }
    if (!randomData?.[0]?.id) {
      return {
        ok: false,
        type: ERR.NOT_FOUND.type,
        message: '조건에 맞는 결과가 없습니다.',
        details: { region, category },
      };
    }
    return { ok: true, data: { id: randomData?.[0]?.id } };
  } catch (e: any) {
    return {
      ok: false,
      type: ERR.INTERNAL_SERVER_ERROR.type,
      message: '랜덤 선택 중 오류가 발생했습니다.',
      details: e?.message,
    };
  }
}

export async function pickByCategoryAction(formData: FormData) {
  const category = String(formData.get('category') ?? '').trim();

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.rpc('pick_one_random', {
    region: '', // 전체
    category, // 'food' | 'cafe' | 'sight'
  });

  if (error) {
    return {
      ok: false,
      type: ERR.INTERNAL_SERVER_ERROR.type,
      message: '랜덤 선택 중 오류가 발생했습니다.',
      details: error.message,
    };
  }
  if (!data?.[0]?.id) {
    return {
      ok: false,
      type: ERR.NOT_FOUND.type,
      message: '해당 카테고리 결과가 없습니다.',
      details: { category },
    };
  }
  return { ok: true, data: { id: data?.[0]?.id } };
}
