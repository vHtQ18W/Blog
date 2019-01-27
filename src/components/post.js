import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import StyledLink from '../utils/styled-link'
import media from '../utils/media'

const Container = styled.div`
  padding: 1rem 2rem;
  margin: 2rem 0;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 120px;
  border-radius: 1rem;

  &:first-child {
    margin-top: 0;
  }

  ${ media.phone`
    margin: 1.4rem 0;
    padding: 0.7rem 1.4rem 0.1rem;

  ` }
`

const Title = styled.h4`
  margin-top: 0.2rem;
  margin-bottom: 0.2rem;
  font-size: 2.2rem;
`

const Post = ({ node, author }) => (
  <StyledLink to={node.fields.slug}>
    <Container>
      <Title>{node.frontmatter.title}</Title>
      <sub>
        <span>{node.frontmatter.date}</span>
        <span>&nbsp; - &nbsp;</span>
        <span>{author}</span>
      </sub>
      <p dangerouslySetInnerHTML={{ __html: node.excerpt }} />
    </Container>
  </StyledLink>
)

Post.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.string.isRequired,
    frontmatter: PropTypes.shape({
      title: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
    }),
    fields: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }),
    excerpt: PropTypes.string.isRequired,
  }),
  author: PropTypes.string.isRequired
}

export default Post
