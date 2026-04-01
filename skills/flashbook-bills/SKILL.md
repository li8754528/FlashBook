# FlashBook 记账技能

记录消费账单到FlashBook记账系统。

## When to Use This Skill

当用户需要：
- 记录消费账单
- 导入OCR解析的消费信息
- 添加新的支出/收入记录
- 查询账单信息

## Commands

### 导入账单（通过命令行）
node scripts/import-bill.js --amount 128.50 --description "午餐" --category "餐饮" --merchant "海底捞" --location "北京市" --payment "支付宝" --date "2026-03-31"

### 查询今日账单
node scripts/query-bills.js --period today

### 查询本月账单
node scripts/query-bills.js --period month

## Examples

导入一张午餐账单：
node scripts/import-bill.js --amount 45.00 --description "午餐外卖" --category "餐饮" --merchant "美团外卖" --payment "微信" --date "2026-03-31"

导入购物账单：
node scripts/import-bill.js --amount 299.00 --description "购买生活用品" --category "购物" --merchant "淘宝" --payment "支付宝" --date "2026-03-30"

## Notes

- API默认运行在 http://localhost:51888
- 分类支持：餐饮、交通、购物、娱乐、居住、医疗、教育、其他
- 支付方式支持：现金、微信、支付宝、银行卡等
