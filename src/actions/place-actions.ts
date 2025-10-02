'use server';

import { createServerSupabaseClient } from '@/utils/supabase/server';
import type { Database } from '@/types_db';
import {
  PlaceCategoryType,
  PlaceRegionType,
  PlaceStatusType,
  PlaceRowType,
  ListPlacesParamsType,
  ListPlacesResultType,
} from '@/types/places';
import { KAKAO_API_KEY } from '@/config';

export type CreatePlaceResult = { ok: true; id?: number } | { ok: false; msg: string };
type PlacesInsert = Database['public']['Tables']['places']['Insert'];
type PlacesUpdate = Database['public']['Tables']['places']['Update'];

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}

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

async function geocodeByAddress(address: string) {
  const key = KAKAO_API_KEY;
  console.log(KAKAO_API_KEY);
  if (!key) throw new Error('KAKAO_REST_API_KEY 없음');
  const url = new URL('https://dapi.kakao.com/v2/local/search/address.json');
  url.searchParams.set('query', address.trim());
  url.searchParams.set('analyze_type', 'exact');
  url.searchParams.set('page', '1');
  url.searchParams.set('size', '1');
  const res = await fetch(url.toString(), {
    headers: { Authorization: `KakaoAK ${key}` },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error(`지오코딩 실패(${res.status})`);
  const json = await res.json();
  const doc = json?.documents?.[0];
  if (!doc) throw new Error('주소에 대한 좌표를 찾지 못했습니다');
  const lng = Number(doc.x),
    lat = Number(doc.y);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('좌표 파싱 실패');
  return { lat, lng, doc };
}

// 단건 조회 (edit 초기값 로딩)
export async function getPlaceByIdAction(id: number) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from('places').select('*').eq('id', id).single();
  if (error) return null;
  return data;
}

// 리스트 조회
export async function getPlaceListAction(
  params: ListPlacesParamsType
): Promise<ListPlacesResultType> {
  const { q = '', category = '', region = '', page = 0, pageSize = 10 } = params ?? {};
  const supabase = await createServerSupabaseClient();

  // count
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
    .order('created_at', { ascending: false })
    .range(from, to);

  if (q.trim()) dataQuery = dataQuery.ilike('name', `%${q.trim()}%`);
  if (category) dataQuery = dataQuery.eq('category', category);
  if (region) dataQuery = dataQuery.eq('region', region);

  const { data, error } = await dataQuery;
  if (error) throw new Error(error.message);

  // 🔒 런타임에서 타입 안전하게 매핑(옵션)
  const rows: PlaceRowType[] = (data ?? []).map((r) => ({
    id: r.id as number,
    name: String(r.name),
    category: r.category as PlaceCategoryType,
    region: r.region as PlaceRegionType,
    status: r.status as PlaceStatusType,
    address_line1: r.address_line1 ?? null,
    created_at: String(r.created_at),
  }));

  return { rows, total: count ?? 0 };
}

export async function createPlaceAction(form: FormData): Promise<CreatePlaceResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, msg: '로그인이 필요합니다.' };

    // 1) 폼 파싱
    const name = String(form.get('name') ?? '').trim();
    const category = form.get('category') as PlaceCategoryType | null;
    const region = form.get('region') as PlaceRegionType | null;
    const description = String(form.get('description') ?? '').trim() || null;
    const address = String(form.get('address') ?? '').trim() || null;
    const phone = String(form.get('phone') ?? '').trim() || null;
    const tags = parseTags(form.get('tags')); // string[] | null
    const file = (form.get('image') as File | null) ?? null;
    const hours = String(form.get('hours') ?? '').trim() || null;

    if (!name || !category || !region) {
      return { ok: false, msg: '필수값(이름/카테고리/지역)을 확인해주세요.' };
    }

    // 2) 좌표: 주소가 있으면 API로 조회 (원하시면 빈 좌표 허용 가능)
    let lat: number | null = null;
    let lng: number | null = null;
    if (address) {
      const geo = await geocodeByAddress(address);
      lat = geo.lat;
      lng = geo.lng;
    }

    // 3) 이미지 업로드(선택)
    let image_url: string | null = null;
    if (file && file.size > 0) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const path = `${category}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('placeimg')
        .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });
      if (upErr) return { ok: false, msg: upErr.message };
      const { data: pub } = await supabase.storage.from('placeimg').getPublicUrl(path);
      image_url = pub?.publicUrl ?? null;
    }

    // DB insert (스키마에 맞춰 필드 조정)
    const payload: PlacesInsert = {
      name,
      category,
      region,
      description,
      address_line1: address,
      phone,
      tags: tags ?? null, // text[] | null
      image_url,
      lat,
      lng,
      hours,
      status: 'published' as unknown as PlacesInsert['status'], // 스키마에 status 있으면 유지
    };

    const { data, error } = await supabase.from('places').insert(payload).select('id').single();

    if (error) throw error;

    return { ok: true, id: data?.id };
  } catch (e: any) {
    // 주소 유니크 위반시
    if (e?.code === '23505') return { ok: false, msg: '이미 동일 주소가 등록되어 있습니다.' };
    return { ok: false, msg: e?.message ?? '등록 중 오류가 발생했습니다.' };
  }
}

/** 업데이트 */
export async function updatePlaceAction(form: FormData): Promise<CreatePlaceResult> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { ok: false, msg: '로그인이 필요합니다.' };

    const id = Number(form.get('id'));
    if (!Number.isFinite(id)) return { ok: false, msg: '잘못된 요청입니다.' };

    // 현재 값 로딩 (주소 변경 감지)
    const { data: current, error: curErr } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .single();
    if (curErr || !current) return { ok: false, msg: '대상을 찾을 수 없습니다.' };

    const name = String(form.get('name') ?? '').trim();
    const categoryRaw = form.get('category') as PlaceCategoryType | null;
    const regionRaw = form.get('region') as PlaceRegionType | null;
    const description = String(form.get('description') ?? '').trim() || null;
    const address = String(form.get('address') ?? '').trim() || null;
    const phone = String(form.get('phone') ?? '').trim() || null;
    const tags = parseTags(form.get('tags'));
    const file = (form.get('image') as File | null) ?? null;

    // 좌표: 주소 변경 시에만 갱신 (항상 갱신 원하면 조건 제거)
    let lat: number | null = current.lat ?? null;
    let lng: number | null = current.lng ?? null;

    if ((address || '') !== (current.address_line1 || '')) {
      if (address) {
        const geo = await geocodeByAddress(address);
        lat = geo.lat;
        lng = geo.lng;
      } else {
        lat = null;
        lng = null;
      }
    }

    // 이미지 교체 (선택)
    let image_url: string | null = current.image_url ?? null;
    if (file && file.size > 0) {
      const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      const cate = (categoryRaw ?? current.category) as string; // 경로에 사용할 값(빈값 방지)
      const path = `${cate}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('placeimg')
        .upload(path, file, { upsert: true, contentType: file.type || 'image/jpeg' });
      if (upErr) return { ok: false, msg: upErr.message };
      const { data: pub } = await supabase.storage.from('placeimg').getPublicUrl(path);
      image_url = pub?.publicUrl ?? null;
    }

    const payloadBase: PlacesUpdate = {
      name: name || undefined, // 빈 문자열이면 업데이트 생략
      category: (categoryRaw ?? undefined) as PlacesUpdate['category'],
      region: (regionRaw ?? undefined) as PlacesUpdate['region'],
      description, // null 허용 컬럼이면 그대로
      address_line1: address, // null 허용 컬럼이면 그대로
      phone, // null 허용 컬럼이면 그대로
      tags: (tags ?? undefined) as PlacesUpdate['tags'],
      image_url, // null 허용이면 그대로
      lat, // number | null 허용
      lng, // number | null 허용
      // updated_at: new Date().toISOString(), // 스키마에 있으면 사용
    };

    const payload = stripUndefined(payloadBase);

    const { error } = await supabase.from('places').update(payload).eq('id', id);
    if (error) throw error;

    return { ok: true };
  } catch (e: any) {
    if (e?.code === '23505') return { ok: false, msg: '이미 동일 주소가 등록되어 있습니다.' };
    return { ok: false, msg: e?.message ?? '수정 중 오류가 발생했습니다.' };
  }
}

// 장소 삭제
export async function deletePlaceAction(id: number): Promise<{ ok: boolean; msg?: string }> {
  if (!Number.isFinite(id)) return { ok: false, msg: '잘못된 요청입니다.' };
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('places').delete().eq('id', id);
  if (error) return { ok: false, msg: error.message };
  return { ok: true, msg: '삭제되었습니다.' };
}
