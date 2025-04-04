import { atom, selector, useRecoilState } from "recoil";

// 用户信息类型
type UserInfo = {
  username: string;
  avatar: string;
  email: string;
};

// 用户信息状态
export const userInfoState = atom<UserInfo | null>({
  key: "userInfo",
  default: null,
});

// 用户信息相关操作hook
export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useRecoilState(userInfoState);
  
  return {
    // 获取用户信息
    getUserInfo: () => userInfo,
    
    // 设置用户信息
    setUserInfo: (info: UserInfo) => {
      setUserInfo(info);
      localStorage.setItem('userInfo', JSON.stringify(info));
    },
    
    // 清除用户信息
    clearUserInfo: () => {
      setUserInfo(null);
      localStorage.removeItem('userInfo');
    }
  };
};

type Identity = {
    AccessToken: string,
    TokenType: string,
    ExpiresIn: number,
    IDToken: string,
    RefreshToken: string,
}

export const IdentityInfo = atom<Identity>({
  key: "identity",
  default: {
    AccessToken: "",
    TokenType: "",
    ExpiresIn: 0,
    IDToken: "",
    RefreshToken: "",
  },
})

// 设置用户身份信息的函数
export const useSetIdentity = () => {
  const [identity, setIdentity] = useRecoilState(IdentityInfo);
  
  return {
    // 设置完整的身份信息
    setIdentity: (newIdentity: Identity) => {
      setIdentity(newIdentity);
    },
    
    // 设置身份信息（从登录响应）
    setFromLoginResponse: (response: any) => {
      if (response) {
        setIdentity({
          AccessToken: response.access_token || "",
          TokenType: response.token_type || "Bearer",
          ExpiresIn: response.expires_in ? Date.now() + response.expires_in * 1000 : 0,
          IDToken: response.id_token || "",
          RefreshToken: response.refresh_token || "",
        });
      }
    },
    
    // 清除身份信息（登出）
    clearIdentity: () => {
      setIdentity({
        AccessToken: "",
        TokenType: "",
        ExpiresIn: 0,
        IDToken: "",
        RefreshToken: "",
      });
    }
  };
};

export const isAuthenticated = selector<boolean>({
    key: "isAuthenticated",
    get: ({get}) => {
        const identity = get(IdentityInfo);
        if(identity.ExpiresIn > Date.now()) {
            return identity.AccessToken.length > 0;//有效期&&token不为空
        }
        return false;
    }
})

export const idToken = selector<string>({
    key: "idToken",
    get: ({get}) => {
        const identity = get(IdentityInfo);
        return identity.IDToken;
    }
})

export const accessToken = selector<string>({
    key: "accessToken",
    get: ({get}) => {
        const identity = get(IdentityInfo);
        return identity.AccessToken;
    }
})

export const tokenType = selector<string>({
    key: "tokenType",
    get: ({get}) => {
        const identity = get(IdentityInfo);
        return identity.TokenType;
    }
})