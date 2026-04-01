#!/usr/bin/env node

const http = require('http');

const args = process.argv.slice(2);
function getArg(name) {
  const arg = args.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
}

const API_URL = process.env.FLASHBOOK_API || 'http://localhost:51888';

const data = {
  amount: parseFloat(getArg('amount')),
  description: getArg('description'),
  category: getArg('category'),
  merchant: getArg('merchant'),
  location: getArg('location'),
  payment_method: getArg('payment'),
  transaction_date: getArg('date')
};

if (!data.amount || !data.transaction_date) {
  console.error('错误: amount和date为必填项');
  console.log('用法: node import-bill.js --amount=100 --date=2026-03-31 [--description=xx] [--category=餐饮] [--merchant=xx] [--location=xx] [--payment=支付宝]');
  process.exit(1);
}

const postData = JSON.stringify(data);
const url = new URL('/api/bills/import', API_URL);

const options = {
  hostname: url.hostname,
  port: url.port,
  path: url.pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    const result = JSON.parse(body);
    if (result.success) {
      console.log(`✅ 账单导入成功!`);
      console.log(`   金额: ${result.data.amount}`);
      console.log(`   描述: ${result.data.description || '-'}`);
      console.log(`   分类: ${result.data.category_name || '-'}`);
      console.log(`   日期: ${result.data.transaction_date}`);
    } else {
      console.error(`❌ 导入失败: ${result.error}`);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ 请求失败: ${e.message}`);
});

req.write(postData);
req.end();
