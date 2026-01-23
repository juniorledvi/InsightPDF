# InsightPDF

<div align="center">

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Gemini API](https://img.shields.io/badge/AI-Gemini_Flash/Pro-8E75B2?style=flat-square&logo=google)](https://ai.google.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**与 PDF 对话，并“看见”答案在哪里。**
<br/>
基于 Google Gemini 多模态模型构建的智能文档助手，支持精确的视觉定位与边框高亮。

[快速体验](#-在线演示) • [功能特性](#-核心功能) • [本地部署](#-本地开发)

</div>

---

## 🚀 在线演示

我们提供了两种方式供您体验：

### 1. ⚡️ 免费体验版 (无需 API Key)
通过 Google AI Studio 托管，直接使用，无需任何配置。
> **[👉 点击跳转：AI Studio 免费版](https://ai.studio/apps/drive/14zw9L0KbtQ-Ry_E4GH41ZVh4Ax02DpbB?fullscreenApplet=true)**

### 2. 🔑 自定义版 (配置自己的 API Key)
如果您有自己的 Google Gemini API Key，可以使用此部署版本。
> **[👉 点击跳转：Web 演示版](https://insightpdf.pages.dev/)**

---

## ✨ 核心功能

InsightPDF 不仅仅是一个聊天机器人，它是一个**视觉化**的阅读助手：

*   **🎯 视觉定位 (Visual Grounding)**
    AI 不仅回答问题，还会自动跳转到 PDF 对应页面，并用**红框高亮**显示答案来源（支持文本段落、图表、数据表格）。
*   **🧠 多模态智能**
    基于 **Gemini 2.0 Flash / Pro** 原生多模态能力，无需传统 OCR，直接理解文档的视觉结构。
*   **⚡️ 极速响应**
    支持流式传输，大文件通过 Files API 优化处理，秒级响应。
*   **🎨 优雅体验**
    *   **深色模式**：自动适配系统或手动切换。
    *   **拖拽上传**：支持桌面端全屏拖拽。
    *   **移动端适配**：手机上也能流畅阅读和对话。
*   **🛡️ 隐私优先**
    聊天记录和设置均存储在浏览器本地（LocalStorage/IndexedDB），只需配置 Key，无需担心数据泄露。

---

## 🛠 技术栈

*   **前端框架**: React 19 + Vite
*   **语言**: TypeScript
*   **样式**: Tailwind CSS
*   **PDF 渲染**: React-PDF
*   **AI 模型**: Google Gemini API (`gemini-2.0-flash`, `gemini-1.5-pro`)

---

## 💻 本地开发

如果你想在本地运行该项目：

1.  **克隆仓库**
    ```bash
    git clone https://github.com/yeahhe365/InsightPDF.git
    cd InsightPDF
    ```

2.  **安装依赖**
    ```bash
    npm install
    ```

3.  **配置环境**
    在项目根目录创建 `.env.local` 文件，填入你的 API Key：
    ```env
    GEMINI_API_KEY=your_api_key_here
    ```
    *(或者启动后在网页设置面板中输入)*

4.  **启动服务**
    ```bash
    npm run dev
    ```
    访问 `http://localhost:3000` 即可使用。

---

## 📄 开源协议

MIT License © 2024 [yeahhe365](https://github.com/yeahhe365)
