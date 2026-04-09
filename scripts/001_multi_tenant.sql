-- ============================================================
-- 多租户迁移脚本 v1.0
-- 功能: 新建 leagues / league_members 表，改造 matches / profiles
-- 
-- ⚠️ 使用说明:
--   1. 在 Supabase Dashboard > SQL Editor 中执行
--   2. 执行前请先替换下方 YOUR_USER_ID 为你的真实 user_id
--      (在 Authentication > Users 中查看)
--   3. 分步执行，每个 STEP 执行完确认无误后再执行下一个
-- ============================================================

-- ============================
-- STEP 1: 创建 leagues 表
-- ============================
CREATE TABLE IF NOT EXISTS leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  settings JSONB DEFAULT '{}'::jsonb
);

-- ============================
-- STEP 2: 创建 league_members 表
-- ============================
CREATE TABLE IF NOT EXISTS league_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'viewer')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(league_id, user_id)
);

-- ============================
-- STEP 3: 给 matches 和 profiles 增加 league_id 字段
-- （先允许 NULL，等数据迁移完再加 NOT NULL）
-- ============================
ALTER TABLE matches ADD COLUMN IF NOT EXISTS league_id UUID REFERENCES leagues(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS league_id UUID REFERENCES leagues(id);

-- ============================
-- STEP 4: 创建索引
-- ============================
CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league_id);
CREATE INDEX IF NOT EXISTS idx_profiles_league ON profiles(league_id);
CREATE INDEX IF NOT EXISTS idx_league_members_user ON league_members(user_id);
CREATE INDEX IF NOT EXISTS idx_league_members_league ON league_members(league_id);

-- ============================
-- STEP 5: 创建默认联赛 & 迁移现有数据
-- ⚠️ 请替换 YOUR_USER_ID 为你的真实 user_id
-- ============================

-- 5a: 创建默认联赛
INSERT INTO leagues (name, slug, description, created_by)
VALUES ('145联赛', '145league', '默认联赛 - 迁移自原始数据', NULL)
ON CONFLICT (slug) DO NOTHING;

-- 5b: 将你设为 owner
INSERT INTO league_members (league_id, user_id, role)
SELECT id, '4bc064ac-8f03-4001-9ec8-a59da969724f'::uuid, 'owner'
FROM leagues WHERE slug = '145league'
ON CONFLICT (league_id, user_id) DO NOTHING;

-- 5c: 迁移现有 matches
UPDATE matches
SET league_id = (SELECT id FROM leagues WHERE slug = '145league')
WHERE league_id IS NULL;

-- 5d: 迁移现有 profiles
UPDATE profiles
SET league_id = (SELECT id FROM leagues WHERE slug = '145league')
WHERE league_id IS NULL;

-- ============================
-- STEP 6: 加 NOT NULL 约束
-- ============================
ALTER TABLE matches ALTER COLUMN league_id SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN league_id SET NOT NULL;

-- ============================
-- STEP 7: RLS 策略
-- ============================

-- 7a: leagues 表 RLS
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;

-- 任何人可以读取联赛列表（公开浏览）
CREATE POLICY "公开读取联赛" ON leagues
  FOR SELECT USING (true);

-- 已登录用户可以创建联赛
CREATE POLICY "登录用户创建联赛" ON leagues
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 联赛创建者或 owner 可以更新
CREATE POLICY "管理员更新联赛" ON leagues
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM league_members
      WHERE league_members.league_id = leagues.id
        AND league_members.user_id = auth.uid()
        AND league_members.role = 'owner'
    )
  );

-- 7b: league_members 表 RLS
ALTER TABLE league_members ENABLE ROW LEVEL SECURITY;

-- 同联赛成员可读
CREATE POLICY "同联赛成员可读" ON league_members
  FOR SELECT USING (
    league_id IN (
      SELECT lm.league_id FROM league_members lm
      WHERE lm.user_id = auth.uid()
    )
  );

-- admin/owner 可以管理成员
CREATE POLICY "管理员管理成员" ON league_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM league_members lm
      WHERE lm.league_id = league_members.league_id
        AND lm.user_id = auth.uid()
        AND lm.role IN ('admin', 'owner')
    )
  );

-- 7c: matches 表 RLS（保留现有策略的前提下新增）
-- 注意: 如果 matches 已有 RLS 策略，请先检查并按需调整
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 公开读取（不登录也能看排行榜等）
CREATE POLICY "公开读取比赛" ON matches
  FOR SELECT USING (true);

-- admin/owner 可写
CREATE POLICY "管理员写入比赛" ON matches
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_members.league_id = matches.league_id
        AND league_members.user_id = auth.uid()
        AND league_members.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "管理员更新比赛" ON matches
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_members.league_id = matches.league_id
        AND league_members.user_id = auth.uid()
        AND league_members.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "管理员删除比赛" ON matches
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_members.league_id = matches.league_id
        AND league_members.user_id = auth.uid()
        AND league_members.role IN ('admin', 'owner')
    )
  );

-- 7d: profiles 表 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 公开读取
CREATE POLICY "公开读取档案" ON profiles
  FOR SELECT USING (true);

-- admin/owner 可写
CREATE POLICY "管理员写入档案" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_members.league_id = profiles.league_id
        AND league_members.user_id = auth.uid()
        AND league_members.role IN ('admin', 'owner')
    )
  );

CREATE POLICY "管理员更新档案" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM league_members
      WHERE league_members.league_id = profiles.league_id
        AND league_members.user_id = auth.uid()
        AND league_members.role IN ('admin', 'owner')
    )
  );
