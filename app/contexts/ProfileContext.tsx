import React, { createContext, useContext, useState } from 'react';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profileData, setProfileData] = useState({
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

  const updateProfile = (key, value) => {
    setProfileData((prev) => {
      const newData = { ...prev, [key]: value };
      return newData;
    });
  };

  return <ProfileContext.Provider value={{ profileData, updateProfile }}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => useContext(ProfileContext);
