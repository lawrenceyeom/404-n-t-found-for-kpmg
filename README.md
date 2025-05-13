# KPMG 风控 Demo 云端部署指南（Render）

## 一、准备工作
1. 注册并登录 [Render.com](https://render.com)
2. 将本项目代码推送到 GitHub（建议公开仓库）

## 二、后端部署（FastAPI）
1. Render 新建 Web Service
2. 选择仓库，Root Directory 填写：`backend/app`
3. 环境选择 Python 3.10+
4. Build Command：
   ```
   pip install -r ../../requirements.txt
   ```
5. Start Command：
   ```
   uvicorn main:app --host 0.0.0.0 --port 10000
   ```
6. 确保 `.venv/财务模板大全-兴化城投-2024年9月末(已更新).xlsx` 文件已上传到仓库
7. 部署完成后，记下后端访问地址（如 https://your-backend-service.onrender.com）

## 三、前端部署（React）
1. Render 新建 Static Site
2. Root Directory 填写：`frontend`
3. Build Command：
   ```
   npm install && npm run build
   ```
4. Publish Directory：
   ```
   build
   ```
5. 在 Render 环境变量中添加：
   - `REACT_APP_API_BASE` = 后端服务地址（如 https://your-backend-service.onrender.com）
6. 部署完成后，访问前端 Render 地址即可体验

## 四、常见问题
- 若接口 404，请检查 API_BASE 是否正确、后端服务是否启动
- 若 Excel 路径报错，请确保文件已上传且路径为相对路径
- 如需本地体验，见下方"本地启动"说明

## 五、本地启动（开发用）
详见原 README 或联系开发者 