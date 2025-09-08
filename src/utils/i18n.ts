export const i18n = {
  en: {
    // Global Settings
    global_settings: 'Global Settings',
    auto_fallback: 'Auto fallback to other CDNs',
    auto_fallback_desc: 'Automatically try other sources if first one fails',
    show_notifications: 'Show notifications',
    show_notifications_desc: 'Display success/error messages when loading packages',
    enable_caching: 'Enable caching',
    enable_caching_desc: 'Cache search results and version information',

    // CDN Providers
    cdn_providers: 'CDN Providers',
    cdn_providers_desc: 'Drag to reorder priority. Disabled providers will be skipped.',

    // Custom Sources
    add_custom_source: 'Add Custom CDN Source',
    custom_source_name: 'Name',
    custom_source_name_placeholder: 'My Custom CDN',
    custom_source_description: 'Description',
    custom_source_description_placeholder: 'Custom CDN description',
    js_template: 'JavaScript Template',
    js_template_desc: 'Use {package} and {version} placeholders',
    css_template: 'CSS Template',
    add_custom_source_btn: 'Add Custom Source',

    // Usage Examples
    usage_examples: 'Usage Examples',
    basic_usage: 'Basic usage',
    advanced_features: 'Advanced features',
    es_modules: 'ES modules',
    css_imports: 'CSS imports',
    search_packages: 'Search packages',
    list_versions: 'List versions',
    get_help: 'Get help',
    show_all_commands: 'Show all commands',

    // Common
    advanced_settings: 'Advanced Settings',
    loading: 'Loading...',
    help_docs: 'Help & Docs',
    console_importer: 'Console Importer',
    quick_settings: 'Quick Settings',
    active_cdn_providers: 'Active CDN Providers',
  },
  zh: {
    // 全局设置
    global_settings: '全局设置',
    auto_fallback: '自动切换到其他 CDN',
    auto_fallback_desc: '当第一个源失败时自动尝试其他源',
    show_notifications: '显示通知',
    show_notifications_desc: '加载包时显示成功/错误消息',
    enable_caching: '启用缓存',
    enable_caching_desc: '缓存搜索结果和版本信息',

    // CDN 提供商
    cdn_providers: 'CDN 提供商',
    cdn_providers_desc: '拖拽重新排序优先级。已禁用的提供商将被跳过。',

    // 自定义源
    add_custom_source: '添加自定义 CDN 源',
    custom_source_name: '名称',
    custom_source_name_placeholder: '我的自定义 CDN',
    custom_source_description: '描述',
    custom_source_description_placeholder: '自定义 CDN 描述',
    js_template: 'JavaScript 模板',
    js_template_desc: '使用 {package} 和 {version} 占位符',
    css_template: 'CSS 模板',
    add_custom_source_btn: '添加自定义源',

    // 使用示例
    usage_examples: '使用示例',
    basic_usage: '基本用法',
    advanced_features: '高级功能',
    es_modules: 'ES 模块',
    css_imports: 'CSS 导入',
    search_packages: '搜索包',
    list_versions: '列出版本',
    get_help: '获取帮助',
    show_all_commands: '显示所有命令',

    // 通用
    advanced_settings: '高级设置',
    loading: '加载中...',
    help_docs: '帮助和文档',
    console_importer: 'Console Importer',
    quick_settings: '快速设置',
    active_cdn_providers: 'CDN 提供商',
  },
};

export function t(key: string, lang: string = 'en'): string {
  return i18n[lang as keyof typeof i18n]?.[key as keyof typeof i18n.en] || key;
}

export function detectLanguage(): string {
  // 检测浏览器语言
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('zh')) {
    return 'zh';
  }
  return 'en';
}
