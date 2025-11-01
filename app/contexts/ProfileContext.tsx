// app/contexts/ProfileContext.tsx
import React, { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

// ✅ 프로필 사진 타입 (업로드 or 기본 아바타)
export type ProfilePhoto =
  | {
      type: 'custom';               // 카메라/갤러리
      uri: string;                  // file:// or content:// or https://
      name: string;                 // 예: UserProfile.jpg
      typeMime: 'image/jpeg' | 'image/png' | 'image/webp';
    }
  | {
      type: 'avatar';               // 기본 캐릭터(로컬/원격 SVG 가능)
      uri: string;                  // 로컬 svg -> 사용 안할 수 있음(서버는 키/URL만 받으면 OK)
      name: string;                 // 예: avatar1.svg (의미상)
      typeMime: 'image/svg+xml';
    };

type ProfileData = {
  firstname: string;
  lastname: string;
  gender: string;
  country: string;
  language: string[];
  introduction: string;
  photo: ProfilePhoto | null;       // 👈 any → ProfilePhoto | null
  purpose: string;
  birthday: string;
  hobby: string[];
};

type ProfileContextValue = {
  profileData: ProfileData;
  updateProfile: (key: keyof ProfileData, value: ProfileData[keyof ProfileData]) => void; // (이름/시그니처 유지)
};

const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    firstname: '',
    lastname: '',
    gender: '',
    country: '',
    language: [],
    introduction: '',
    photo: null,
    purpose: '',
    birthday: '',
    hobby: [],
  });

  const updateProfile = (key: keyof ProfileData, value: ProfileData[keyof ProfileData]) => {
    setProfileData((prev) => ({ ...prev, [key]: value }));
  };

  const value = useMemo(() => ({ profileData, updateProfile }), [profileData]);
  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
};
