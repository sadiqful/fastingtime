import { h, Component } from 'preact';
import styled from 'preact-emotion';
import { format, subDays, isSameMinute } from 'date-fns';
import HijriDate, { toHijri } from 'hijri-date/lib/safe';
import { fastHasStarted, fastHasEnded } from '../utils';
import { setInterval, clearInterval } from 'requestanimationframe-timer';

import fastingTimes from '../times.json';

import NavBar from './NavBar';
import TimeRing from './TimeRing';
import TimeLabel from './TimeLabel';
import FlexRow from './FlexRow';
import StatusRow from './StatusRow';
import Button from './Button';
import Footer from './Footer';

// import locationIconUrl from '../assets/location.svg';

if (module.hot) {
  require('preact/debug');
}

const OuterContainer = styled('div')`
  @media only screen and (min-width: 600px) {
    display: flex;
  }

  @media only screen and (min-width: 600px) and (min-height: 720px) {
    min-height: 100vh;
  }
`;

const AppContainer = styled('div')`
  width: 100%;
  margin: auto;
  padding: 16px 24px;
  background-color: #fff;

  @media only screen and (min-width: 600px) {
    max-width: 375px;
  }

  @media only screen and (min-width: 600px) and (min-height: 720px) {
    box-shadow: 0 15px 35px rgba(50, 50, 93, 0.1),
      0 5px 15px rgba(0, 0, 0, 0.07);
    border-radius: 16px;
  }

  .separator {
    width: 1px;
    height: 56px;
    background-color: var(--light-grey);
  }
`;

// const LocationIcon = styled('div')`
//   width: 20px;
//   height: 20px;
//   background: url(${locationIconUrl});
// `;

export default class App extends Component {
  constructor() {
    super();
    const currentDateAndTime = new Date();
    this.state = {
      currentDateAndTime
    };
    this.lastMinute = currentDateAndTime;
  }

  componentDidMount() {
    this.timer = setInterval(() => {
      this.setState({ currentDateAndTime: Date.now() });
    }, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Only update if we're on a new minute
    return isSameMinute(this.lastMinute, nextState.currentDateAndTime)
      ? false
      : true;
  }

  componentDidUpdate(previousProps, previousState) {
    this.lastMinute = Date.now();
  }

  render() {
    const ramadanOffset = subDays(this.state.currentDateAndTime, 2);
    const islamicDate = toHijri(ramadanOffset).format('dS mmmm yyyy', {
      locale: 'en'
    });
    const islamicDay = toHijri(ramadanOffset).format('d');
    const gregorianDate = format(this.state.currentDateAndTime, 'Do MMMM YYYY');

    let startTime = fastingTimes[islamicDay].startTime;
    let endTime = fastingTimes[islamicDay].endTime;

    // WARNING WARNING WARNING
    // will cause a bug after 30/31 days - FIX
    startTime = fastHasEnded(this.state.currentDateAndTime, endTime)
      ? fastingTimes[parseInt(islamicDay) + 1].startTime
      : startTime;

    endTime = fastHasEnded(this.state.currentDateAndTime, endTime)
      ? fastingTimes[parseInt(islamicDay) + 1].endTime
      : endTime;

    const started = fastHasStarted(this.state.currentDateAndTime, startTime);

    return (
      <OuterContainer>
        <AppContainer>
          <NavBar islamicDate={islamicDate} gregorianDate={gregorianDate} />

          <StatusRow fastHasStarted={started} />

          <TimeRing
            fastHasStarted={started}
            currentDateAndTime={this.state.currentDateAndTime}
            startTime={startTime}
            endTime={endTime}
          />

          <FlexRow>
            <TimeLabel
              text={started ? 'Fast Started' : 'Fast Starts'}
              time={format(startTime, 'hh:mma')}
            />
            <div class="separator" />
            <TimeLabel text={'Fast Ends'} time={format(endTime, 'hh:mma')} />
          </FlexRow>

          <Button text={'Rules For Fasting'} />

          <Footer />
        </AppContainer>
      </OuterContainer>
    );
  }
}
