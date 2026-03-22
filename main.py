from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import dashscope

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

dashscope.api_key = "sk-579a5f5c0fa14adbbc628dd43ddf13d6"

# 👉 全局聊天记录（简单版）
chat_history = []

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    global chat_history

    # 👉 加入用户消息
    chat_history.append({
        "role": "user",
        "content": req.message
    })

    # 👉 调用AI（传历史）
    response = dashscope.Generation.call(
        model="qwen-turbo",
        messages=chat_history
    )

    ai_reply = response.output.text

    # 👉 加入AI回复
    chat_history.append({
        "role": "assistant",
        "content": ai_reply
    })

    return {
        "reply": ai_reply
    }

@app.get("/reset")
def reset():
    global chat_history
    chat_history = []
    return {"msg": "已清空记忆"}