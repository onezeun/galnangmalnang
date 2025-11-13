'use server';

import { ActionResultType } from '@/types/action';
import * as PType from '@/types/places';
import { geocodeByAddress } from '@/utils/geocoding';
import { createServerSupabaseClient } from '@/utils/supabase/server';
import { ERR } from '@/config';
import type { Database } from '@/types_db';

type PlacesInsert = Database['public']['Tables']['places']['Insert'];
type PlacesUpdate = Database['public']['Tables']['places']['Update'];

// undefined인 속성을 제거하는 함수
function stripUndefined<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

// 태그 입력값을 배열로 변환
function parseTags(raw: FormDataEntryValue | null): string[] | null {
  if (!raw) return null;
  const s = String(raw).trim();
  if (!s) return null;
  try {
    const maybe = JSON.parse(s);
    if (Array.isArray(maybe)) {
      return Array.from(new Set(maybe.map((v) => String(v).trim()))).filter(Boolean);
    }
  } catch {}
  return Array.from(new Set(s.split(',').map((v) => v.trim()))).filter(Boolean);
}

// supabase 연결, 로그인 확인
async function requireAuth() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return { supabase, user };
}

/* 장소 단건 조회 */
export async function getPlaceByIdAction(id: number): Promise<ActionResultType> {
  if (!Number.isFinite(id)) {
    return { ok: false, type: ERR.BAD_REQUEST.type, message: '잘못된 요청입니다.' };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from('places').select('*').eq('id', id).single();

  if (error) {
    return {
      ok: false,
      type: ERR.INTERNAL_SERVER_ERROR.type,
      message: '조회 중 오류가 발생했습니다.',
      details: error.message,
    };
  }
  if (!data) {
    return { ok: false, type: ERR.NOT_FOUND.type, message: '대상을 찾을 수 없습니다.' };
  }
  return { ok: true, data };
}

/* 장소 리스트 조회 */
export async function getPlaceListAction(params: PType.PlaceListParamsType) {
  const { q = '', category = '', region = '', page = 0, pageSize = 10 } = params ?? {};
  const supabase = await createServerSupabaseClient();

  // count - 페이지네이션
  let countQuery = supabase.from('places').select('*', { count: 'exact', head: true });
  if (q.trim()) countQuery = countQuery.ilike('name', `%${q.trim()}%`);
  if (category) countQuery = countQuery.eq('category', category);
  if (region) countQuery = countQuery.eq('region', region);

  const { count, error: countErr } = await countQuery;
  if (countErr) throw new Error(countErr.message);

  // data
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let dataQuery = supabase
    .from('places')
    .select('id,name,category,region,status,address_line1,created_at')
    .order('created_at', { ascending: false }) // 내림차순 정렬
    .range(from, to);

  if (q.trim()) dataQuery = dataQuery.ilike('name', `%${q.trim()}%`);
  if (category) dataQuery = dataQuery.eq('category', category);
  if (region) dataQuery = dataQuery.eq('region', region);

  const { data, error } = await dataQuery;
  if (error) {
    return {
      ok: false,
      type: ERR.INTERNAL_SERVER_ERROR.type,
      message: '리스트 조회 실패',
      details: error.message,
    };
  }

  const rows: PType.PlaceRowType[] = (data ?? []).map((r) => ({
    id: r.id as number,
    name: String(r.name),
    category: r.category as PType.PlaceCategoryType,
    region: r.region as PType.PlaceRegionType,
    status: r.status as PType.PlaceStatusType,
    address_line1: r.address_line1 ?? null,
    created_at: String(r.created_at),
  }));

  return { ok: true, data: { rows, total: count ?? 0 } };
}

/* 장소 등록 */
export async function createPlaceAction(form: FormData) {
  try {
    const { supabase, user } = await requireAuth();

    // 1) 폼 파싱
    const name = String(form.get('name') ?? '').trim();
    const category = form.get('category') as PType.PlaceCategoryType | null;
    const region = form.get('region') as PType.PlaceRegionType | null;
    const description = String(form.get('description') ?? '').trim() || null;
    const address = String(form.get('address') ?? '').trim() || null;
    const phone = String(form.get('phone') ?? '').trim() || null;
    const tags = parseTags(form.get('tags')); // string[] | null
    const file = (form.get('image') as File | null) ?? null;
    const hours = String(form.get('hours') ?? '').trim() || null;

    if (!name || !category || !region) {
      return {
        ok: false,
        type: ERR.BAD_REQUEST.type,
        message: '필수값(이름/카테고리/지역)을 확인해주세요.',
      };
    }

    // 2) 좌표: 주소가 있으면 API로 조회
    let lat: number | null = null;
    let lng: number | null = null;
    if (address) {
      const geo = await geocodeByAddress(address);
      if (!geo.ok) return geo; // 서비스 레이어 실패 포맷 그대로 전파
      lat = geo.lat as number;
      lng = geo.lng as number;
    }

    // 3) 이미지 업로드
    let image_url: string | null = null;
    if (file && file.size > 0) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${category}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('placeimg')
        .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });
      // 이미지 업로드 실패시
      if (upErr) throw new Error(upErr.message);

      const { data: pub } = supabase.storage.from('placeimg').getPublicUrl(path);
      image_url = pub?.publicUrl ?? null;
    }

    // DB insert
    const payload: PlacesInsert = {
      name,
      category,
      region,
      description,
      address_line1: address,
      phone,
      tags: tags ?? null,
      image_url,
      lat,
      lng,
      hours,
      status: 'published' as unknown as PlacesInsert['status'], // 스키마에 status 있으면 유지
    };

    const { data, error } = await supabase.from('places').insert(payload).select('id').single();
    if (error) {
      if ((error as any)?.code === '23505') {
        return {
          ok: false,
          type: ERR.CONFLICT.type,
          message: '이미 동일 주소가 등록되어 있습니다.',
        };
      }
      return {
        ok: false,
        type: ERR.INTERNAL_SERVER_ERROR.type,
        message: '등록 중 오류가 발생했습니다.',
        details: error.message,
      };
    }

    return { ok: true, data: { id: data!.id as number } };
  } catch (e: any) {
    return {
      ok: false,
      type: ERR.INTERNAL_SERVER_ERROR.type,
      message: '등록 중 오류가 발생했습니다.',
      details: e?.message,
    };
  }
}

