"""
AI 服务模块
支持多个 AI 提供商：OpenAI, Anthropic, Gemini, DeepSeek, 智谱, 文心, 通义, Ollama
提供统一的调用接口和流式输出支持
"""

import asyncio
import json
from typing import AsyncGenerator, Optional
import logging

from config import settings, get_ai_providers, get_primary_ai_provider

logger = logging.getLogger(__name__)


class AIService:
    """AI 服务基类"""

    def __init__(self):
        self.provider = None
        self.client = None
        self.model = None
        self._initialize_provider()

    def _initialize_provider(self):
        """初始化 AI 服务商"""
        # 获取指定的或自动选择的 AI 服务商
        provider = get_primary_ai_provider()

        if not provider:
            logger.warning("未配置任何 AI 服务，使用模拟模式")
            self.provider = "mock"
            return

        self.provider = provider
        logger.info(f"初始化 AI 服务: {provider}")

        # 根据服务商初始化相应的客户端
        try:
            if provider == "openai":
                self._init_openai()
            elif provider == "anthropic":
                self._init_anthropic()
            elif provider == "gemini":
                self._init_gemini()
            elif provider == "deepseek":
                self._init_deepseek()
            elif provider == "zhipuai":
                self._init_zhipuai()
            elif provider == "qianfan":
                self._init_qianfan()
            elif provider == "dashscope":
                self._init_dashscope()
            elif provider == "ollama":
                self._init_ollama()
            else:
                logger.warning(f"未知的服务商: {provider}，使用模拟模式")
                self.provider = "mock"
        except Exception as e:
            logger.error(f"初始化 {provider} 客户端失败: {e}，降级到模拟模式")
            self.provider = "mock"

    def _init_openai(self):
        """初始化 OpenAI"""
        try:
            from openai import OpenAI
            self.client = OpenAI(
                api_key=settings.OPENAI_API_KEY,
                base_url=settings.OPENAI_BASE_URL
            )
            self.model = settings.OPENAI_MODEL
            logger.info(f"OpenAI 初始化成功，模型: {self.model}")
        except ImportError:
            raise ImportError("未安装 openai 库，请运行: pip install openai")

    def _init_anthropic(self):
        """初始化 Anthropic Claude"""
        try:
            from anthropic import Anthropic
            self.client = Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            self.model = settings.ANTHROPIC_MODEL
            logger.info(f"Anthropic Claude 初始化成功，模型: {self.model}")
        except ImportError:
            raise ImportError("未安装 anthropic 库，请运行: pip install anthropic")

    def _init_gemini(self):
        """初始化 Google Gemini"""
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            self.client = genai.GenerativeModel(settings.GEMINI_MODEL)
            self.model = settings.GEMINI_MODEL
            logger.info(f"Google Gemini 初始化成功，模型: {self.model}")
        except ImportError:
            raise ImportError("未安装 google-generativeai 库，请运行: pip install google-generativeai")

    def _init_deepseek(self):
        """初始化 DeepSeek"""
        try:
            from openai import OpenAI
            self.client = OpenAI(
                api_key=settings.DEEPSEEK_API_KEY,
                base_url=settings.DEEPSEEK_BASE_URL
            )
            self.model = settings.DEEPSEEK_MODEL
            logger.info(f"DeepSeek 初始化成功，模型: {self.model}")
        except ImportError:
            raise ImportError("未安装 openai 库（DeepSeek 使用 OpenAI 兼容接口），请运行: pip install openai")

    def _init_zhipuai(self):
        """初始化智谱 AI"""
        try:
            from zhipuai import ZhipuAI
            self.client = ZhipuAI(api_key=settings.ZHIPUAI_API_KEY)
            self.model = settings.ZHIPUAI_MODEL
            logger.info(f"智谱 AI 初始化成功，模型: {self.model}")
        except ImportError:
            raise ImportError("未安装 zhipuai 库，请运行: pip install zhipuai")

    def _init_qianfan(self):
        """初始化百度文心一言"""
        # 文心一言的认证较复杂，这里使用简化实现
        try:
            import requests
            self.client = requests
            self.model = settings.QIANFAN_MODEL
            # 需要从 API Key 中提取 access_key 和 secret_key
            logger.info(f"百度文心一言初始化成功，模型: {self.model}")
        except ImportError:
            raise ImportError("未安装 requests 库，请运行: pip install requests")

    def _init_dashscope(self):
        """初始化阿里云通义千问"""
        try:
            import dashscope
            self.client = dashscope
            self.model = settings.DASHSCOPE_MODEL
            logger.info(f"阿里云通义千问初始化成功，模型: {self.model}")
        except ImportError:
            raise ImportError("未安装 dashscope 库，请运行: pip install dashscope")

    def _init_ollama(self):
        """初始化 Ollama（本地模型）"""
        try:
            from openai import OpenAI
            self.client = OpenAI(
                base_url=settings.OLLAMA_BASE_URL,
                api_key="ollama"  # Ollama 不需要 API Key
            )
            self.model = settings.OLLAMA_MODEL
            logger.info(f"Ollama 初始化成功，模型: {self.model}")
        except ImportError:
            raise ImportError("未安装 openai 库（Ollama 使用 OpenAI 兼容接口），请运行: pip install openai")

    async def generate_response(
        self,
        messages: list[dict],
        stream: bool = False
    ) -> AsyncGenerator[str, None]:
        """
        生成 AI 回复

        Args:
            messages: 对话历史列表，格式：[{"role": "user", "content": "..."}]
            stream: 是否使用流式输出

        Yields:
            str: 生成的文本片段（流式模式）或完整文本（非流式）
        """
        if self.provider == "mock":
            async for text in self._mock_generate(messages):
                yield text
            return

        try:
            if self.provider in ["openai", "deepseek", "ollama"]:
                async for text in self._openai_generate(messages, stream):
                    yield text
            elif self.provider == "anthropic":
                async for text in self._anthropic_generate(messages, stream):
                    yield text
            elif self.provider == "gemini":
                async for text in self._gemini_generate(messages, stream):
                    yield text
            elif self.provider == "zhipuai":
                async for text in self._zhipuai_generate(messages, stream):
                    yield text
            elif self.provider == "qianfan":
                async for text in self._qianfan_generate(messages, stream):
                    yield text
            elif self.provider == "dashscope":
                async for text in self._dashscope_generate(messages, stream):
                    yield text
            else:
                logger.warning(f"服务商 {self.provider} 暂不支持，使用模拟模式")
                async for text in self._mock_generate(messages):
                    yield text
        except Exception as e:
            logger.error(f"AI 调用失败 ({self.provider}): {e}")
            # 失败时降级到模拟模式
            async for text in self._mock_generate(messages):
                yield text

    async def _openai_generate(
        self,
        messages: list[dict],
        stream: bool
    ) -> AsyncGenerator[str, None]:
        """OpenAI / DeepSeek / Ollama 生成（使用 OpenAI 兼容接口）"""
        if stream:
            # 流式输出
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=messages,
                stream=True,
                max_tokens=settings.AI_MAX_TOKENS,
                temperature=settings.AI_TEMPERATURE
            )

            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    # 模拟打字机效果的小延迟
                    await asyncio.sleep(0.01)
        else:
            # 非流式输出
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=messages,
                stream=False,
                max_tokens=settings.AI_MAX_TOKENS,
                temperature=settings.AI_TEMPERATURE
            )
            yield response.choices[0].message.content

    async def _anthropic_generate(
        self,
        messages: list[dict],
        stream: bool
    ) -> AsyncGenerator[str, None]:
        """Anthropic Claude 生成"""
        # Anthropic API 需要特定的消息格式
        # 将 OpenAI 格式转换为 Anthropic 格式
        system_message = None
        anthropic_messages = []

        for msg in messages:
            if msg["role"] == "system":
                system_message = msg["content"]
            else:
                anthropic_messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })

        if stream:
            # 流式输出
            with self.client.messages.stream(
                model=self.model,
                system=system_message,
                messages=anthropic_messages,
                max_tokens=settings.AI_MAX_TOKENS,
                temperature=settings.AI_TEMPERATURE
            ) as stream:
                for text in stream.text_stream:
                    yield text
                    await asyncio.sleep(0.01)
        else:
            # 非流式输出
            response = await asyncio.to_thread(
                self.client.messages.create,
                model=self.model,
                system=system_message,
                messages=anthropic_messages,
                max_tokens=settings.AI_MAX_TOKENS,
                temperature=settings.AI_TEMPERATURE
            )
            yield response.content[0].text

    async def _gemini_generate(
        self,
        messages: list[dict],
        stream: bool
    ) -> AsyncGenerator[str, None]:
        """Google Gemini 生成"""
        # 将 OpenAI 格式转换为 Gemini 格式
        gemini_messages = []

        for msg in messages:
            if msg["role"] == "system":
                # Gemini 将 system 作为第一个 user 消息
                gemini_messages.append({
                    "role": "user",
                    "parts": [{"text": f"System: {msg['content']}"}]
                })
            else:
                role = "user" if msg["role"] == "user" else "model"
                gemini_messages.append({
                    "role": role,
                    "parts": [{"text": msg["content"]}]
                })

        if stream:
            # 流式输出
            response = await asyncio.to_thread(
                self.client.generate_content,
                gemini_messages,
                stream=True
            )

            for chunk in response:
                if chunk.text:
                    yield chunk.text
                    await asyncio.sleep(0.01)
        else:
            # 非流式输出
            response = await asyncio.to_thread(
                self.client.generate_content,
                gemini_messages,
                stream=False
            )
            yield response.text

    async def _zhipuai_generate(
        self,
        messages: list[dict],
        stream: bool
    ) -> AsyncGenerator[str, None]:
        """智谱 AI 生成"""
        if stream:
            # 流式输出
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=messages,
                stream=True,
                max_tokens=settings.AI_MAX_TOKENS,
                temperature=settings.AI_TEMPERATURE
            )

            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    await asyncio.sleep(0.01)
        else:
            # 非流式输出
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model=self.model,
                messages=messages,
                stream=False,
                max_tokens=settings.AI_MAX_TOKENS,
                temperature=settings.AI_TEMPERATURE
            )
            yield response.choices[0].message.content

    async def _qianfan_generate(
        self,
        messages: list[dict],
        stream: bool
    ) -> AsyncGenerator[str, None]:
        """百度文心一言生成（简化实现）"""
        # 注意：完整实现需要 OAuth 认证
        # 这里提供简化版本，建议用户使用其他 AI 服务
        logger.warning("文心一言的完整实现需要 OAuth 认证，当前使用模拟模式")
        async for text in self._mock_generate(messages):
            yield text

    async def _dashscope_generate(
        self,
        messages: list[dict],
        stream: bool
    ) -> AsyncGenerator[str, None]:
        """阿里云通义千问生成"""
        if stream:
            # 流式输出
            response = await asyncio.to_thread(
                self.client.Generation.call,
                model=self.model,
                messages=messages,
                stream=True,
                max_tokens=settings.AI_MAX_TOKENS,
                temperature=settings.AI_TEMPERATURE,
                result_format='message'
            )

            for chunk in response:
                if chunk.output.choices[0].message.content:
                    yield chunk.output.choices[0].message.content
                    await asyncio.sleep(0.01)
        else:
            # 非流式输出
            response = await asyncio.to_thread(
                self.client.Generation.call,
                model=self.model,
                messages=messages,
                stream=False,
                max_tokens=settings.AI_MAX_TOKENS,
                temperature=settings.AI_TEMPERATURE,
                result_format='message'
            )
            yield response.output.choices[0].message.content

    async def _mock_generate(
        self,
        messages: list[dict]
    ) -> AsyncGenerator[str, None]:
        """模拟 AI 生成（当没有配置 API Key 时使用）"""
        # 获取用户最后一条消息
        user_messages = [msg for msg in messages if msg["role"] == "user"]
        last_user_msg = user_messages[-1]["content"] if user_messages else ""

        # 根据输入生成模拟回复
        mock_response = self._get_mock_response(last_user_msg)

        if len(mock_response) < 100:
            # 短回复直接返回
            yield mock_response
        else:
            # 长回复模拟流式输出
            words = mock_response.split()
            for i, word in enumerate(words):
                delta = word + (" " if i < len(words) - 1 else "")
                yield delta
                await asyncio.sleep(0.05)

    def _get_mock_response(self, user_input: str) -> str:
        """生成模拟回复内容"""
        if not user_input:
            return "你好！我是 AI 助手，有什么可以帮助你的吗？"

        # 根据用户输入的关键词生成不同的回复
        user_input_lower = user_input.lower()

        if any(word in user_input_lower for word in ["你好", "hello", "hi"]):
            return "你好！很高兴见到你。我是一个 AI 助手，虽然目前运行在模拟模式下，但我的设计目标是帮助回答问题、提供信息和进行有意义的对话。有什么我可以帮助你的吗？"

        elif any(word in user_input_lower for word in ["介绍", "是谁", "about"]):
            return "我是 V4Corner 班级网站的 AI 助手。当前我运行在模拟模式下，提供对话功能的演示。要启用真实的 AI 对话，请在后端 .env 文件中配置相应的 API Key（如 OPENAI_API_KEY）。我支持多个 AI 服务商，包括 OpenAI、Anthropic Claude、Google Gemini 等。"

        elif any(word in user_input_lower for word in ["怎么用", "如何", "help"]):
            return "使用方法很简单：\n\n1. **发送消息**：在输入框输入你的问题，按 Enter 发送\n2. **流式输出**：你会看到我的回答以打字机效果逐字显示\n3. **管理对话**：左侧可以看到所有对话历史\n4. **反馈功能**：可以对每条回复进行评价\n\n目前系统运行在模拟模式，回复是预设的。配置真实 AI 后，我可以提供更智能的回答！"

        elif any(word in user_input_lower for word in ["再见", "bye", "拜拜"]):
            return "再见！如果以后还有问题，随时来找我聊天。祝你有美好的一天！"

        elif any(word in user_input_lower for word in ["谢谢", "感谢", "thank"]):
            return "不客气！能够帮助你是我的荣幸。如果还有其他问题，随时告诉我。"

        else:
            return f"这是一个很好的问题！关于「{user_input[:30]}...」，让我来帮你分析一下。\n\n根据我的理解，这个话题涉及多个关键点。不过，我目前运行在模拟模式下，回复内容是预设的示例文本。要获得真实的 AI 回答，需要在后端配置 API Key。\n\n建议你：\n1. 在 backend/.env 文件中添加 OPENAI_API_KEY 或其他 AI 服务的 API Key\n2. 重启后端服务\n3. 就能体验真正的 AI 对话了！\n\n还有什么想了解的吗？"


# 创建全局 AI 服务实例
ai_service = AIService()
