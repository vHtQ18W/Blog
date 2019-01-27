import React from 'react'
import { Link, graphql } from 'gatsby'

import Layout from '../components/layout'
import { Container, Title, LinkList, Header, Block } from './post-styles'

class BlogPostTemplate extends React.Component {
  render () {
    const post = this.props.data.markdownRemark
    const siteTitle = this.props.data.site.siteMetadata.title
    const author = this.props.data.site.siteMetadata.author
    const { previous, next } = this.props.pageContext

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <Container>
          <Header>
            <Title>{post.frontmatter.title}</Title>
            <sub
              css={`
                color: rgba(0, 0, 0, 0.8);
              `}
            >
              <Block>{post.frontmatter.date}</Block>
              <Block>&nbsp; - &nbsp;</Block>
              <Block>{author}</Block>
            </sub>
          </Header>
          <div
            css={`
              margin: 5rem 0;
            `}
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
          <LinkList>
            <li>
              {previous && (
                <Link to={previous.fields.slug} rel="prev">
                  PREV:&nbsp;&nbsp;&nbsp;{previous.frontmatter.title}
                </Link>
              )}
            </li>
            <li>
              {next && (
                <Link to={next.fields.slug} rel="next">
                  NEXT:&nbsp;&nbsp;&nbsp;{next.frontmatter.title}
                </Link>
              )}
            </li>
          </LinkList>
        </Container>
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt
      html
      fields {
        readingTime {
          text
        }
      }
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
      }
    }
  }
`
