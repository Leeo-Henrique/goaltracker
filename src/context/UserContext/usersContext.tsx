import React, { createContext, useEffect, useState } from "react";

import camelcaseKeysDeep from "camelcase-keys";
import snakecaseKeys from "snakecase-keys";
import Cookies from "js-cookie";

import { isEmpty } from "lodash";

import { API } from "../../api";
import {
  ICreateUser,
  IUpdateUser,
  IUserLogin,
} from "../../interfaces/UserInterfaces";

const UserContext = createContext({});

interface IChildren {
  children: React.ReactNode;
}

export const UserProvider = ({ children }: IChildren) => {
  const [user, setUser] = useState({});
  const [isFetched, setIsFetched] = useState(false);
  const [token, setToken] = useState(Cookies.get("auth_token"));

  const getUser = async (token: string) => {
    if (!token) {
      return "token must be provided";
    }
    const res = await API.get("users/retrieve_token/", {
      headers: { Authorization: `Token ${token}` },
    })
      .then(({ data }) => camelcaseKeysDeep(data))
      .catch(() => {
        setUser({});
        Cookies.remove("auth_token");
      });
    return res;
  };

  const loginUser = async (data: IUserLogin) => {
    const res = await API.post("users/login/", data).then(({ data }) => {
      Cookies.set("auth_token", data.token, { expires: 7 });
      return data;
    });
    return res;
  };

  const getUserById = async (user_id: number) => {
    const res = await API.get(`/user/${user_id}/`, {
      headers: { Authorization: `Token ${token}` },
    }).then(({ data }) => camelcaseKeysDeep(data));
    return res;
  };

  const createUser = async (data: ICreateUser) => {
    data = snakecaseKeys(data as any);
    const res = await API.post(`/users/register/`, data, {
      headers: { Authorization: `Token ${token}` },
    }).then(({ data }) => camelcaseKeysDeep(data));
    return res;
  };

  const updateUser = async (user_id: number, data: IUpdateUser) => {
    data = snakecaseKeys(data as any);
    const res = await API.patch(`/user/${user_id}/`, data, {
      headers: { Authorization: `Token ${token}` },
    }).then(({ data }) => camelcaseKeysDeep(data));
    return res;
  };

  const deleteUser = async (user_id: number) => {
    const res = await API.delete(`/user/${user_id}/`, {
      headers: { Authorization: `Token ${token}` },
    }).then(({ data }) => camelcaseKeysDeep(data));
    return res;
  };

  useEffect(() => {
    if (isEmpty(user) && token && token !== undefined && isFetched === false) {
      getUser(token).then(setUser);
      setIsFetched(true);
    }
  }, [token]);
  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        getUser,
        token,
        loginUser,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
        setToken,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
export default UserContext;
