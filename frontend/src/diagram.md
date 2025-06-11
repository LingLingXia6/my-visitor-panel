# 系统架构图

## 系统路由架构

```mermaid
graph TD
    Client[用户请求] --> Router[React Router]
    Router --> Public[公开路由]
    Router --> Auth[认证路由]
    
    Public --> VisitorForm[访客表单页]
    Public --> VisitorCheck[访客检查页]
    
    Auth --> UserProvider[用户上下文]
    UserProvider --> Login[登录页面]
    UserProvider --> Protected[受保护路由]
    
    Protected --> Guard[路由守卫]
    Guard --> MainApp[主应用]
    
    MainApp --> Users[用户管理]
    MainApp --> Forms[表单管理]
    MainApp --> Visitors[访客管理]
    MainApp --> Settings[系统设置]





    graph TD
    A[用户访问] --> B[路由分发]
    B --> C[公开访问]
    B --> D[认证访问]
    
    C --> C1[访客表单]
    C --> C2[访客查询]
    
    D --> D1[登录验证]
    D1 --> D2[管理后台]
    
    D2 --> E1[用户管理]
    D2 --> E2[访客管理]
    D2 --> E3[表单管理]
    D2 --> E4[系统设置]