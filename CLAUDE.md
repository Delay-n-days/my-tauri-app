# Tauri 应用模板

## 项目概述

基于 Tauri v2 + React 19 + TypeScript + shadcn/ui 构建的现代桌面应用模板。

## 架构

- **前端**: React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui
- **后端**: Tauri v2 (Rust)
- **构建**: bun + Vite + Cargo

## 模块索引

| 模块 | 路径 | 技术栈 | 职责 |
|------|------|--------|------|
| 前端 | `src/` | TypeScript/React | UI、组件、样式、国际化 |
| 后端 | `src-tauri/` | Rust | 系统调用、原生功能 |
| 文档 | `docs/` | Markdown | 项目指南和参考 |

## 开发

### 环境要求

- Node.js >= 18
- bun >= 1.0
- Rust >= 1.70

### 命令

```bash
bun install        # 安装依赖
bun tauri dev      # 启动开发服务器
bun tauri build    # 构建生产版本
bun format         # 格式化代码
```

## 编码规范

### TypeScript/React

- TypeScript 严格模式
- 函数组件配合 Hooks
- 路径别名: `@/` 映射到 `src/`
- 使用 Prettier 格式化
- **注释和日志必须使用英文**
- 保持代码简洁

### Rust

- 遵循 Rust 命名约定
- 使用 `#[tauri::command]` 宏定义 Tauri 命令
- **注释和日志必须使用英文**

### 样式

- Tailwind CSS v4
- shadcn/ui 组件系统
- CSS 变量用于主题（亮色/暗色模式）

### 代码质量规则

1. **语言**: 所有注释、控制台日志和错误消息必须使用英文
2. **整洁性**: 删除不必要的代码，避免冗余实现
3. **简洁性**: 遵循 KISS 原则 - 保持实现简单直接

## 关键约定

1. **添加组件**: `bunx shadcn@latest add <component>`
2. **路径别名**: 使用 `@/` 前缀，例如 `import { Button } from "@/components/ui/button"`
3. **Tauri 命令**: 在 `src-tauri/src/lib.rs` 中定义，通过 `invoke()` 调用

### 示例: Tauri 命令

```typescript
// 前端
import { invoke } from "@tauri-apps/api/core";
const result = await invoke("command_name", { arg1: value });
```

```rust
// 后端 (src-tauri/src/lib.rs)
#[tauri::command]
fn command_name(arg1: &str) -> String {
    format!("Result: {}", arg1)
}
```

---

## 前端模块 (src)

### 职责

UI 渲染、交互和样式。

### 入口点

- **入口**: `src/main.tsx`
- **页面选择器**: `src/main.tsx` 根据 `window.location.pathname` 懒加载页面组件
- **页面**: `src/pages/home.tsx`、`src/pages/about.tsx`、`src/pages/settings.tsx`
- **构建工具**: Vite (`vite.config.ts`)

### 核心依赖

- react@19.1.0, react-dom@19.1.0
- @tauri-apps/api@2, @tauri-apps/plugin-opener@2
- tailwindcss@4.2.1, shadcn/ui 组件
- lucide-react@0.577.0 (图标)
- i18next, react-i18next (国际化)

### 配置

- `tsconfig.json` - TypeScript 配置（严格模式）
- `vite.config.ts` - Vite 构建配置
- `components.json` - shadcn/ui 配置
- `src/i18n/index.ts` - i18n 配置

### 国际化

项目使用 i18next 实现多语言支持:

```typescript
// 在组件中使用
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t("app.title")}</h1>
      <button onClick={() => i18n.changeLanguage("zh")}>
        切换语言
      </button>
    </div>
  );
}
```

**支持的语言**: 英文 (en)、中文 (zh)

**翻译文件**: `src/i18n/locales/{en,zh}.json`

详细使用请查看 [国际化文档](./docs/I18N.md)。

### Toast 通知

项目使用 sonner（通过 shadcn/ui）实现 toast 通知:

```typescript
// 导入 toast 函数
import { toast } from "sonner";

// 显示成功提示
toast.success("操作完成！");

// 显示错误提示
toast.error("出错了！");

// 显示信息提示
toast.info("信息消息");

// 显示警告提示
toast.warning("警告消息");

// 配合国际化使用
import { useTranslation } from "react-i18next";
const { t } = useTranslation();
toast.success(t("settings.shortcut.setSuccess", { shortcut: "Ctrl+Shift+A" }));
```

**设置要求**:
1. 在页面/应用根组件添加 `<Toaster />` 组件
2. 从 `@/components/ui/sonner` 导入

**示例**:
```typescript
import { Toaster } from "@/components/ui/sonner";

export default function Settings() {
  return (
    <ThemeProvider>
      <Toaster />
      <SettingsContent />
    </ThemeProvider>
  );
}
```

**功能特性**:
- 自动适配亮色/暗色主题
- 支持带变量插值的国际化
- 自动关闭（默认: 4秒）
- 可自定义图标和样式

---

## 后端模块 (src-tauri)

### 职责

系统级调用、原生功能、跨平台桌面应用包装器。

### 入口点

- **入口**: `src-tauri/src/main.rs`
- **应用逻辑**: `src-tauri/src/lib.rs`
- **构建配置**: `Cargo.toml`

### 命令

| 命令 | 参数 | 返回值 | 描述 |
|------|------|--------|------|
| `greet` | `name: &str` | `String` | 示例问候命令 |

### 核心依赖

- tauri@2 - Tauri 框架
- tauri-plugin-opener@2 - 打开外部链接
- serde@1, serde_json@1 - 序列化

### 配置

- `tauri.conf.json` - Tauri 应用配置
- `capabilities/default.json` - 权限配置

**关键设置**:
- Product: `tauri-app-template`
- Identifier: `com.template.tauri-app`
- Window: 800x600
- Dev Port: 1420

---

## 文档 (docs)

### 可用指南

- **AUTO_UPDATE.md** - Tauri 自动更新配置和 GitHub Actions 设置
- **I18N.md** - 国际化指南
- **GLOBAL_SHORTCUT.md** - 全局快捷键指南

### 添加文档

添加新功能时，创建相应文档:

1. 创建文档: `docs/FEATURE.md`
2. 如需要，更新 README.md
