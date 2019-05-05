import { h } from 'preact';
import styled from 'preact-emotion';

import { NAV_BAR_VARIANTS } from './variants';

const NavBar = styled('nav')`
  display: flex;
  align-items: center;
  min-height: 47px;

  text-align: center;

  .titles {
    width: calc(100% - 48px);
  }

  h4 {
    font-weight: 800;
  }

  p {
    font-weight: 500;
    color: var(--grey);
  }
`;

const Icon = styled('div')`
  width: 24px;
  height: 24px;

  background: url(${props => props.icon});
  background-size: contain;
  background-repeat: no-repeat;

  cursor: pointer;
`;

const SmallIcon = styled(Icon)`
  width: 20px;
  height: 20px;
`;

export default ({ title, subtitle, icon, onClick, variant }) => (
  <NavBar>
    {variant === NAV_BAR_VARIANTS.SMALL_ICON ? (
      <SmallIcon icon={icon} onClick={onClick} />
    ) : (
      <Icon icon={icon} onClick={onClick} />
    )}
    <div className="titles">
      <h4>{title}</h4>
      <p>{subtitle}</p>
    </div>
  </NavBar>
);
