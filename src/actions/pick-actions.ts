'use server';

import { ERR } from '@/config/errors';
import { ActionResultType } from '@/types/action';
import { PickPlacePayloadType } from '@/types/pick';
import { PlaceRowType } from '@/types/places';
import { createServerSupabaseClient } from '@/utils/supabase/server';

/* 메인 필터 랜덤 뽑기 */
export async function pickPlaceAction(
  payload: PickPlacePayloadType
): Promise<ActionResultType<PlaceRowType>> {
  const region = payload.region ?? '';
  const category = payload.category ?? '';
  const lat = payload.lat ?? null;
  const lng = payload.lng ?? null;
  const radius = payload.radius ?? 2000;

  const supabase = await createServerSupabaseClient();

  try {
    // 1) 현재 위치 근처
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

      // pick_one_nearby 랜덤 id 뽑기
      /* pick_one_nearby 함수
        select p.id, p.name,
              ST_Distance(
                ST_SetSRID(ST_MakePoint(p.lng, p.lat), 4326)::geography,
                ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
              ) as distance_m
        from places p
        where ST_DWithin(
          ST_SetSRID(ST_MakePoint(p.lng, p.lat), 4326)::geography,
          ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
          radius_m
        )
        and (p_category is null or p.category = p_category)
        order by random()
        limit 1;    */
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

      const pickedId = nearbyData?.[0]?.id as number | undefined;
      if (!pickedId) {
        return {
          ok: false,
          type: ERR.NOT_FOUND.type,
          message: '조건에 맞는 결과가 없습니다.',
        };
      }

      // id로 place 상세 조회
      const { data: place, error: placeError } = await supabase
        .from('places')
        .select('*')
        .eq('id', pickedId)
        .maybeSingle<PlaceRowType>();

      if (placeError || !place) {
        return {
          ok: false,
          type: ERR.INTERNAL_SERVER_ERROR.type,
          message: '선택된 장소 정보를 불러오지 못했습니다.',
          details: placeError?.message,
        };
      }

      return {
        ok: true,
        data: place,
        redirect: `/result/${pickedId}`,
      };
    }

    // 2) 전체/특정 지역 랜덤
    // pick_one_random 랜덤 id 뽑기
    // 필터 조건에 맞는 장소 리스트 함수 pick_one_random
    /*
      SELECT p.id
      FROM places AS p
      WHERE
        (
          in_region IS NULL
          OR in_region = ''
          OR lower(in_region) = 'all'
          OR lower(p.region) = lower(in_region)
        )
        AND
        (
          in_category IS NULL
          OR in_category = ''
          OR lower(in_category) = 'all'
          OR lower(p.category) = lower(in_category)
        )
      ORDER BY random()
      LIMIT 1;
    */

    const { data: randomData, error: randomError } = await supabase.rpc('pick_one_random', {
      in_region: region,
      in_category: category,
    });

    if (randomError) {
      return {
        ok: false,
        type: ERR.INTERNAL_SERVER_ERROR.type,
        message: '랜덤 선택 중 오류가 발생했습니다.',
        details: randomError.message,
      };
    }

    const pickedId = randomData?.[0]?.id as number | undefined;
    if (!pickedId) {
      return {
        ok: false,
        type: ERR.NOT_FOUND.type,
        message: '조건에 맞는 결과가 없습니다.',
        details: { region, category },
      };
    }

    // id로 place 상세 조회
    const { data: place, error: placeError } = await supabase
      .from('places')
      .select('*')
      .eq('id', pickedId)
      .maybeSingle<PlaceRowType>();

    if (placeError || !place) {
      return {
        ok: false,
        type: ERR.INTERNAL_SERVER_ERROR.type,
        message: '선택된 장소 정보를 불러오지 못했습니다.',
        details: placeError?.message,
      };
    }

    return {
      ok: true,
      data: place,
      redirect: `/result/${pickedId}`,
    };
  } catch (e: any) {
    return {
      ok: false,
      type: ERR.INTERNAL_SERVER_ERROR.type,
      message: '랜덤 선택 중 오류가 발생했습니다.',
      details: e?.message,
    };
  }
}

/* 빠르게 뽑기 */
export async function pickByCategoryAction(category: string) {
  const supabase = await createServerSupabaseClient();

  // 1) 카테고리만 넣어서 랜덤 id 뽑기
  const { data, error } = await supabase.rpc('pick_one_random', {
    in_region: '', // 전체
    in_category: category,
  });

  if (error) {
    return {
      ok: false,
      type: ERR.INTERNAL_SERVER_ERROR.type,
      message: '랜덤 선택 중 오류가 발생했습니다.',
      details: error.message,
    };
  }

  const pickedId = data?.[0]?.id as number | undefined;

  if (!pickedId) {
    return {
      ok: false,
      type: ERR.NOT_FOUND.type,
      message: '해당 카테고리 결과가 없습니다.',
      details: { category },
    };
  }

  // 2) id로 place 상세 조회
  const { data: place, error: placeError } = await supabase
    .from('places')
    .select('*')
    .eq('id', pickedId)
    .maybeSingle();

  if (placeError || !place) {
    return {
      ok: false,
      type: ERR.INTERNAL_SERVER_ERROR.type,
      message: '선택된 장소 정보를 불러오지 못했습니다.',
      details: placeError?.message,
    };
  }

  return {
    ok: true,
    data: place,
  };
}
