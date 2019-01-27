import React, { Component } from 'react'
import { graphql } from 'gatsby'
import styled from 'styled-components'

import Layout from '../components/layout'
import Post from '../components/post'
import media from '../utils/media'

const MAIN = styled.div`
  margin-top: 4rem;
  
  ${ media.phone`
    margin-top: 2rem; 
  ` }
`

class BlogIndex extends Component {
  render () {
    const { data } = this.props
    const posts = data.allMarkdownRemark.edges
    return (
      <Layout>
        <MAIN>
          {posts.map(({ node }) => {
            return <Post key={node.id} node={node}
              author={data.site.siteMetadata.author} />
          })}
        </MAIN>
      </Layout>
    )
  }
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        author
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
      edges {
        node {
          id
          excerpt(pruneLength: 160)
          fields {
            slug
            readingTime {
              text
            }
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
          }
        }
      }
    }
  }
`
