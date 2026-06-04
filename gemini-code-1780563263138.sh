# 1. 将所有新重构的页面 (page.tsx) 与算力额度组件 (CreditBadge.tsx) 加入暂存区
git add .

# 2. 提交生产环境快照，记录本次向 RunningHub 极简架构的跨越
git commit -m "refactor: upgrade to RunningHub-style split UI with Node workflow and CreditBadge component"

# 3. 确保推送到 Vercel 绑定的云端主分支
git branch -M main

# 4. 轰击 GitHub 远程仓库，自动触发 Webhook
git push -u origin main