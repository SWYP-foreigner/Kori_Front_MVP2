import React,{createContext,useContext,useState} from 'react';



const ProfileContext=createContext();


export const ProfileProvider=({children}) =>{

    const [profileData,setProfileData]=useState({
        firstname:'',
        lastname:'',
        gender:'',
        country:'',
        language:[],
        introduction:'',
        photo:[],
        purpose:'',
        birthday:'',
        hobby:[]
    });

    const updateProfile=(key,value)=>{
         setProfileData((prev) => {
        const newData = { ...prev, [key]: value };
        console.log("업데이트 직후 profileData:", newData); // 여기서 최신값 확인 가능
        return newData;
  });
    };

    return(
        <ProfileContext.Provider value={{profileData,updateProfile}}>
            {children}
        </ProfileContext.Provider>
    )
};

export const useProfile=()=>useContext(ProfileContext);