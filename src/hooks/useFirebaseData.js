// src/hooks/useFirebaseData.js
import { useState, useEffect } from 'react';
import {
  db,
  auth,
  collection,
  onSnapshot,
  query,
  onAuthStateChanged
} from '../lib/firebase';

/**
 * 订阅 Firebase 数据
 * 封装 matchHistory、playerProfiles、user 的实时订阅
 * 
 * @returns {{
 *   matchHistory: import('../types').Match[],
 *   playerProfiles: Object.<string, import('../types').PlayerProfile>,
 *   user: Object|null,
 *   isAdmin: boolean,
 *   loading: boolean,
 *   error: Error|null
 * }}
 */
function useFirebaseData() {
  const [matchHistory, setMatchHistory] = useState([]);
  const [playerProfiles, setPlayerProfiles] = useState({});
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. 监听认证状态
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAdmin(!!u);
    });

    // 2. 监听比赛数据
    const q = query(collection(db, 'matches'));
    const unsubMatches = onSnapshot(
      q,
      (snapshot) => {
        const matches = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        // 按日期降序排列
        matches.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMatchHistory(matches);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Match sync error:', err);
        setError(err);
        setLoading(false);
      }
    );

    // 3. 监听玩家档案
    const unsubProfiles = onSnapshot(
      collection(db, 'profiles'),
      (snapshot) => {
        const profiles = {};
        snapshot.docs.forEach(doc => {
          const rawData = doc.data();
          // 兼容不同的数据格式
          if (rawData.data && typeof rawData.data === 'string') {
            profiles[doc.id] = {
              avatar: rawData.data,
              realName: rawData.realName || ''
            };
          } else if (rawData.avatar) {
            profiles[doc.id] = rawData;
          } else {
            profiles[doc.id] = {
              avatar: rawData.data || null,
              realName: rawData.realName || ''
            };
          }
        });
        setPlayerProfiles(profiles);
      },
      (err) => {
        console.error('Profile sync error:', err);
      }
    );

    // 清理订阅
    return () => {
      unsubAuth();
      unsubMatches();
      unsubProfiles();
    };
  }, []);

  return {
    matchHistory,
    playerProfiles,
    user,
    isAdmin,
    loading,
    error
  };
}

export default useFirebaseData;
