import { h, Component } from 'preact';
import styled from 'preact-emotion';
import { subDays } from 'date-fns';

import { mapRange, convertMinsToHrsMins, differenceInMinutes } from '../utils';

const Container = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;

  text-align: center;

  h1 {
    margin-top: 17px;
    font-size: 40px;
    font-weight: 800;
    line-height: 33px;

    span {
      margin-left: 2px;
      margin-right: 2px;
      font-size: 24px;
      font-weight: 500;
      letter-spacing: 0;
    }
  }

  h2 {
    font-weight: 800;
    color: var(--grey);
  }

  h3 {
    font-weight: 700;
    color: var(--grey);
  }
`;

const Ring = styled('div')`
  position: relative;

  div {
    position: absolute;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    top: 30%;
  }

  .progress-ring__circle {
    transition: 0.35s stroke-dashoffset;
    // axis compensation
    transform: rotate(-90deg);
    transform-origin: 50% 50%;
    stroke-linecap: round;
  }
`;

export default class TimeRing extends Component {
  renderTimeLeft() {
    const diffInMins = this.props.fastHasStarted
      ? differenceInMinutes(this.props.endTime, this.props.currentDateAndTime)
      : differenceInMinutes(
          this.props.startTime,
          this.props.currentDateAndTime
        );

    const text = this.props.fastHasStarted ? 'Fast Ends' : 'Fast Starts';

    const diff = convertMinsToHrsMins(diffInMins);
    const hourPlural = diff.hours === 1 ? 'hr' : 'hrs';
    const minPlural = diff.minutes === 1 ? 'min' : 'mins';

    // Prepend 0 when needed
    const mins = diff.minutes < 10 ? '0' + diff.minutes : diff.minutes;

    return (
      <div>
        <h1>
          {`${diff.hours}`}
          <span>{hourPlural}</span>
          {`${mins}`}
          <span>{minPlural}</span>
        </h1>
        <h3>Until</h3>
        <h2>{text}</h2>
      </div>
    );
  }

  calculateProgress() {
    // Used to offset the progress ring so it doesn't look like
    // it is 100% complete with > 10 mins still to go
    const OFFSET = 3;

    let percent = 0;

    if (this.props.fastHasStarted) {
      const totalTime = differenceInMinutes(
        this.props.endTime,
        this.props.startTime
      );
      const endTimeDifference = differenceInMinutes(
        this.props.endTime,
        this.props.currentDateAndTime
      );

      percent = mapRange({
        value: totalTime - endTimeDifference,
        currentLowerBound: 0,
        currentUpperBound: totalTime,
        targetLowerBound: 0,
        targetUpperBound: 100
      });
    } else {
      // Difference between yesterday's end time and the next start time
      // (using subDays method instead of using the actual time for yesterday
      // because accuracy isn't too important here - it will only be
      // a few mins in difference)
      const prevEndStartDifference = differenceInMinutes(
        this.props.startTime,
        subDays(this.props.endTime, 1)
      );

      const currentStartDifference = differenceInMinutes(
        this.props.startTime,
        this.props.currentDateAndTime
      );

      percent = mapRange({
        value: currentStartDifference,
        currentLowerBound: 0,
        currentUpperBound: prevEndStartDifference,
        targetLowerBound: 0,
        targetUpperBound: 100
      });
    }

    // Stop ring from starting from a negative
    const negativeStart = percent - OFFSET < 0 ? true : false;
    return negativeStart ? percent : percent - OFFSET;
  }

  updateProgressBar(percent) {
    const offset = this.circumference - (percent / 100) * this.circumference;
    this.circle.style.strokeDashoffset = offset;
  }

  componentDidMount() {
    this.circle = document.querySelector('.progress-ring__circle');
    this.radius = this.circle.r.baseVal.value;
    this.circumference = this.radius * 2 * Math.PI;

    this.circle.style.strokeDasharray = `${this.circumference} ${
      this.circumference
    }`;

    this.circle.style.strokeDashoffset = `${this.circumference}`;

    this.updateProgressBar(this.calculateProgress());
  }

  componentDidUpdate() {
    this.updateProgressBar(this.calculateProgress());
  }

  render() {
    const gradients = {
      red: ['#FF8315', '#F63333'],
      green: ['#99E65B', '#7DBC4B']
    };

    return (
      <Container>
        <Ring>
          <svg class="progress-ring" width="300" height="300">
            <circle
              class="base-ring__circle"
              stroke="#eaedef"
              stroke-width="10"
              fill="transparent"
              r="120"
              cx="150"
              cy="150"
            />
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop
                  offset="0%"
                  style={`stop-color:${
                    this.props.fastHasStarted
                      ? gradients.red[0]
                      : gradients.green[0]
                  };stop-opacity:1`}
                />
                <stop
                  offset="100%"
                  style={`stop-color:${
                    this.props.fastHasStarted
                      ? gradients.red[1]
                      : gradients.green[1]
                  };stop-opacity:1`}
                />
              </linearGradient>
            </defs>
            <circle
              class="progress-ring__circle"
              stroke="url(#grad1)"
              stroke-width="15"
              fill="transparent"
              r="120"
              cx="150"
              cy="150"
            />
          </svg>

          {this.renderTimeLeft()}
        </Ring>
      </Container>
    );
  }
}
