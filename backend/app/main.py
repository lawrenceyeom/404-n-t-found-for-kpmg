from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import finance
from .api import fake_data
from .api import alerts
from .api import fake_opinion
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态资源目录（指向.venv目录）
STATIC_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../.venv'))
app.mount("/static", StaticFiles(directory=STATIC_PATH), name="static")

@app.get("/ping")
def ping():
    return {"message": "pong"}

# 后续会在此引入各类API路由
app.include_router(finance.router)
app.include_router(fake_data.router)
app.include_router(alerts.router)
app.include_router(fake_opinion.router) 