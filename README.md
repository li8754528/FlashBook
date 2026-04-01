# FlashBook 记账本

一个简洁的个人记账应用，支持OpenClaw AI助手集成。

## 功能特性

- 📊 **统计分析**：按年/月/日查看消费统计，分类饼图
- 📋 **账单管理**：增删改查，滑动操作快速编辑删除
- 🤖 **OpenClaw集成**：支持AI助手自动导入账单
- 📱 **响应式设计**：完美适配手机和电脑

## 技术栈

- **后端**：Node.js + Express
- **数据库**：SQLite
- **前端**：HTML/CSS/JavaScript + Chart.js

## 快速开始

```bash
# 安装依赖
npm install

# 启动服务
npm start

# 访问 http://localhost:51888
```

## OpenClaw 集成

### Webhook接口

```bash
POST http://localhost:51888/api/bills/import
Content-Type: application/json

{
  "amount": 128.50,
  "description": "午餐消费",
  "category": "餐饮",
  "merchant": "海底捞",
  "payment_method": "支付宝",
  "transaction_date": "2026-03-31"
}
```

### Skill脚本

```bash
node skills/flashbook-bills/scripts/import-bill.js \
  --amount=100 \
  --description="午餐" \
  --category="餐饮" \
  --date="2026-03-31"
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/bills/import | 导入账单 |
| GET | /api/bills | 获取账单列表 |
| PUT | /api/bills/:id | 更新账单 |
| DELETE | /api/bills/:id | 删除账单 |
| GET | /api/reports/daily | 按日统计 |
| GET | /api/reports/monthly | 按月统计 |
| GET | /api/reports/by-category | 按分类统计 |

## 许可证

MIT
