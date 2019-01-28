import React, { Component } from 'react'
import PropTypes from 'prop-types'
import styled, { createGlobalStyle } from 'styled-components'
import { StaticQuery, graphql } from 'gatsby'
import { Helmet } from 'react-helmet'

import Header from './header'
import Footer from './footer'
import media from '../utils/media'

const GlobalStyles = createGlobalStyle`
  @font-face {
    font-family: system;
    font-style: normal;
    font-weight: 300;
    src: local('.SFNSText-Light'), local('.HelveticaNeueDeskInterface-Light'),
      local('.LucidaGrandeUI'), local('Ubuntu Light'), local('Segoe UI Light'),
      local('Roboto-Light'), local('DroidSans'), local('Tahoma');
  }

  :root {
    font-size: 10px;
  }

  body {
    font-family: 'system';
    margin: 0;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    color: rgba(0, 0, 0, 0.8);
    min-height: 100vh;
    position: relative;
    font-size: 1.6rem;
    background-color: #FAFAFA;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Oswald', sans-serif;
  }

  h2 {
    font-size: 2.5rem;
  }

  h3 {
    font-size: 2.4rem;
  }

  h4 {
    font-size: 1.6rem;
  }
  
  code {
    font-family: Menlo,Monaco,"Courier New",Courier,monospace;
    word-break: break-word;
  }

  pre code {
    word-break: normal;
  }

  :not(pre) > code[class*="language-"], pre[class*="language-text"] {
    background-color: transparent;
    color: inherit;
    font-size: medium;
  }

  a {
    text-decoration: none;
  }
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 85vh;
  ${ media.phone`
    min-height: 75vh;
  ` }
`

const Content = styled.div`
  width: 60%;
  max-width: 728px;
  margin: 0 auto;
  flex: 1 0 auto;
  padding: var( — space) var( — space) 0;

  ${ media.tablet`
    width: 80%;
  ` }

  &:after {
    content: ‘\00a0’;
    display: block;
    margin-top: var( — space);
    height: 0;
    visibility: hidden;
  }
`

class Layout extends Component {
  render () {
    const { children } = this.props
    return (
      <StaticQuery
        query={graphql`
          query SiteTitleQuery {
            site {
              siteMetadata {
                title
              }
            }
          }
        `}
        render={data => (
          <>
            <Helmet>
              <meta charSet="utf-8" />
              <title>{data.site.siteMetadata.title}</title>
              <link rel="canonical" href="https://blog.bsch.pw" />
            </Helmet>
            <Header title={data.site.siteMetadata.title} />
            <Container>
              <Content>
                {children}
              </Content>
            </Container>
            <Footer></Footer>
            <GlobalStyles />
          </>
        )}
      />
    )
  }
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