/* 장소 수정 */
export async function updatePlaceAction(form: FormData) {
  try {
    const { supabase, user } = await requireAuth();

    const id = Number(form.get('id'));
    if (!id) {
      return { ok: false, type: ERR.BAD_REQUEST.type, message: '잘못된 요청입니다.' };
    }
    // 현재 값 로딩 (주소 변경 감지)
    const { data: current, error: curErr } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single();
    if (curErr) {
      if (curErr) throw new Error(curErr.message); // 대상 조회 중 오류
    }
    if (!current) {
      return { ok: false, type: ERR.NOT_FOUND.type, message: '대상을 찾을 수 없습니다.' };
    }

    const name = String(form.get('name') ?? '').trim();
    const categoryRaw = form.get('category') as PType.PlaceCategoryType | null;
    const regionRaw = form.get('region') as PType.PlaceRegionType | null;
    const description = String(form.get('description') ?? '').trim() || null;
    const address = String(form.get('address') ?? '').trim() || null;
    const phone = String(form.get('phone') ?? '').trim() || null;
    const tags = parseTags(form.get('tags'));
    const file = (form.get('image') as File | null) ?? null;

    // 좌표: 주소 변경 시에만 갱신
    let lat: number | null = current.lat ?? null;
    let lng: number | null = current.lng ?? null;

    if ((address || '') !== (current.address_line1 || '')) {
      if (address) {
        const geo = await geocodeByAddress(address);
        if (!geo.ok) return geo;
        lat = geo.lat as number;
        lng = geo.lng as number;
      } else {
        lat = null;
        lng = null;
      }
    }

    // 이미지 교체
    let image_url: string | null = current.image_url ?? null;
    if (file && file.size > 0) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const cate = (categoryRaw ?? current.category) as string; // 경로에 사용할 값(빈값 방지)
      const path = `${cate}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('placeimg')
        .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });
      if (upErr) throw new Error(upErr.message); // 이미지 업로드 실패
      const { data: pub } = supabase.storage.from('placeimg').getPublicUrl(path);
      image_url = pub?.publicUrl ?? null;
    }

    const payloadBase: PlacesUpdate = {
      name: name || undefined,
      category: (categoryRaw ?? undefined) as PlacesUpdate['category'],
      region: (regionRaw ?? undefined) as PlacesUpdate['region'],
      description,
      address_line1: address,
      phone,
      tags: (tags ?? undefined) as PlacesUpdate['tags'],
      image_url,
      lat,
      lng,
      updated_at: new Date().toISOString(),
    };

    const payload = stripUndefined(payloadBase);
    const { error } = await supabase.from('places').update(payload).eq('id', id);
    if (error) {
      return {
        ok: false,
        type: ERR.INTERNAL_SERVER_ERROR.type,
        message: '수정 중 오류가 발생했습니다.',
        details: error.message,
      };
    }

    return { ok: true, data: {} };
  } catch (e: any) {
    return {
      ok: false,
      type: ERR.INTERNAL_SERVER_ERROR.type,
      message: '수정 중 오류가 발생했습니다.',
      details: e?.message,
    };
  }
}

/* 장소 삭제 */
export async function deletePlaceAction(id: number) {
  const { supabase, user } = await requireAuth();
  if (!id) {
    return { ok: false, type: ERR.BAD_REQUEST.type, message: '잘못된 요청입니다.' };
  }

  const { error } = await supabase.from('places').delete().eq('id', id);
  if (error)
    return {
      ok: false,
      type: ERR.INTERNAL_SERVER_ERROR.type,
      message: '삭제 중 오류가 발생했습니다.',
      details: error.message,
    };
  return { ok: true, data: { deleted: true } };
}
