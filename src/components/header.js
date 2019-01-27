import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import BurgessIcon from '../images/burgess.jpeg'
import StyledLink from '../utils/styled-link'
import media from '../utils/media'

const Container = styled.nav`
  height: 6.25rem;
  display: flex;
  align-items: center;
`

const Content = styled.div`
  width: 60%;
  max-width: 728px;
  margin: 0 auto;

  ${ media.tablet`
    width: 80%;
  ` }

  ${ media.phone`
    margin-top: 1.2rem;
  ` }
`

const LogoType = styled.div`
  display: flex;
  flex-direction: "column";
  flex-shrink: 0;
  width: auto;
  height: 4.25rem;
  align-items: center;
`

const Logo = styled.div`
  display: inline-block;
  width: 4.25rem;
  height: 4.25rem;
  border-radius: 50% 50%;
  overflow: hidden;
  margin: 0 1.25rem 0 0;
  border: 1px solid #eeeeee;
`

const Type = styled.div`
  color: #333333;
`
const Typeh1 = styled.h1`
  font-size: 1.35em;
  font-weight: 400;
  margin: 0 0 5px 0;
  letter-spacing: -0.04em;
  line-height: 1.1;
`

const Typeh2 = styled.h2`
  olor: #666666; 
  font-weight: 400;
  font-size: .8em;
  letter-spacing: 0;
  margin: 0;
`

const Header = ({ title }) => (
  <Container>
    <Content>
      <StyledLink to={'/'}>
        <LogoType>
          <Logo>
            <img
              style={{
                width: `100%`
              }}
              src={BurgessIcon} />
          </Logo>
          <Type>
            <Typeh1>Burgess Chang</Typeh1>
            <Typeh2>A pin a day is a groat a year.</Typeh2>
          </Type>
        </LogoType>
      </StyledLink>
    </Content>
  </Container>
)

Header.defaultProps = {
  title: '',
}

Header.propTypes = {
  title: PropTypes.string,
}

export default Header
