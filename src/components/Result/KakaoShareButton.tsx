// KakaoShareButton.tsx
import { LuShare2 } from 'react-icons/lu';
import { KAKAO_JS_API_KEY } from '@/config';

type Props = {
  name: string;
  description?: string | null;
  image_url?: string | null;
};

const KakaoShareButton = ({ name, description, image_url }: Props) => {
  const handleKakaoShare = () => {
    if (typeof window === 'undefined') return;

    const w = window as any;
    const Kakao = w.Kakao;

    console.log('Kakao in handler:', Kakao);

    if (!Kakao) {
      alert('카카오 공유 스크립트를 불러오는 중입니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    if (!Kakao.isInitialized()) {
      Kakao.init(KAKAO_JS_API_KEY);
    }

    const shareUrl = w.location.href;

    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: name,
        description: description || '갈낭말낭에서 랜덤으로 뽑은 제주 여행지',
        imageUrl: image_url || '공유용 기본 이미지 URL', // 여기는 실제 공유용 기본 이미지 URL로 교체
        link: {
          mobileWebUrl: shareUrl,
          webUrl: shareUrl,
        },
      },
      buttons: [
        {
          title: '자세히 보기',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
      ],
    });
  };

  return (
    <button
      type="button"
      className="text-neutral-500 hover:text-neutral-700 cursor-pointer"
      onClick={handleKakaoShare}
      title="카카오톡 공유하기"
    >
      <LuShare2 size={20} />
    </button>
  );
};

export default KakaoShareButton;
