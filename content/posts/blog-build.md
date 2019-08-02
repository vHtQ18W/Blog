+++
title = "Use Hogo build my blog"
author = ["Burgess Chang"]
date = 2019-08-02
lastmod = 2019-08-02T15:42:47+08:00
draft = false
+++

## What is Hugo {#what-is-hugo}

[Hugo](https://gohugo.io/) is static site generators by go-lang, it can easy generate html content
from markdown file. I have used [Gatsby](https://www.gatsbyjs.org/) generate my blog for half year, but it
org-mode support is poor. I use Emacs and Org-mode write my blog and document,
so I choose hugo and ox-hugo build my blog from '.org' file.


## Quick Start {#quick-start}


### Install hugo {#install-hugo}

My linux distribution is ArchLinux, use this command can easy install Hugo.

```bash
pacman -S hugo
```

Other distribution also can install Hugo from repo or source.


### Create blog directory {#create-blog-directory}

After install hugo, you need create a new Hugo site folder.

```bash
hugo new site blog
```


### Post first \`Hello World\` blog {#post-first-hello-world-blog}

For test Hugo server is normally run, we need manually create content file.

```bash
hugo new posts/my-first-post.md
```


### Chose a theme {#chose-a-theme}

Then we need choose a theme custom our site, in order to modification theme, I
fork this theme from author's repo. And then I add forked theme as submodule in
_theme_ folder.

```bash
git submodule add https://github.com/vHtQ18W/paper theme/paper
```

After clone theme repo to this folder, edit the \`config.toml\` add this line.

```toml
theme = "paper"
```


### Test Hugo server {#test-hugo-server}

It can run Hugo server by use:

```bash
hugo server -D
```

\`-D\` means draft. Then we can visit <http://localhost:1313/> browse our site.


## Configure Emacs {#configure-emacs}

My emacs config is base on a fork from `doom-emacs`, it config like
`use-package`. I make all blog config as a private module.


### Configure ox-hugo {#configure-ox-hugo}

First, define the package that you use at \`pacakges.el\`.

```lisp
(package! ox-hugo)
```

Then, make ox-hugo load after ox load. Edit \`config.el\` add this content.

```lisp
(def-package! ox-hugo
  :after ox)
```


### Use org-capture-templates create blog {#use-org-capture-templates-create-blog}

After read [ox-hugo tutorial](https://ox-hugo.scripter.co/doc/org-capture-setup/), I use org-capture create new blog.
Edit \`autoload.el\`:

```lisp
;;; burgess/blog/autoload.el -*- lexical-binding: t; -*-

;;;###autoload
(defun org-hugo-new-subtree-post-capture-template ()
  "Returns `org-capture' template string for new Hugo post.
See `org-capture-templates' for more information."
  (let* ((title (read-from-minibuffer "Post Title: ")) ;Prompt to enter the post title
         (fname (org-hugo-slug title)))
    (mapconcat #'identity
               `(
                 ,(concat "* TODO " title)
                 ":PROPERTIES:"
                 ,(concat ":EXPORT_HUGO_BUNDLE: " fname)
                 ":EXPORT_FILE_NAME: index"
                 ":END:"
                 "%?\n")                ;Place the cursor here finally
               "\n")))
```

Add helper function _org-hugo-new-subtree-post-capture-template_ to
_org-capture-templates_ list.

```lisp
(add-to-list 'org-capture-templates
             '("h"                ;`org-capture' binding + h
               "Hugo post"
               entry
               ;; It is assumed that below file is present in `org-directory'
               ;; and that it has a "Blog Ideas" heading. It can even be a
               ;; symlink pointing to the actual location of all-posts.org!
               (file+headline "~/Documents/Org/posts.org" "INBOX")
               ;;(file+olp "/home/burgess/Documents/Org/posts.org" "blog")
               (function org-hugo-new-subtree-post-capture-template))))
```

Now you can press `M-X org-capture h` create new blog.


## Published blog {#published-blog}
