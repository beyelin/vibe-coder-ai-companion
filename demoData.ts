export const demoData = {
  explanation: `好的！这是为您准备的项目需求文档演示。您可以直接在右侧的预览窗口中点击并编辑文档的任何部分，甚至更换下方的架构图，以方便您向听众进行展示。`,
  code: `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>项目需求说明文档 - Vibe Coder</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        [contenteditable="true"] {
            cursor: pointer;
            transition: all 0.2s ease-in-out;
        }
        [contenteditable="true"]:hover {
            outline: 2px dashed #4f46e5;
            background-color: rgba(79, 70, 229, 0.05);
            border-radius: 4px;
        }
        [contenteditable="true"]:focus {
            outline: 2px solid #4f46e5;
            background-color: rgba(79, 70, 229, 0.1);
            border-radius: 4px;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
        }
        h1, h2, h3 {
            font-weight: bold;
        }
        ul {
            list-style-position: inside;
            padding-left: 1rem;
        }
    </style>
</head>
<body class="bg-gray-900 text-gray-300 flex justify-center min-h-screen p-4 sm:p-8">

    <div class="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-8 sm:p-12 border border-gray-700 overflow-y-auto">
        <header class="text-center border-b border-gray-700 pb-6 mb-8">
            <h1 contenteditable="true" class="text-3xl sm:text-4xl font-bold text-cyan-300">项目需求说明文档</h1>
            <p contenteditable="true" class="text-indigo-400 mt-2 text-lg">Vibe Coder AI Companion</p>
        </header>
        
        <section class="mb-8">
            <h2 contenteditable="true" class="text-2xl text-cyan-400 mb-4">1. 项目概述</h2>
            <p contenteditable="true" class="text-gray-400 leading-relaxed">
                “Vibe Coder AI Companion” 是一款创新的、AI驱动的前端开发辅助工具。它旨在通过结合强大的代码生成能力和个性化的情感伙伴，重塑“沉浸式编码 (Vibe Coding)”体验，将等待时间转化为积极、有趣的互动体验，提升开发者的幸福感和创造力。
            </p>
        </section>

        <section class="mb-8">
            <h2 contenteditable="true" class="text-2xl text-cyan-400 mb-4">2. 核心功能</h2>
            <ul contenteditable="true" class="space-y-2 text-gray-400 leading-relaxed">
                <li><strong class="text-gray-300">高效生成:</strong> 将自然语言需求快速转化为功能完备、可独立运行的Web应用代码。</li>
                <li><strong class="text-gray-300">即时反馈:</strong> 提供代码和实时预览的同步视图，让用户可以立即看到生成结果。</li>
                <li><strong class="text-gray-300">情感陪伴:</strong> 通过一个可爱的 AI 伙伴，缓解等待时的焦虑，提供情感支持和鼓励。</li>
                <li><strong class="text-gray-300">沉浸式体验:</strong> 支持自定义伙伴形象、动态生成编码壁纸和背景音乐。</li>
            </ul>
        </section>

        <section class="mb-8">
            <h2 contenteditable="true" class="text-2xl text-cyan-400 mb-4">3. 系统架构</h2>
            <div class="bg-gray-900/50 p-6 rounded-lg border border-gray-700 text-center">
                 <div class="relative w-full max-w-lg mx-auto mb-4">
                    <img id="architecture-diagram" class="rounded-lg w-full h-full object-cover" src="https://i.imgur.com/9vA7s5A.png" alt="System Architecture Diagram">
                </div>
                <label for="image-upload" class="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2 px-4 rounded-full transition-colors cursor-pointer inline-block">
                    更换架构图
                </label>
                <input id="image-upload" type="file" accept="image/*" class="hidden">
            </div>
        </section>

    </div>

    <script type="text/javascript">
        const imgElement = document.getElementById('architecture-diagram');
        const fileInputElement = document.getElementById('image-upload');

        if(fileInputElement && imgElement) {
            fileInputElement.addEventListener('change', (event) => {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        imgElement.src = e.target.result;
                    }
                    reader.readAsDataURL(file);
                }
            });
        }
    </script>

</body>
</html>
`
};
