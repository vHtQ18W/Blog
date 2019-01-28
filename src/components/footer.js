import React, { Component } from 'react'
import styled from 'styled-components'
import { FaCopyright, FaGithub } from 'react-icons/fa'
import media from '../utils/media'

const Container = styled.nav`
  height: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
  display: flex;
  margin-top: 4rem;
`

const Content = styled.h2`
  display: inline-block;
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0.1rem;
  margin: 0;
`

const Block = styled.div`
  display: flex;
  float: left;
  padding-right: 0.5rem;
  ${ media.phone`
    float: unset;
    padding: 0;
    justify-content: center;
  ` }
`

const Footer = class extends Component {
  render () {
    return (
      <Container>
        <Content>
          <Block>
            <FaCopyright style={{
              position: `relative`,
              top: `0.25rem`,
              paddingRight: `0.3rem`
            }}/>
            2019 Burgess Chang.
          </Block>
          <Block>
            Build with&nbsp;
            <a href="www.gatsbyjs.org">
            Gatsby
            </a>.
          </Block>
          <Block>
          Code available at
            <FaGithub style={{
              position: `relative`,
              top: `0.25rem`,
              paddingRight: `0.3rem`,
              paddingLeft: `0.3rem`
            }} />
            <a href="https://github.com/vHtQ18W">
            vHtQ18W/Blog
            </a>.
          </Block>
          <Block>
            Work under
            <a href="https://creativecommons.org/licenses/by/3.0/"
              style={{
                paddingLeft: `0.3rem`
              }}>
            CC-BY-3.0</a>.
          </Block>
        </Content>
      </Container>
    )
  }
}

export default Footer
