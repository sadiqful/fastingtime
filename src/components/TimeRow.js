import { h } from 'preact';
import { format } from 'date-fns';

import FlexRow from './FlexRow';
import TimeLabel from './TimeLabel';

export default ({ fastHasStarted, startTime, endTime }) => (
  <FlexRow>
    <TimeLabel
      text={fastHasStarted ? 'Fast Started' : 'Fast Starts'}
      time={format(startTime, 'hh:mma')}
    />
    <div class="separator" />
    <TimeLabel text={'Fast Ends'} time={format(endTime, 'hh:mma')} />
  </FlexRow>
);
