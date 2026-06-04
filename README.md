# promptlens-studio
# 1. 初始化本地 Git 仓库
git init

# 2. 将所有脚手架文件加入暂存区
git add .

# 3. 提交到本地分支
git commit -m "feat: init PromptLens Studio gallery layout and mock data"

# 4. 在 GitHub 上新建一个空仓库（假设叫 promptlens-studio），然后建立关联
git remote add origin https://github.com/你的用户名/promptlens-studio.git
git branch -M main

# 5. 推送到 GitHub
git push -u origin main
