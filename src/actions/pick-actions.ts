'use server';

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/utils/supabase/server';

export async function pickPlaceAction(formData: FormData) {
  const region = String(formData.get('region') ?? 'all');
  const category = String(formData.get('category') ?? 'all');
  const lat = formData.get('lat');
  const lng = formData.get('lng');
  const r = Number(formData.get('r') ?? 2000); // 반경(m), 기본 2km

  const supabase = await createServerSupabaseClient();

  // 1) 현재위치 근처(nearby): 좌표가 있어야 동작
  if (region === 'nearby') {
    const userLat = Number(lat);
    const userLng = Number(lng);
    if (!Number.isFinite(userLat) || !Number.isFinite(userLng)) {
      // 좌표가 없으면 안내 페이지로
      redirect(`/result/empty?reason=no-location`);
    }

    // 고급형 RPC: 거리/랜덤까지 DB에서 바로 1개
    const { data, error } = await supabase.rpc('pick_one_nearby', {
      user_lat: userLat,
      user_lng: userLng,
      radius_m: r,
      p_category: category === 'all' ? null : (category as any),
    });

    if (error || !data?.[0]) {
      redirect(`/result/empty?region=${region}&category=${category}`);
    }
    redirect(`/result/${data[0].id}`);
  }

  // 2) 그 외(전체/특정 지역): 기존 랜덤
  // 총 개수
  let countQ = supabase.from('places').select('id', { count: 'exact', head: true });
  if (region !== 'all') countQ = countQ.eq('region', region);
  if (category !== 'all') countQ = countQ.eq('category', category);

  const { count, error: countErr } = await countQ;
  if (countErr || !count || count <= 0) {
    redirect(`/result/empty?region=${region}&category=${category}`);
  }

  const index = Math.floor(Math.random() * count);
  let pickQ = supabase.from('places').select('id').range(index, index);
  if (region !== 'all') pickQ = pickQ.eq('region', region);
  if (category !== 'all') pickQ = pickQ.eq('category', category);

  const { data, error } = await pickQ;
  if (error || !data?.[0]?.id) {
    redirect(`/result/empty?region=${region}&category=${category}`);
  }
  redirect(`/result/${data[0].id}`);
}


const VALID = new Set(['food', 'cafe', 'sight']);

export async function pickByCategoryAction(formData: FormData) {
  const category = String(formData.get('category') ?? '').trim();

  // 유효성 체크
  if (!VALID.has(category)) {
    redirect(`/result/empty?reason=invalid-category`);
  }

  const supabase = await createServerSupabaseClient();

  // 총 개수 조회
  const { count, error: countErr } = await supabase
    .from('places')
    .select('id', { count: 'exact', head: true })
    .eq('category', category);

  if (countErr || !count || count <= 0) {
    redirect(`/result/empty?category=${encodeURIComponent(category)}`);
  }

  // 랜덤 인덱스 1개만 조회
  const index = Math.floor(Math.random() * count);
  const { data, error } = await supabase
    .from('places')
    .select('id')
    .eq('category', category)
    .range(index, index);

  if (error || !data?.[0]?.id) {
    redirect(`/result/empty?category=${encodeURIComponent(category)}`);
  }

  const id = data[0].id;
  redirect(`/result/${id}`);
}