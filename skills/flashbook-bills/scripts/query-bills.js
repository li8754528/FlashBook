#!/usr/bin/env node

const http = require('http');

const args = process.argv.slice(2);
function getArg(name) {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
}

const API_URL = process.env.FLASHBOOK_API || 'http://localhost:51888';
const period = getArg('period') || 'today';

let path = '/api/bills?limit=50';
if (period === 'today') {
  const today = new Date().toISOString().split('T')[0];
  path = `/api/bills?startDate=${today}&endDate=${today}`;
} else if (period === 'month') {
  const now = new Date();
  const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  path = `/api/bills?startDate=${startDate}&endDate=${endDate}`;
}

const url = new URL(path, API_URL);

http.get(url, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const result = JSON.parse(body);
    if (result.success) {
      if (result.data.length === 0) {
        console.log('暂无账单记录');
        return;
      }
      console.log(`📋 账单列表 (共${result.total}条):`);
      console.log('─'.repeat(50));
      let total = 0;
      result.data.forEach(bill => {
        console.log(`${bill.transaction_date} | ¥${bill.amount.toFixed(2)} | ${bill.description || bill.merchant || '-'} | ${bill.category_name || '-'}`);
        total += bill.amount;
      });
      console.log('─'.repeat(50));
      console.log(`合计: ¥${total.toFixed(2)}`);
    } else {
      console.error(`❌ 查询失败: ${result.error}`);
    }
  });
}).on('error', (e) => {
  console.error(`❌ 请求失败: ${e.message}`);
});
