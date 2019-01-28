---
title: '使用 Gatsby 快速构建博客'
date: '2019-01-28T00:00:00'
---

[GatsbyJS](https://www.gatsbyjs.org/) 是一个现代化的静态网站构建系统，拥有一个开
源的强大生态圈。利用 React + GraphQL 提供数据的渲染。我从 Jekyll 切换到了
GatsbyJS，并且使用 Netlify 进行网站的自动构建与发布。

# 为什么使用 GatsbyJS

传统的博客网站，例如 WordPress，将所有的服务集成与一体，提供一站式的服务管理。
而现在的做法是使用不同的服务实现不同的功能，每一个服务只做好一件事。比如，使用
React 构建组件化的网站，使用 styled-compobents 添加样式，发布到 Github Pages 或
者是 Netlify，利用 Algolia 进行搜索。你还可以使用 Contentful 进行内容管理。 而
GatbyJS 就是提供这些接口，方便接入各种服务。

# 配置 GatsbyJS 

使用 npm 安装 GatbyJS 的 cli 工具

```bash
λ npm install --global gatsby-cli
```

新建一个新的 GatsbyJS 项目，这将会从 [gatsby-starter-defalt](https://github.com/gatsbyjs/gatsby-starter-default.git
) 拉取 repo。

```bash
λ gatsby new Blog
```

进入该目录，你会看到这些内容

```bash
λ cd Blog; tree -L 1
.
├── gatsby-browser.js
├── gatsby-config.js
├── gatsby-node.js
├── gatsby-ssr.js
├── LICENSE
├── node_modules
├── package.json
├── package-lock.json
├── README.md
├── src
└── yarn.lock
```

其中，gatsby-config.js 用来进行 GatbyJS 的配置。

进行进一步的定制，可以参照官方的进一步的
[tutorial](https://www.gatsbyjs.org/tutorial/)，其中包含如何索引 markdown 文件，
如何给组件传递数据。

在完成进一步的定制后，可以在本地的 server 预览你的网站，执行下面的命令打开
localhost:8000 即可。

```bash
λ gatsby develop
```

# 发布你的网站

你可以使用 Github Pages 服务或者 Netlify 来快速无成本的发布你的网站。如果你想使
用 Github Pages，对网站项目进行 build 后，将 public 目录 push 到
YourUserName.github.io 仓库即可。

```bash
λ gatsby build
```

如果使用 Netlify，你需要将项目 push 到 github 的一个 repo 中。然后在 Netlify 上绑定
你的 github 帐号，指定你要发布的 repo，添加 cname 记录，修改 DNS 设置，即可发布。
