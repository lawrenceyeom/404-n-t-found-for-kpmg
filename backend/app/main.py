"""
Main application module for the AURA platform backend.

This module initializes the FastAPI application, configures middleware such as CORS,
registers all API routes, and mounts static file directories.

Main components:
- FastAPI application initialization
- CORS middleware configuration for frontend access
- Static file serving
- API route registration for different platform features (finance, alerts, etc.)
- Platform management API routes (data sources, models)

The application serves as the backend for the AURA (Auditing Universal Risk Analytics) 
platform that provides audit risk monitoring and analysis capabilities.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import finance
from .api import fake_data
from .api import alerts
from .api import fake_opinion
from .api.platform import data_sources_router, models_router
from fastapi.staticfiles import StaticFiles
import os
from .api.datalake import datalake_router

app = FastAPI()

# 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 静态资源目录（指向.venv目录） - This should be removed or reconfigured for production
# STATIC_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../.venv'))
# app.mount("/static", StaticFiles(directory=STATIC_PATH), name="static")

@app.get("/ping")
def ping():
    return {"message": "pong"}

# API路由注册
app.include_router(finance.router)
app.include_router(fake_data.router)
app.include_router(alerts.router)
app.include_router(fake_opinion.router) 

# 平台相关API路由
app.include_router(data_sources_router)
app.include_router(models_router)

# 数据湖API路由
app.include_router(datalake_router, prefix="/api/datalake", tags=["datalake"])