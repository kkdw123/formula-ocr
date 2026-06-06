#!/bin/bash
# Railway 构建脚本
# 安装服务端依赖
cd server && npm ci
# 安装前端依赖并构建
cd ../client && npm ci && npm run build
