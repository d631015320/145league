// src/services/firebase.service.js
/**
 * @fileoverview Firebase CRUD 操作封装
 * @description 提供比赛记录、玩家档案的增删改查操作，以及数据导出功能
 * @module services/firebase
 */

import {
  db,
  auth,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from '../lib/firebase'
import { ERROR_MESSAGES } from '../constants'
import { validateMatchData } from '../lib/matchValidation'

/**
 * 获取用户友好的错误消息
 * @param {Error} error - 错误对象
 * @returns {string} 用户友好的错误消息
 */
export function getErrorMessage(error) {
  const code = error?.code || '';
  const key = code.replace('firestore/', '').replace('auth/', '');
  return ERROR_MESSAGES[key] || ERROR_MESSAGES.default;
}

/**
 * 保存比赛记录
 * @param {import('../types').Match} matchData - 比赛数据
 * @param {string} [matchId] - 编辑时的比赛ID，新建时为空
 * @returns {Promise<string>} 比赛ID
 * @throws {Error} 保存失败时抛出错误
 */
export async function saveMatch(matchData, matchId = null) {
  // 数据校验
  const { valid, errors } = validateMatchData(matchData)
  if (!valid) {
    throw new Error(`数据校验失败:\n${errors.join('\n')}`)
  }

  try {
    if (matchId) {
      // 编辑时写入 updatedAt
      await updateDoc(doc(db, 'matches', matchId), {
        ...matchData,
        updatedAt: new Date().toISOString()
      });
      return matchId;
    } else {
      const dataWithTimestamp = {
        ...matchData,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'matches'), dataWithTimestamp);
      return docRef.id;
    }
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(`保存比赛失败: ${message}`);
  }
}

/**
 * 删除比赛记录
 * @param {string} matchId - 比赛ID
 * @returns {Promise<void>}
 * @throws {Error} 删除失败时抛出错误
 */
export async function deleteMatch(matchId) {
  try {
    await deleteDoc(doc(db, 'matches', matchId));
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(`删除比赛失败: ${message}`);
  }
}

/**
 * 更新玩家档案
 * @param {string} playerName - 玩家名
 * @param {Partial<import('../types').PlayerProfile>} data - 档案数据
 * @returns {Promise<void>}
 * @throws {Error} 更新失败时抛出错误
 */
export async function updatePlayerProfile(playerName, data) {
  try {
    await setDoc(doc(db, 'profiles', playerName), data, { merge: true });
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(`更新档案失败: ${message}`);
  }
}

/**
 * 上传玩家头像
 * @param {string} playerName - 玩家名
 * @param {string} base64Avatar - Base64 编码的头像
 * @returns {Promise<void>}
 * @throws {Error} 上传失败时抛出错误
 */
export async function uploadAvatar(playerName, base64Avatar) {
  return updatePlayerProfile(playerName, { avatar: base64Avatar });
}

/**
 * 更新玩家真名
 * @param {string} playerName - 玩家网名
 * @param {string} realName - 真名
 * @returns {Promise<void>}
 */
export async function updateRealName(playerName, realName) {
  return updatePlayerProfile(playerName, { realName });
}


/**
 * 批量更名玩家
 * @param {string} oldName - 原名
 * @param {string} newName - 新名
 * @param {import('../types').Match[]} matchHistory - 比赛历史
 * @returns {Promise<number>} 更新的比赛数量
 * @throws {Error} 更名失败时抛出错误
 */
export async function renamePlayer(oldName, newName, matchHistory) {
  try {
    const matchesToUpdate = [];

    matchHistory.forEach(m => {
      let updated = false;

      // 更新 results
      const newResults = m.results.map(r => {
        if (r.name === oldName) {
          updated = true;
          return { ...r, name: newName };
        }
        return r;
      });

      // 更新 roster
      let newRoster = m.roster || [];
      if (newRoster.includes(oldName)) {
        updated = true;
        newRoster = newRoster.map(n => (n === oldName ? newName : n));
      }

      // 更新 transactions
      let newTransactions = m.transactions || [];
      let txUpdated = false;
      newTransactions = newTransactions.map(t => {
        const tMod = { ...t };
        if (t.buyer === oldName) {
          tMod.buyer = newName;
          txUpdated = true;
        }
        if (t.seller === oldName) {
          tMod.seller = newName;
          txUpdated = true;
        }
        return tMod;
      });
      if (txUpdated) updated = true;

      // 更新 finalStacks
      const newStacks = { ...(m.finalStacks || {}) };
      if (newStacks[oldName] !== undefined) {
        newStacks[newName] = newStacks[oldName];
        delete newStacks[oldName];
        updated = true;
      }

      // 更新 MVP 和运气王
      let newMvp = m.votedMvp;
      if (newMvp === oldName) {
        newMvp = newName;
        updated = true;
      }

      let newLucky = m.luckyPlayer;
      if (newLucky === oldName) {
        newLucky = newName;
        updated = true;
      }

      if (updated) {
        matchesToUpdate.push({
          ref: doc(db, 'matches', m.id),
          data: {
            results: newResults,
            roster: newRoster,
            transactions: newTransactions,
            finalStacks: newStacks,
            votedMvp: newMvp,
            luckyPlayer: newLucky
          }
        });
      }
    });

    // 批量更新比赛
    await Promise.all(matchesToUpdate.map(item => updateDoc(item.ref, item.data)));

    // 迁移 Profile
    const oldProfileRef = doc(db, 'profiles', oldName);
    const newProfileRef = doc(db, 'profiles', newName);
    const oldProfileSnap = await getDoc(oldProfileRef);

    if (oldProfileSnap.exists()) {
      await setDoc(newProfileRef, oldProfileSnap.data(), { merge: true });
      await deleteDoc(oldProfileRef);
    }

    return matchesToUpdate.length;
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(`更名失败: ${message}`);
  }
}

/**
 * 导出数据为 JSON
 * @param {import('../types').Match[]} matchHistory - 比赛历史
 * @param {Object.<string, import('../types').PlayerProfile>} playerProfiles - 玩家档案
 * @returns {string} JSON 字符串
 */
export function exportDataToJSON(matchHistory, playerProfiles) {
  const data = { history: matchHistory, profiles: playerProfiles };
  return JSON.stringify(data);
}

/**
 * 下载数据备份
 * @param {import('../types').Match[]} matchHistory - 比赛历史
 * @param {Object.<string, import('../types').PlayerProfile>} playerProfiles - 玩家档案
 */
export function downloadBackup(matchHistory, playerProfiles) {
  const json = exportDataToJSON(matchHistory, playerProfiles);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PokerData_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * 登录
 * @param {string} email - 邮箱
 * @param {string} password - 密码
 */
export async function signIn(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    const message = getErrorMessage(error)
    throw new Error(`登录失败: ${message}`)
  }
}

/**
 * 登出
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth)
  } catch (error) {
    const message = getErrorMessage(error)
    throw new Error(`登出失败: ${message}`)
  }
}
