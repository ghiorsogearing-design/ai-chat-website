const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// 数据库配置
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'zcy202615',
  database: 'myapp'
});

db.connect(err => {
  if (err) {
    console.log('数据库连接失败:', err);
  } else {
    console.log('数据库连接成功');
  }
});

// 登录接口
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username=? AND password=?',
    [username, password],
    (err, result) => {
      if (result && result.length > 0) {
        res.json({ success: true });
      } else {
        res.json({ success: false });
      }
    }
  );
});

// 聊天接口
const axios = require('axios');

app.post('/chat', async (req, res) => {
  const { message, username } = req.body;

  try {
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: 'qwen-turbo',
        input: {
          prompt: message
        }
      },
      {
        headers: {
          'Authorization': 'Bearer sk-579a5f5c0fa14adbbc628dd43ddf13d6',
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data.output.text;

    // 存数据库
    db.query("INSERT INTO messages (username, message) VALUES (?, ?)", [username, message]);
    db.query("INSERT INTO messages (username, message) VALUES (?, ?)", [username, reply]);

    res.json({ reply });

  } catch (error) {
    console.log('AI接口报错:', error.response?.data || error.message);
    res.json({ reply: "AI出错了..." });
  }
});
// 获取历史记录
app.get('/messages', (req, res) => {
  const username = req.query.username;

  db.query(
    "SELECT * FROM messages WHERE username=?",
    [username],
    (err, result) => {
      if (err) {
        res.json([]);
      } else {
        res.json(result);
      }
    }
  );
});

app.listen(3000, () => {
  console.log('服务器启动：http://localhost:3000');
});